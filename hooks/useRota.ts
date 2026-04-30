import { useState } from 'react';
import { buscarSugestoes, calcularRota, geocodificarEndereco } from '../services/mapbox';

interface Sugestao {
  nome: string;
  lugar: string;
  coordenadas: [number, number];
}

interface ResultadoRota {
  coordenadas: [number, number][];
  distancia: string;
  duracao: string;
}

export function useRota() {
  const [destino, setDestino] = useState<[number, number] | null>(null);
  const [rota, setRota] = useState<ResultadoRota | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [buscandoSugestoes, setBuscandoSugestoes] = useState(false);

  // Busca sugestões enquanto o usuário digita
  const buscarSugestoesEndereco = async (texto: string) => {
    if (texto.length < 3) {
      setSugestoes([]);
      return;
    }
    setBuscandoSugestoes(true);
    try {
      const resultados = await buscarSugestoes(texto);
      setSugestoes(resultados);
    } catch {
      setSugestoes([]);
    } finally {
      setBuscandoSugestoes(false);
    }
  };

  // Busca rota digitando o endereço manualmente
  const buscarRota = async (endereco: string, origem: [number, number]) => {
    if (!endereco.trim()) return;
    setCarregando(true);
    setErro(null);
    setSugestoes([]);
    try {
      const coordDestino = await geocodificarEndereco(endereco);
      if (!coordDestino) {
        setErro('Endereço não encontrado.');
        return;
      }
      setDestino(coordDestino);
      const resultado = await calcularRota(origem, coordDestino);
      if (!resultado) {
        setErro('Não foi possível calcular a rota.');
        return;
      }
      setRota(resultado);
    } catch {
      setErro('Erro ao buscar rota. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  // Seleciona uma sugestão da lista e calcula a rota direto
  const selecionarSugestao = async (sugestao: Sugestao, origem: [number, number]) => {
    setCarregando(true);
    setErro(null);
    setSugestoes([]);
    try {
      setDestino(sugestao.coordenadas);
      const resultado = await calcularRota(origem, sugestao.coordenadas);
      if (!resultado) {
        setErro('Não foi possível calcular a rota.');
        return;
      }
      setRota(resultado);
    } catch {
      setErro('Erro ao calcular rota.');
    } finally {
      setCarregando(false);
    }
  };

  const limparRota = () => {
    setDestino(null);
    setRota(null);
    setErro(null);
    setSugestoes([]);
  };

  return {
    destino,
    rota,
    carregando,
    erro,
    sugestoes,
    buscandoSugestoes,
    buscarRota,
    buscarSugestoesEndereco,
    selecionarSugestao,
    limparRota,
  };
}