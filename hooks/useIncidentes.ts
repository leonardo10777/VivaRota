import { useState, useEffect } from 'react';
import {
  buscarIncidentesProximos,
  buscarTodosIncidentes,
  Incidente,
} from '@/services/alertas';

export function useIncidentes(
  location: [number, number] | null,
  destino?: [number, number] | null
) {
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);

  useEffect(() => {
    if (!location) return;

    const buscar = async () => {
      try {
        // 1. Ao abrir — busca TODOS os incidentes ativos
        const todos = await buscarTodosIncidentes();
        console.log('📍 [INCIDENTES] Total no mapa:', todos.length);
        setIncidentes(todos);

        // 2. Alerta próximos ao usuário (500m)
        const proximosUsuario = await buscarIncidentesProximos(
          location[1], location[0], 500
        );
        if (proximosUsuario.length > 0) {
          console.log('⚠️ [INCIDENTES] Próximos ao usuário:', proximosUsuario.length);
        }

        // 3. Se tem destino — busca próximos ao destino (1km)
        if (destino) {
          const proximosDestino = await buscarIncidentesProximos(
            destino[1], destino[0], 1000
          );
          console.log('📍 [INCIDENTES] Próximos ao destino:', proximosDestino.length);

          // Junta todos sem duplicatas
          const unicos = [...todos, ...proximosDestino].filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.id === item.id)
          );
          setIncidentes(unicos);
        }

      } catch (e) {
        console.log('❌ [INCIDENTES] Erro ao buscar:', e);
      }
    };

    buscar();
    const interval = setInterval(buscar, 30000);
    return () => clearInterval(interval);
  }, [location, destino]);

  return { incidentes };
}