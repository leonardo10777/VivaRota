import { BuscaDestino } from "@/components/BuscaDestino";
import { MarcadoresIncidentes } from "@/components/MarcadoresIncidentes";
import { MenuLateral } from "@/components/MenuLateral";
import { RotaMapa } from "@/components/RotaMapa";
import { SeletorRota } from "@/components/SeletorRotal";
import { useIncidentes } from "@/hooks/useIncidentes";
import { useRota } from "@/hooks/useRota";
import MapboxGL from "@rnmapbox/maps";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "");

export default function MapScreen() {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const {
    destino,
    rotas,
    rotaAtiva,
    rotaSelecionada,
    setRotaSelecionada,
    carregando,
    erro,
    distancia,
    duracao,
    buscarRota,
    buscarRotaPorCoordenadas,
    limparRota,
  } = useRota();

    const { incidentes } = useIncidentes(location, destino);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permissão de localização negada.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation([loc.coords.longitude, loc.coords.latitude]);
    })();
  }, []);

  useEffect(() => {
    if (rotaAtiva && destino && location) {
      cameraRef.current?.fitBounds(destino, location, [80, 80, 200, 80], 1000);
    }
  }, [rotaAtiva]);

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <Text>Obtendo localização...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={15}
          centerCoordinate={location}
          animationMode="flyTo"
        />
        <MapboxGL.UserLocation visible={true} />

        {/* Marcadores de incidentes próximos */}
        <MarcadoresIncidentes incidentes={incidentes} />

        {/* Exibe as 3 rotas no mapa */}
        {rotas && destino && (
          <RotaMapa
            rotas={rotas}
            rotaSelecionada={rotaSelecionada}
            destino={destino}
          />
        )}
      </MapboxGL.MapView>

      {/* Busca */}
      <BuscaDestino
        onBuscarTexto={(endereco) => buscarRota(endereco, location)}
        onBuscarCoordenadas={(coords) =>
          buscarRotaPorCoordenadas(coords, location)
        }
        onLimpar={limparRota}
        onAbrirMenu={() => setMenuAberto(true)}
        carregando={carregando}
        distancia={distancia}
        duracao={duracao}
        erro={erro}
        localizacaoUsuario={location}
      />

      {/* Seletor de rotas */}
      {rotas && (
        <SeletorRota
          rotas={rotas}
          rotaSelecionada={rotaSelecionada}
          onSelecionar={setRotaSelecionada}
        />
      )}

      <MenuLateral aberto={menuAberto} onFechar={() => setMenuAberto(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
