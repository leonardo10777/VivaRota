# 🗺️ VivaRota

Aplicativo mobile de navegação segura para pedestres. Permite reportar incidentes em tempo real (assaltos, falta de iluminação, áreas isoladas) e receber rotas que desviam dessas áreas de risco.

---

## 👥 Time

| Membro | Responsabilidade |
|--------|-----------------|
| Leonardo Santana | Mapa e Rotas |
| Kauã Diodato | Mapa e Rotas |
| Kelvin Vargas | Login, Cadastro e Onboarding |
| Matheus Marinho | Tela inicial e Perfil do usuário |
| Nicolas Ferreira | Reportar incidentes, Notificações e SOS |

---

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React Native + Expo |
| Mapa | Mapbox |
| Backend | Spring Boot (Java 17) |
| Banco | PostgreSQL 17 + PostGIS |
| Autenticação | JWT |
| Build | EAS (Expo Application Services) |

---

## 📁 Estrutura de Branches

```
main       ← Frontend completo (React Native)
Versão1    ← Backend completo (Spring Boot)
develop    ← Branch de desenvolvimento do frontend
```

---

## ✅ Pré-requisitos

- [Java JDK 17+](https://adoptium.net)
- [Node.js 18+](https://nodejs.org)
- [PostgreSQL 17+](https://www.postgresql.org/download)
- [Git](https://git-scm.com)
- Conta no [Expo](https://expo.dev)
- Conta no [Mapbox](https://mapbox.com)

---

## 🚀 Como Rodar

### 1. Clone o repositório

```bash
mkdir ~/VivaRota && cd ~/VivaRota

# Frontend
git clone https://github.com/K4u4z/VivaRota.git VivaRota-App
cd VivaRota-App && git checkout main && npm install && cd ..

# Backend
git clone https://github.com/K4u4z/VivaRota.git VivaRota
cd VivaRota && git checkout Versão1
```

---

### 2. Configure o banco de dados

Crie o banco e ative o PostGIS:

```sql
CREATE DATABASE vivarota_db;
\c vivarota_db
CREATE EXTENSION postgis;
```

Suba o backend uma vez para o Hibernate criar as tabelas automaticamente, depois execute:

```sql
-- Trigger que preenche localização PostGIS automaticamente
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
INSERT INTO tipo_incidente_peso VALUES
  ('ASSALTO', 3), ('ASSEDIO', 3),
  ('SEM_ILUMINACAO', 2), ('AREA_ISOLADA', 2),
  ('ACIDENTE', 1), ('OUTROS', 1)
ON CONFLICT DO NOTHING;

-- Function de score de perigo da rota
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

Em `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/vivarota_db
spring.datasource.username=postgres
spring.datasource.password=SUA_SENHA
api.security.token.secret=SUA_CHAVE_SECRETA
mapbox.token=pk.SEU_TOKEN_MAPBOX
```

---

### 4. Configure o frontend

Crie o arquivo `.env` na raiz de `VivaRota-App`:

```bash
EXPO_PUBLIC_MAPBOX_TOKEN=pk.SEU_TOKEN_MAPBOX
EXPO_PUBLIC_API_URL=http://SEU_IP:8080
```

Para descobrir seu IP:
```bash
# Mac
ipconfig getifaddr en0

# Windows
ipconfig
# Pegar o IPv4 da rede Wi-Fi
```

---

### 5. Rode o projeto

> **Ordem obrigatória:** PostgreSQL → Backend → Frontend

**Backend** (nova aba do terminal):
```bash
# Mac
cd ~/VivaRota/VivaRota && ./mvnw spring-boot:run

# Windows
cd %USERPROFILE%\VivaRota\VivaRota && mvnw.cmd spring-boot:run
```

**Frontend** (outra aba do terminal):
```bash
cd ~/VivaRota/VivaRota-App && npx expo start --clear
```

Apertar `s` para modo development build e escanear o QR code com o celular Android.

> O celular precisa estar na **mesma rede Wi-Fi** que o computador.

---

## 📱 APK de Desenvolvimento

Instale o APK no celular Android:
[Download APK](https://expo.dev/accounts/leo.work2077/projects/VivaRota-App/builds/09362ffd-e24c-4e7b-ac59-e2c27c654218)

Para gerar um novo APK:
```bash
cd ~/VivaRota/VivaRota-App
eas build --profile development --platform android
```

---

## ⚙️ Funcionalidades

- 🗺️ Mapa em tempo real com localização do usuário
- 🔍 Busca de destino com autocomplete
- 🛡️ Rota segura desviando de áreas de risco
- ⚡ Rota rápida pelo caminho mais curto
- 📍 Marcadores de incidentes por tipo e cor
- ⚠️ Reportar incidentes com GPS automático
- 🔔 Notificações de alertas próximos
- 🆘 Botão SOS com contagem regressiva
- 👤 Perfil do usuário com histórico
- 🔐 Autenticação com JWT

---

## ❗ Problemas Comuns

| Erro | Solução |
|------|---------|
| `Connection refused` no celular | IP mudou — atualizar `.env` com novo IP |
| `Network Error` no app | Backend não está rodando |
| `403 Forbidden` | Endpoint não liberado no `SecurityConfig.java` |
| Marcadores não aparecem | Incidentes expirados — renovar no banco |
| `lock file already exists` (Mac) | `rm /usr/local/var/postgresql@17/postmaster.pid` |
| Celular não acessa backend (Windows) | Liberar porta 8080 no Windows Defender Firewall |
