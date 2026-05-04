const TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';

// ── GEOCODING (já existe) ──────────────────────────────────
export async function geocodificarEndereco(
  endereco: string
): Promise<[number, number] | null> {
  const query = encodeURIComponent(endereco);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${TOKEN}&language=pt&country=BR&limit=1`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.features || data.features.length === 0) return null;
  const [lng, lat] = data.features[0].center;
  return [lng, lat];
}

// ── DIRECTIONS (já existe) ────────────────────────────────
export async function calcularRota(
  origem: [number, number],
  destino: [number, number]
): Promise<{
  coordenadas: [number, number][];
  distancia: string;
  duracao: string;
} | null> {
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/walking/` +
    `${origem[0]},${origem[1]};${destino[0]},${destino[1]}` +
    `?geometries=geojson&steps=true&language=pt&access_token=${TOKEN}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.routes || data.routes.length === 0) return null;
  const rota = data.routes[0];
  const coordenadas = rota.geometry.coordinates as [number, number][];
  const distancia = (rota.distance / 1000).toFixed(1) + ' km';
  const minutos = Math.round(rota.duration / 60);
  const duracao = minutos >= 60
    ? `${Math.floor(minutos / 60)}h ${minutos % 60}min`
    : `${minutos} min`;
  return { coordenadas, distancia, duracao };
}

// ── AUTOCOMPLETE (novo) ───────────────────────────────────

export interface Sugestao {
  mapboxId: string;
  nome: string;
  endereco: string;
  sessionToken: string;
}

export function gerarSessionToken(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}


export async function buscarSugestoes(
  query: string,
  proximidade?: [number, number],
  sessionToken?: string
): Promise<Sugestao[]> {
  if (query.trim().length < 3) return [];

  const prox = proximidade
    ? `&proximity=${proximidade[0]},${proximidade[1]}`
    : '';
  const session = sessionToken ?? gerarSessionToken();
  const url =
    `https://api.mapbox.com/search/searchbox/v1/suggest` +
    `?q=${encodeURIComponent(query)}` +
    `&language=pt` +
    `&country=BR` +
    `&limit=5` +
    `&session_token=${session}` +
    `${prox}` +
    `&access_token=${TOKEN}`;

  const res = await fetch(url);
  const data = await res.json();

  return (data.suggestions ?? []).map((s: any) => ({
    mapboxId: s.mapbox_id,
    nome: s.name,
    endereco: s.full_address ?? s.place_formatted ?? '',
    sessionToken: session,
  }));
}


export async function recuperarCoordenadas(
  mapboxId: string,
  sessionToken: string
): Promise<[number, number] | null> {
  const url =
    `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}` +
    `?session_token=${sessionToken}` +
    `&access_token=${TOKEN}`;
  const res = await fetch(url);
  const data = await res.json();
  const coords = data.features?.[0]?.geometry?.coordinates;
  if (!coords) return null;
  return [coords[0], coords[1]];
}