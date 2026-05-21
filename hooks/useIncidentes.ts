import {
  buscarIncidentesProximos,
  buscarTodosIncidentes,
  Incidente,
} from '@/services/alertas';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function pedirPermissao() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function enviarNotificacao(quantidade: number, raio: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠️ Atenção — Área de risco!',
      body: `${quantidade} incidente${quantidade > 1 ? 's' : ''} reportado${quantidade > 1 ? 's' : ''} a menos de ${raio} de você.`,
      sound: true,
    },
    trigger: null,
  });
}

export function useIncidentes(
  location: [number, number] | null,
  destino?: [number, number] | null
) {
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const jaNotificouRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    pedirPermissao();
  }, []);

  useEffect(() => {
    if (!location) return;

    const buscar = async () => {
      try {
        const todos = await buscarTodosIncidentes();
        console.log('📍 [INCIDENTES] Total no mapa:', todos.length);
        setIncidentes(todos);

        const proximosUsuario = await buscarIncidentesProximos(
          location[1], location[0], 500
        );

        if (proximosUsuario.length > 0) {
          console.log('⚠️ [INCIDENTES] Próximos ao usuário:', proximosUsuario.length);
          const chave = proximosUsuario.map(i => i.id).sort().join(',');
          if (!jaNotificouRef.current.has(chave)) {
            jaNotificouRef.current.add(chave);
            await enviarNotificacao(proximosUsuario.length, '500m');
          }
        }

        if (destino) {
          const proximosDestino = await buscarIncidentesProximos(
            destino[1], destino[0], 1000
          );
          console.log('📍 [INCIDENTES] Próximos ao destino:', proximosDestino.length);
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