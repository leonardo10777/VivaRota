import { api } from "./api";

export async function atualizarLocalizacao(
  latitude: number,
  longitude: number,
): Promise<void> {
  await api.patch("/usuarios/localizacao", { latitude, longitude });
}
