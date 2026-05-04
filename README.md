# 🗺️ VivaRota

App mobile de rotas seguras para pedestres com alertas de incidentes em tempo real.

---

## ✅ Requisitos

Instale antes de começar:

- [Java JDK 17+](https://adoptium.net)
- [Node.js 18+](https://nodejs.org)
- [PostgreSQL 16+](https://www.postgresql.org/download)
- [pgAdmin](https://www.pgadmin.org)
- [Git](https://git-scm.com)

Contas necessárias:
- [Expo](https://expo.dev) — para rodar e buildar o app
- [Mapbox](https://mapbox.com) — para mapas e rotas

---

## 🚀 Passo a Passo

### 1. Clone o repositório

```bash
git clone https://github.com/SEU_USUARIO/vivarota.git
cd vivarota
```

---

### 2. Configure o banco de dados

Abra o pgAdmin, crie o banco `vivarota_db` e execute os scripts abaixo em ordem no **Query Tool**:

```sql
-- Extensões
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigger de localização dos incidentes
CREATE OR REPLACE FUNCTION preencher_localizacao()
RETURNS TRIGGER AS $$
BEGIN
  NEW.localizacao = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_preencher_localizacao
BEFORE INSERT OR UPDATE ON incidentes
FOR EACH ROW EXECUTE FUNCTION preencher_localizacao();

-- Trigger de localização dos usuários
CREATE OR REPLACE FUNCTION preencher_localizacao_usuario()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.localizacao = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_localizacao_usuario
BEFORE INSERT OR UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION preencher_localizacao_usuario();

-- Pesos dos tipos de incidente
CREATE TABLE IF NOT EXISTS tipo_incidente_peso (tipo VARCHAR(50) PRIMARY KEY, peso INTEGER NOT NULL);

INSERT INTO tipo_incidente_peso VALUES
  ('ASSALTO', 3), ('ASSEDIO', 3),
  ('SEM_ILUMINACAO', 2), ('AREA_ISOLADA', 2),
  ('ACIDENTE', 1), ('OUTROS', 1)
ON CONFLICT (tipo) DO NOTHING;

-- Function de perigo da rota
CREATE OR REPLACE FUNCTION calcular_perigo_rota(rota_wkt TEXT, raio_metros FLOAT DEFAULT 100)
RETURNS FLOAT AS $$
DECLARE pontuacao FLOAT;
BEGIN
  SELECT COALESCE(SUM(sub.pontos), 0) INTO pontuacao
  FROM (
    SELECT tip.peso *
      CASE
        WHEN i.criado_em > NOW() - INTERVAL '1 hour'   THEN 1.0
        WHEN i.criado_em > NOW() - INTERVAL '6 hours'  THEN 0.7
        WHEN i.criado_em > NOW() - INTERVAL '12 hours' THEN 0.4
        ELSE 0.2
      END *
      COUNT(*) OVER (PARTITION BY i.tipo,
        CASE
          WHEN i.criado_em > NOW() - INTERVAL '1 hour'   THEN '1h'
          WHEN i.criado_em > NOW() - INTERVAL '6 hours'  THEN '6h'
          WHEN i.criado_em > NOW() - INTERVAL '12 hours' THEN '12h'
          ELSE 'antigo'
        END
      ) AS pontos
    FROM incidentes i
    JOIN tipo_incidente_peso tip ON tip.tipo = i.tipo
    WHERE i.expira_em > NOW()
    AND ST_DWithin(i.localizacao, ST_GeogFromText(rota_wkt), raio_metros)
  ) sub;
  RETURN pontuacao;
END;
$$ LANGUAGE plpgsql;
```

---

### 3. Configure o backend

Abra `VivaRota-API/src/main/resources/application.properties` e preencha:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/vivarota_db
spring.datasource.username=postgres
spring.datasource.password=SUA_SENHA

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

api.security.token.secret=SUA_CHAVE_SECRETA_32_CARACTERES_MINIMO

mapbox.token=pk.SEU_TOKEN_MAPBOX
```

---

### 4. Configure o frontend

Na pasta `VivaRota-App`, crie o arquivo `.env`:

```bash
cp .env.example .env
```

Preencha o `.env`:

```bash
EXPO_PUBLIC_MAPBOX_TOKEN=pk.SEU_TOKEN_MAPBOX
EXPO_PUBLIC_API_URL=http://SEU_IP:8080
```

Para descobrir seu IP no Windows:

```bash
ipconfig
# Procure: Adaptador Wi-Fi → IPv4 → 192.168.X.X
```

Instale as dependências:

```bash
cd VivaRota-App
npm install
```

---

### 5. Rode o projeto

Abra **3 terminais**:

**Terminal 1 — Backend:**
```bash
cd VivaRota-API
./mvnw spring-boot:run         # Mac/Linux
mvnw.cmd spring-boot:run       # Windows
```

**Terminal 2 — Frontend:**
```bash
cd VivaRota-App
npx expo start --dev-client --host lan
```

**Terminal 3 — ngrok (apenas se PC e celular estiverem em redes diferentes):**
```bash
ngrok http 8080
# Copie a URL gerada e coloque no .env como EXPO_PUBLIC_API_URL
```

No celular, abra o APK instalado e escaneie o QR Code do terminal.

---

## 📶 Precisa do ngrok?

| Situação | Solução |
|---|---|
| PC e celular no mesmo Wi-Fi | Não precisa — use o IP local |
| PC sem placa Wi-Fi | Use ngrok ou hotspot do celular |
| Celular em 4G e PC em Wi-Fi | Use ngrok |

**Instalando o ngrok:**
```bash
npm install -g ngrok
ngrok config add-authtoken SEU_TOKEN  # token em ngrok.com
ngrok http 8080
```

> A URL do ngrok muda ao reiniciar. Atualize o `.env` quando isso acontecer.

---

## 📦 Gerando o APK

```bash
cd VivaRota-App
eas login
eas build --platform android --profile development
```

O link para download aparece em [expo.dev](https://expo.dev) → seu projeto → Builds.

---

## ❗ Problemas comuns

| Erro | Solução |
|---|---|
| `failed to connect` no celular | PC e celular em redes diferentes → use ngrok |
| `403` nas requisições | Token JWT expirou → faça logout e login novamente |
| URL do ngrok parou de funcionar | Reiniciou o ngrok → atualize o `.env` |
| Marcadores não aparecem no mapa | Execute `UPDATE incidentes SET latitude = latitude, longitude = longitude;` no pgAdmin |
| Backend não sobe | Verifique se PostgreSQL está rodando e `application.properties` está preenchido |
