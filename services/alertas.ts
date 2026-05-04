import { api } from './api';

export interface Incidente {
  id: string;
  tipo: string;
  descricao: string;
  latitude: number;
  longitude: number;
  endereco: string;
  confirmacoes: number;
  criadoEm: string;
  nomeUsuario: string;
}

export async function buscarIncidentesProximos(
  lat: number,
  lng: number,
  raio: number = 1000
): Promise<Incidente[]> {
  console.log('📡 [ALERTAS] GET /incidentes/proximos');
  const { data } = await api.get('/incidentes/proximos', {
    params: { lat, lng, raio },
  });
  console.log('✅ [ALERTAS] Incidentes recebidos:', data.length);
  return data;

  
}
export async function buscarTodosIncidentes(): Promise<Incidente[]> {
  console.log('📡 [ALERTAS] GET /incidentes');
  const { data } = await api.get('/incidentes');
  console.log('✅ [ALERTAS] Total de incidentes:', data.length);
  return data;
}