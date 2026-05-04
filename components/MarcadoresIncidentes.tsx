import { Incidente } from "@/services/alertas";
import MapboxGL from "@rnmapbox/maps";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  incidentes: Incidente[];
}

// Cores e ícones por tipo de incidente
const CONFIG_TIPO: Record<
  string,
  { emoji: string; cor: string; peso: number }
> = {
  ASSALTO: { emoji: "🔴", cor: "#D32F2F", peso: 3 },
  ASSEDIO: { emoji: "🔴", cor: "#C62828", peso: 3 },
  SEM_ILUMINACAO: { emoji: "🟠", cor: "#F57C00", peso: 2 },
  AREA_ISOLADA: { emoji: "🟠", cor: "#EF6C00", peso: 2 },
  ACIDENTE: { emoji: "🟡", cor: "#F9A825", peso: 1 },
  OUTROS: { emoji: "🟡", cor: "#F57F17", peso: 1 },
};

// Calcula fator de recência
function calcularRecencia(criadoEm: string): number {
  const agora = new Date();
  const criado = new Date(criadoEm);
  const horasAtras = (agora.getTime() - criado.getTime()) / (1000 * 60 * 60);

  if (horasAtras < 1) return 1.0;
  if (horasAtras < 6) return 0.7;
  if (horasAtras < 12) return 0.4;
  return 0.2;
}

// Define cor do marcador com base no perigo
function corPorPerigo(tipo: string, criadoEm: string): string {
  const config = CONFIG_TIPO[tipo] ?? CONFIG_TIPO["OUTROS"]; // ← sem toLowerCase
  const recencia = calcularRecencia(criadoEm);
  const perigo = config.peso * recencia;

  if (perigo >= 2.5) return "#D32F2F";
  if (perigo >= 1.5) return "#F57C00";
  if (perigo >= 0.5) return "#F9A825";
  return "#9E9E9E";
}

export function MarcadoresIncidentes({ incidentes }: Props) {
  return (
    <>
      {incidentes.map((incidente) => {
        const tipo = incidente.tipo ?? "OUTROS";
        const config = CONFIG_TIPO[tipo] ?? CONFIG_TIPO["OUTROS"];
        const cor = corPorPerigo(tipo, incidente.criadoEm);

        return (
          <MapboxGL.MarkerView
            key={incidente.id}
            coordinate={[incidente.longitude, incidente.latitude]}
          >
            <View style={[styles.marcador, { backgroundColor: cor }]}>
              <Text style={styles.emoji}>{config.emoji}</Text>
            </View>
          </MapboxGL.MarkerView>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  marcador: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  emoji: {
    fontSize: 16,
  },
});
