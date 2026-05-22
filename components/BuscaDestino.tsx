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
  onDefinirOrigemTexto: (endereco: string) => void;
  onDefinirOrigemCoordenadas: (coords: [number, number]) => void;
  onLimpar: () => void;
  onAbrirMenu: () => void;
  carregando: boolean;
  distancia?: string;
  duracao?: string;
  erro?: string | null;
  localizacaoUsuario?: [number, number];
  origemCustom?: [number, number] | null;
}

type CampoAtivo = 'origem' | 'destino' | null;

export function BuscaDestino({
  onBuscarTexto,
  onBuscarCoordenadas,
  onDefinirOrigemTexto,
  onDefinirOrigemCoordenadas,
  onLimpar,
  onAbrirMenu,
  carregando,
  distancia,
  duracao,
  erro,
  localizacaoUsuario,
  origemCustom,
}: Props) {
  const [textoDestino, setTextoDestino] = useState("");
  const [textoOrigem, setTextoOrigem] = useState("");
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [buscandoSugestoes, setBuscandoSugestoes] = useState(false);
  const [campoAtivo, setCampoAtivo] = useState<CampoAtivo>(null);
  const [mostrarOrigem, setMostrarOrigem] = useState(false);
  const [destinoSelecionado, setDestinoSelecionado] = useState(false);
  const [origemSelecionada, setOrigemSelecionada] = useState(false);

  const sessionTokenDestino = useRef(gerarSessionToken());
  const sessionTokenOrigem = useRef(gerarSessionToken());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const selecionandoRef = useRef(false);
  const inputOrigemRef = useRef<TextInput>(null);
  const inputDestinoRef = useRef<TextInput>(null);

  useEffect(() => {
    if (selecionandoRef.current) return;
    if (destinoSelecionado && campoAtivo === 'destino') return;
    if (origemSelecionada && campoAtivo === 'origem') return;

    const textoAtual = campoAtivo === 'origem' ? textoOrigem : textoDestino;

    if (textoAtual.trim().length < 3) {
      setSugestoes([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setBuscandoSugestoes(true);
      try {
        const token = campoAtivo === 'origem'
          ? sessionTokenOrigem.current
          : sessionTokenDestino.current;

        const resultados = await buscarSugestoes(
          textoAtual,
          localizacaoUsuario,
          token,
        );

        setSugestoes(resultados.filter((s) => {
          const enderecoCompleto = `${s.nome} ${s.endereco}`.toLowerCase();
          const numerosNoEndereco = enderecoCompleto.match(/\d+/g) ?? [];
          return !numerosNoEndereco.some((n) => parseInt(n) > 9999);
        }));
      } catch (e) {
        console.log("❌ [AUTOCOMPLETE] Erro:", e);
      } finally {
        setBuscandoSugestoes(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [textoDestino, textoOrigem, campoAtivo, destinoSelecionado, origemSelecionada]);

  async function handleSelecionarSugestao(sugestao: Sugestao) {
    selecionandoRef.current = true;
    setSugestoes([]);

    try {
      const token = campoAtivo === 'origem'
        ? sessionTokenOrigem.current
        : sessionTokenDestino.current;

      const coords = await recuperarCoordenadas(sugestao.mapboxId, token);
      if (!coords) return;

      if (campoAtivo === 'origem') {
        setTextoOrigem(sugestao.nome);
        setOrigemSelecionada(true);
        setCampoAtivo(null);
        sessionTokenOrigem.current = gerarSessionToken();
        onDefinirOrigemCoordenadas(coords);
        // Move câmera para a origem selecionada
        setTimeout(() => inputDestinoRef.current?.focus(), 100);
      } else {
        setTextoDestino(sugestao.nome);
        setDestinoSelecionado(true);
        setCampoAtivo(null);
        sessionTokenDestino.current = gerarSessionToken();
        onBuscarCoordenadas(coords);
      }
    } catch (e) {
      console.log("❌ [AUTOCOMPLETE] Erro ao recuperar coordenadas:", e);
    } finally {
      selecionandoRef.current = false;
    }
  }

  function handleUsarLocalizacaoAtual() {
    setTextoOrigem("Minha localização atual");
    setOrigemSelecionada(true);
    setSugestoes([]);
    setCampoAtivo(null);
    if (localizacaoUsuario) {
      onDefinirOrigemCoordenadas(localizacaoUsuario);
    }
  }

  function handleBuscarTexto() {
    if (textoDestino.trim()) {
      setSugestoes([]);
      setDestinoSelecionado(true);
      onBuscarTexto(textoDestino);
    }
  }

  function handleLimpar() {
    setTextoDestino("");
    setTextoOrigem("");
    setSugestoes([]);
    setCampoAtivo(null);
    setMostrarOrigem(false);
    setDestinoSelecionado(false);
    setOrigemSelecionada(false);
    sessionTokenDestino.current = gerarSessionToken();
    sessionTokenOrigem.current = gerarSessionToken();
    onLimpar();
  }

  function handleChangeDestino(texto: string) {
    setTextoDestino(texto);
    setDestinoSelecionado(false);
  }

  function handleChangeOrigem(texto: string) {
    setTextoOrigem(texto);
    setOrigemSelecionada(false);
  }

  // Mostra lista de sugestões + opção localização atual
  const mostrarLista = (sugestoes.length > 0 || campoAtivo === 'origem') &&
    !destinoSelecionado &&
    !(campoAtivo === 'destino' && destinoSelecionado);

  return (
    <View style={styles.container}>

      {/* Campo origem */}
      {mostrarOrigem && (
        <View style={styles.inputRow}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconTexto}>🔵</Text>
          </View>

          <TextInput
            ref={inputOrigemRef}
            style={styles.input}
            placeholder="De onde você vai sair?"
            placeholderTextColor="#999"
            value={textoOrigem}
            onChangeText={handleChangeOrigem}
            onFocus={() => {
              setCampoAtivo('origem');
              setOrigemSelecionada(false);
              // Limpa "Minha localização atual" ao focar para digitar
              if (textoOrigem === "Minha localização atual") {
                setTextoOrigem("");
              }
            }}
            returnKeyType="search"
          />

          {textoOrigem.length > 0 && (
            <TouchableOpacity
              style={styles.btn}
              onPress={() => {
                setTextoOrigem("");
                setOrigemSelecionada(false);
                setSugestoes([]);
              }}
            >
              <Text style={styles.btnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Campo destino */}
      <View style={[styles.inputRow, mostrarOrigem && styles.inputRowDestino]}>
        <TouchableOpacity style={styles.btnMenu} onPress={onAbrirMenu}>
          {mostrarOrigem ? (
            <Text style={{ fontSize: 16 }}>📍</Text>
          ) : (
            <View style={styles.hamburguer}>
              <View style={styles.linha} />
              <View style={styles.linha} />
              <View style={styles.linha} />
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          ref={inputDestinoRef}
          style={styles.input}
          placeholder="Para onde?"
          placeholderTextColor="#999"
          value={textoDestino}
          onChangeText={handleChangeDestino}
          onFocus={() => {
            setCampoAtivo('destino');
            setMostrarOrigem(true);
            setDestinoSelecionado(false);
          }}
          onSubmitEditing={handleBuscarTexto}
          returnKeyType="search"
        />

        {buscandoSugestoes || carregando ? (
          <ActivityIndicator style={styles.btn} color="#4a9ff0" size="small" />
        ) : textoDestino.length > 0 ? (
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
      {mostrarLista && (
        <View style={styles.listaSugestoes}>
          {/* Opção localização atual — sempre no topo quando campo origem ativo */}
          {campoAtivo === 'origem' && (
            <TouchableOpacity
              style={[styles.sugestaoItem, sugestoes.length > 0 && styles.sugestaoItemBorder]}
              onPress={handleUsarLocalizacaoAtual}
              activeOpacity={0.7}
            >
              <Text style={styles.sugestaoIcone}>📍</Text>
              <View style={styles.sugestaoTextos}>
                <Text style={[styles.sugestaoNome, { color: '#4a9ff0' }]}>
                  Minha localização atual
                </Text>
                <Text style={styles.sugestaoEndereco}>
                  Usar minha posição GPS
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {sugestoes.length > 0 && (
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
          )}
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
    marginBottom: 4,
  },
  inputRowDestino: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginBottom: 0,
    marginTop: 0,
  },
  btnMenu: {
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  iconTexto: { fontSize: 14 },
  hamburguer: { gap: 4, alignItems: "center" },
  linha: { width: 18, height: 2, backgroundColor: "#333", borderRadius: 2 },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#333",
  },
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
    maxHeight: 300,
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