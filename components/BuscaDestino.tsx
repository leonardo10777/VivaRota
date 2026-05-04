import {
  buscarSugestoes,
  gerarSessionToken,
  recuperarCoordenadas,
  Sugestao,
} from "@/services/mapbox";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  onBuscarTexto: (endereco: string) => void;
  onBuscarCoordenadas: (coords: [number, number]) => void;
  onLimpar: () => void;
  onAbrirMenu: () => void;
  carregando: boolean;
  distancia?: string;
  duracao?: string;
  erro?: string | null;
  localizacaoUsuario?: [number, number];
}

export function BuscaDestino({
  onBuscarTexto,
  onBuscarCoordenadas,
  onLimpar,
  onAbrirMenu,
  carregando,
  distancia,
  duracao,
  erro,
  localizacaoUsuario,
}: Props) {
  const [texto, setTexto] = useState("");
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [buscandoSugestoes, setBuscandoSugestoes] = useState(false);
  const sessionToken = useRef(gerarSessionToken());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const selecionandoRef = useRef(false); // ← controla se está selecionando

  useEffect(() => {
    // Não rebusca se estiver selecionando uma sugestão
    if (selecionandoRef.current) return;

    if (texto.trim().length < 3) {
      setSugestoes([]);
      return;
    }

    // Não busca se terminar com número muito alto
    const ultimaPalavra = texto.trim().split(" ").pop() ?? "";
    const numero = parseInt(ultimaPalavra);
    if (!isNaN(numero) && numero > 9999) {
      setSugestoes([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setBuscandoSugestoes(true);
      try {
        const resultados = await buscarSugestoes(
          texto,
          localizacaoUsuario,
          sessionToken.current,
        );

        const filtrados = resultados.filter((s) => {
          const enderecoCompleto = `${s.nome} ${s.endereco}`.toLowerCase();
          const numerosNoEndereco = enderecoCompleto.match(/\d+/g) ?? [];
          const temNumeroInvalido = numerosNoEndereco.some(
            (n) => parseInt(n) > 9999,
          );
          return !temNumeroInvalido;
        });

        setSugestoes(filtrados);
      } catch (e) {
        console.log("❌ [AUTOCOMPLETE] Erro:", e);
      } finally {
        setBuscandoSugestoes(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [texto]);

  async function handleSelecionarSugestao(sugestao: Sugestao) {
    selecionandoRef.current = true; // ← bloqueia o useEffect
    setTexto(sugestao.nome);
    setSugestoes([]);

    try {
      const coords = await recuperarCoordenadas(
        sugestao.mapboxId,
        sessionToken.current,
      );
      if (!coords) return;
      sessionToken.current = gerarSessionToken();
      onBuscarCoordenadas(coords);
    } catch (e) {
      console.log("❌ [AUTOCOMPLETE] Erro ao recuperar coordenadas:", e);
    } finally {
      selecionandoRef.current = false; // ← libera após concluir
    }
  }

  function handleBuscarTexto() {
    if (texto.trim()) {
      setSugestoes([]);
      onBuscarTexto(texto);
    }
  }

  function handleLimpar() {
    setTexto("");
    setSugestoes([]);
    sessionToken.current = gerarSessionToken();
    onLimpar();
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.btnMenu} onPress={onAbrirMenu}>
          <View style={styles.hamburguer}>
            <View style={styles.linha} />
            <View style={styles.linha} />
            <View style={styles.linha} />
          </View>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Para onde?"
          placeholderTextColor="#999"
          value={texto}
          onChangeText={setTexto}
          onSubmitEditing={handleBuscarTexto}
          returnKeyType="search"
        />

        {buscandoSugestoes || carregando ? (
          <ActivityIndicator style={styles.btn} color="#4a9ff0" size="small" />
        ) : texto.length > 0 ? (
          <TouchableOpacity style={styles.btn} onPress={handleLimpar}>
            <Text style={styles.btnText}>✕</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btn} onPress={handleBuscarTexto}>
            <Text style={styles.btnText}>🔍</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de sugestões */}
      {sugestoes.length > 0 && (
        <View style={styles.listaSugestoes}>
          <FlatList
            data={sugestoes}
            keyExtractor={(item) => item.mapboxId}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.sugestaoItem,
                  index < sugestoes.length - 1 && styles.sugestaoItemBorder,
                ]}
                onPress={() => handleSelecionarSugestao(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.sugestaoIcone}>📍</Text>
                <View style={styles.sugestaoTextos}>
                  <Text style={styles.sugestaoNome} numberOfLines={1}>
                    {item.nome}
                  </Text>
                  {item.endereco ? (
                    <Text style={styles.sugestaoEndereco} numberOfLines={1}>
                      {item.endereco}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Erro */}
      {erro && <Text style={styles.erro}>{erro}</Text>}

      {/* Info da rota */}
      {distancia && duracao && (
        <View style={styles.infoRota}>
          <Text style={styles.infoText}>📍 {distancia}</Text>
          <Text style={styles.infoText}>⏱ {duracao}</Text>
          <TouchableOpacity onPress={handleLimpar}>
            <Text style={styles.limpar}>✕ Limpar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  inputRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
  },
  btnMenu: {
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  hamburguer: { gap: 4, alignItems: "center" },
  linha: { width: 18, height: 2, backgroundColor: "#333", borderRadius: 2 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: "#333" },
  btn: {
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 44,
  },
  btnText: { fontSize: 16, color: "#666" },
  listaSugestoes: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 4,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    maxHeight: 280,
    overflow: "hidden",
  },
  sugestaoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  sugestaoItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sugestaoIcone: { fontSize: 16 },
  sugestaoTextos: { flex: 1 },
  sugestaoNome: { fontSize: 14, fontWeight: "600", color: "#1A1A1A" },
  sugestaoEndereco: { fontSize: 12, color: "#9E9E9E", marginTop: 2 },
  erro: {
    marginTop: 6,
    color: "#f04a6a",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    fontSize: 13,
  },
  infoRota: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },
  infoText: { fontSize: 14, fontWeight: "600", color: "#333" },
  limpar: { color: "#f04a6a", fontWeight: "700", fontSize: 13 },
});
