// ═══════════════════════════════════════════════════════════════
// 📁 components/BotaoEmergencia.tsx
// ═══════════════════════════════════════════════════════════════

import { Colors } from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import React, { useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAlert } from "@/contexts/AlertContext";

// Importação segura do expo-sms
let SMS: any = null;
try {
  SMS = require("expo-sms");
} catch {
  console.warn("⚠️ expo-sms não disponível");
  SMS = null;
}

const HOLD_DURATION = 3000;
const CHAVE = "contatos_emergencia";

export function BotaoEmergencia() {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  
  const [isHolding, setIsHolding] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [modalVisible, setModalVisible] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [statusMensagem, setStatusMensagem] = useState<string>("");

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleScale = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const triggerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingRef = useRef(false);
  const rippleAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const startRipple = () => {
    rippleScale.setValue(1);
    rippleOpacity.setValue(0.7);
    const anim = Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 2.6,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]);
    rippleAnimRef.current = anim;
    anim.start(({ finished }) => {
      if (finished && isHoldingRef.current) startRipple();
    });
  };

  const stopRipple = () => {
    rippleAnimRef.current?.stop();
    Animated.timing(rippleOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startHold = () => {
    isHoldingRef.current = true;
    setIsHolding(true);
    setCountdown(3);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(scaleAnim, {
      toValue: 1.12,
      useNativeDriver: true,
    }).start();
    startRipple();

    let count = 2;
    holdTimerRef.current = setInterval(() => {
      setCountdown(count);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      count--;
    }, 1000);

    triggerTimerRef.current = setTimeout(() => {
      clearInterval(holdTimerRef.current!);
      triggerEmergency();
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;
    setIsHolding(false);
    setCountdown(3);

    clearInterval(holdTimerRef.current!);
    clearTimeout(triggerTimerRef.current!);
    stopRipple();

    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const formatarTelefoneParaSMS = (telefone: string): string => {
    const numeros = telefone.replace(/\D/g, "");
    
    if (numeros.startsWith("55")) {
      return `+${numeros}`;
    }
    
    if (numeros.length === 10 || numeros.length === 11) {
      return `+55${numeros}`;
    }
    
    return `+55${numeros.slice(-11)}`;
  };

  const triggerEmergency = async () => {
    isHoldingRef.current = false;
    setIsHolding(false);
    stopRipple();
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

    Vibration.vibrate([0, 300, 150, 300, 150, 300]);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    setEnviando(true);
    setStatusMensagem("Processando...");

    // Mostrar alerta de emergência no topo
    showAlert({
      type: 'emergency',
      title: '🆘 ALERTA DE EMERGÊNCIA',
      message: 'Enviando sua localização para contatos...',
      duration: 0,
    });

    console.log("🚨 [SOS] Acionamento iniciado");

    try {
      // 1️⃣ Pega localização atual
      let linkMapa = "Localização indisponível";
      try {
        console.log("📍 Solicitando localização...");
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          const { latitude, longitude } = loc.coords;
          linkMapa = `https://maps.google.com/?q=${latitude},${longitude}`;
          console.log("✅ Localização obtida:", { latitude, longitude });
        }
      } catch (locError) {
        console.error("❌ Erro ao obter localização:", locError);
      }

      // 2️⃣ Busca contatos salvos
      console.log("📞 Carregando contatos de emergência...");
      const dados = await SecureStore.getItemAsync(CHAVE);
      const contatos = dados ? JSON.parse(dados) : [];
      console.log("✅ Contatos carregados:", contatos.length);

      if (contatos.length === 0) {
        console.warn("⚠️ Nenhum contato de emergência cadastrado");
        showAlert({
          type: 'warning',
          title: '⚠️ Nenhum Contato',
          message: 'Cadastre contatos de emergência nas configurações',
          duration: 5000,
        });
        setEnviando(false);
        return;
      }

      // 3️⃣ Envia SMS se disponível
      if (!SMS) {
        console.error("❌ expo-sms não foi carregado");
        showAlert({
          type: 'warning',
          title: '⚠️ SMS Indisponível',
          message: 'Reinstale o app com suporte a SMS',
          duration: 5000,
        });
        setEnviando(false);
        return;
      }

      console.log("📱 Verificando disponibilidade de SMS...");
      const disponivel = await SMS.isAvailableAsync();

      if (!disponivel) {
        console.warn("⚠️ SMS não está disponível neste dispositivo");
        showAlert({
          type: 'warning',
          title: '⚠️ SMS Bloqueado',
          message: 'Ative SMS nas configurações do dispositivo',
          duration: 5000,
        });
        setEnviando(false);
        return;
      }

      // 4️⃣ Formata números para SMS
      const numeros = contatos.map((c: any) => {
        const formatado = formatarTelefoneParaSMS(c.phone);
        console.log(`📱 ${c.name}: ${c.phone} → ${formatado}`);
        return formatado;
      });

      const mensagem =
        `🆘 EMERGÊNCIA! Preciso de ajuda!\n` +
        `📍 Minha localização: ${linkMapa}\n` +
        `Enviado pelo VivaRota`;

      console.log("📨 Enviando SMS para:", numeros);

      // 5️⃣ Envia SMS
      try {
        await SMS.sendSMSAsync(numeros, mensagem);
        console.log("✅ SMS enviado com sucesso");
        
        // Alerta de sucesso
        showAlert({
          type: 'success',
          title: '✅ Emergência Acionada!',
          message: `SMS enviado para ${contatos.length} contato(s)`,
          duration: 6000,
        });

        setStatusMensagem(`✅ SMS enviado para ${contatos.length} contato(s)`);
      } catch (smsError) {
        console.error("❌ Erro ao enviar SMS:", smsError);
        showAlert({
          type: 'emergency',
          title: '❌ Erro ao Enviar',
          message: 'Tente novamente ou acione manualmente',
          duration: 6000,
        });
        setStatusMensagem("❌ Erro ao enviar SMS");
      }
    } catch (error) {
      console.error("❌ [SOS] Erro geral:", error);
      showAlert({
        type: 'emergency',
        title: '❌ Erro no Sistema',
        message: 'Entre em contato com suporte',
        duration: 6000,
      });
      setStatusMensagem("❌ Erro ao processar SOS");
    } finally {
      setEnviando(false);
      setModalVisible(true);
    }
  };

  return (
    <>
      <View
        style={[styles.container, { bottom: 240 + insets.bottom }]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.ripple,
            { transform: [{ scale: rippleScale }], opacity: rippleOpacity },
          ]}
          pointerEvents="none"
        />
        <Pressable onPressIn={startHold} onPressOut={cancelHold}>
          <Animated.View
            style={[styles.button, { transform: [{ scale: scaleAnim }] }]}
          >
            {isHolding ? (
              <Text style={styles.countdown}>{countdown}</Text>
            ) : (
              <MaterialCommunityIcons
                name="alarm-light"
                size={30}
                color={Colors.white}
              />
            )}
          </Animated.View>
        </Pressable>
        {!isHolding && (
          <View style={styles.label}>
            <Text style={styles.labelText}>SOS</Text>
          </View>
        )}
        {isHolding && (
          <View style={styles.holdLabel}>
            <Text style={styles.holdLabelText}>Segure…</Text>
          </View>
        )}
      </View>

      {/* Modal de confirmação final */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <MaterialCommunityIcons
                name="check-circle"
                size={48}
                color={Colors.success}
              />
            </View>
            <Text style={styles.modalTitle}>Alerta Enviado!</Text>
            <Text style={styles.modalBody}>
              {statusMensagem || "Sua localização foi compartilhada com segurança."}
            </Text>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                setModalVisible(false);
                setStatusMensagem("");
              }}
            >
              <Text style={styles.confirmBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const BTN = 60;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 20,
    alignItems: "center",
    zIndex: 999,
  },
  ripple: {
    position: "absolute",
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: Colors.emergency,
    alignSelf: "center",
  },
  button: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: Colors.emergency,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.emergency,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  countdown: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: "800",
  },
  label: {
    marginTop: 4,
    backgroundColor: Colors.emergencyDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  labelText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  holdLabel: {
    marginTop: 4,
    backgroundColor: Colors.emergencyDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  holdLabelText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    width: "100%",
    gap: 14,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.successLight,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.success,
  },
  modalBody: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  confirmBtn: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    marginTop: 4,
  },
  confirmBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
});