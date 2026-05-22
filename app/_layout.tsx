// ═══════════════════════════════════════════════════════════════
// 📁 app/_layout.tsx
// ═══════════════════════════════════════════════════════════════

import { AlertProvider } from "@/contexts/AlertContext";
import { AlertOverlay } from "@/components/AlertOverlay";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AlertProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro" options={{ headerShown: false }} />
        <Stack.Screen 
          name="contatos-emergencia" 
          options={{ headerShown: true, title: 'Contatos de Emergência' }} 
        />
        <Stack.Screen
          name="mapa"
          options={{ headerShown: false }}
        />
      </Stack>
      <AlertOverlay />
    </AlertProvider>
  );
}