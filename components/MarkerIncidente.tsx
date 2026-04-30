import { Incidente, INCIDENTE_CONFIG } from '@/constants/mockIncidentes';
import MapboxGL from '@rnmapbox/maps';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  incidentes: Incidente[];
  onPress?: (incidente: Incidente) => void;
}

export function MarkerIncidente({ incidentes, onPress }: Props) {
  return (
    <>
      {incidentes
        .filter(i => i.status === 'ativo')
        .map(incidente => {
          const config = INCIDENTE_CONFIG[incidente.tipo];
          return (
            <MapboxGL.PointAnnotation
              key={incidente.id}
              id={`incidente-${incidente.id}`}
              coordinate={[incidente.longitude, incidente.latitude]}
              onSelected={() => onPress?.(incidente)}
            >
              <View style={[styles.marker, { backgroundColor: config.cor }]}>
                <Text style={styles.emoji}>{config.emoji}</Text>
              </View>
              <MapboxGL.Callout title={config.label} />
            </MapboxGL.PointAnnotation>
          );
        })}
    </>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  emoji: {
    fontSize: 16,
  },
});