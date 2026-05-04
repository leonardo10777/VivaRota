import MapboxGL from '@rnmapbox/maps';
import { RotaResponse } from '@/services/rotas'; // ← importar de services/rotas
import { TipoRota } from '@/hooks/useRota';      // ← TipoRota continua do hook

interface Props {
  rotas: RotaResponse;
  rotaSelecionada: TipoRota;
  destino: [number, number];
}

const CORES_ROTA = {
  segura:      '#4CAF50', // verde
  rapida:      '#F44336', // vermelho
  equilibrada: '#2196F3', // azul
};

const CORES_INATIVA = {
  segura:      '#A5D6A7', // verde claro
  rapida:      '#EF9A9A', // vermelho claro
  equilibrada: '#90CAF9', // azul claro
};

export function RotaMapa({ rotas, rotaSelecionada, destino }: Props) {
  const tipos: TipoRota[] = ['equilibrada', 'rapida', 'segura']; // ordem importa — selecionada por último

  return (
    <>
      {tipos.map((tipo) => {
        const chave = `rota${tipo.charAt(0).toUpperCase() + tipo.slice(1)}` as keyof typeof rotas;
        const rota = rotas[chave];
        const ativa = tipo === rotaSelecionada;

        const geoJSON: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: rota.coordenadas,
            },
            properties: {},
          }],
        };

        return (
          <MapboxGL.ShapeSource
            key={tipo}
            id={`rotaSource_${tipo}`}
            shape={geoJSON}
          >
            <MapboxGL.LineLayer
              id={`rotaLine_${tipo}`}
              style={{
                lineColor: ativa
                  ? CORES_ROTA[tipo]
                  : CORES_INATIVA[tipo],
                lineWidth: ativa ? 5 : 3,
                lineCap: 'round',
                lineJoin: 'round',
                lineOpacity: ativa ? 1 : 0.5,
              }}
            />
          </MapboxGL.ShapeSource>
        );
      })}

      {/* Marcador de destino */}
      <MapboxGL.PointAnnotation
        id="destino"
        coordinate={destino}
      >
        <MapboxGL.Callout title="Destino" />
      </MapboxGL.PointAnnotation>
    </>
  );
}