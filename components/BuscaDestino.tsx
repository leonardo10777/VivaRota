import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Sugestao {
  nome: string;
  lugar: string;
  coordenadas: [number, number];
}

interface Props {
  onBuscar: (endereco: string) => void;
  onLimpar: () => void;
  onSelecionarSugestao: (sugestao: Sugestao) => void;
  onChangeTexto: (texto: string) => void;
  carregando: boolean;
  sugestoes: Sugestao[];
  buscandoSugestoes: boolean;
  distancia?: string;
  duracao?: string;
  erro?: string | null;
}

export function BuscaDestino({
  onBuscar,
  onLimpar,
  onSelecionarSugestao,
  onChangeTexto,
  carregando,
  sugestoes,
  buscandoSugestoes,
  distancia,
  duracao,
  erro,
}: Props) {
  const [texto, setTexto] = useState('');

  const handleChangeTexto = (value: string) => {
    setTexto(value);
    onChangeTexto(value);
  };

  const handleBuscar = () => {
    if (texto.trim()) onBuscar(texto);
  };

  const handleSelecionarSugestao = (sugestao: Sugestao) => {
    setTexto(sugestao.lugar);
    onSelecionarSugestao(sugestao);
  };

  const handleLimpar = () => {
    setTexto('');
    onLimpar();
  };

  return (
    <View style={styles.container}>
      {/* Input de busca */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Digite o endereço de destino..."
          placeholderTextColor="#999"
          value={texto}
          onChangeText={handleChangeTexto}
          onSubmitEditing={handleBuscar}
          returnKeyType="search"
        />
        {carregando || buscandoSugestoes ? (
          <ActivityIndicator style={styles.btn} color="#4a9ff0" />
        ) : (
          <TouchableOpacity style={styles.btn} onPress={handleBuscar}>
            <Text style={styles.btnText}>🔍</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de sugestões */}
      {sugestoes.length > 0 && (
        <View style={styles.sugestoesContainer}>
          <FlatList
            data={sugestoes}
            keyExtractor={(item) => item.lugar}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.sugestaoItem}
                onPress={() => handleSelecionarSugestao(item)}
              >
                <Text style={styles.sugestaoNome}>{item.nome}</Text>
                <Text style={styles.sugestaoLugar} numberOfLines={1}>
                  {item.lugar}
                </Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separador} />}
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
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  inputRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: '#333',
  },
  btn: {
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 18,
  },
  sugestoesContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    maxHeight: 220,
  },
  sugestaoItem: {
    padding: 14,
  },
  sugestaoNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sugestaoLugar: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  separador: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 14,
  },
  erro: {
    marginTop: 6,
    color: '#f04a6a',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    fontSize: 13,
  },
  infoRota: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  limpar: {
    color: '#f04a6a',
    fontWeight: '700',
    fontSize: 13,
  },
});