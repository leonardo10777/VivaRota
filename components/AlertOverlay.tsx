

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlert, AlertConfig } from '@/contexts/AlertContext';
import { Colors } from '@/constants/Colors';

export function AlertOverlay() {
  const insets = useSafeAreaInsets();
  const { currentAlert, hideAlert } = useAlert();
  
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentAlert) {
      // Animar entrada
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animar saída
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: -200,
          useNativeDriver: true,
          speed: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
          speed: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentAlert, slideAnim, scaleAnim, opacityAnim]);

  if (!currentAlert) return null;

  const alertStyles = getAlertStyles(currentAlert.type);
  const iconName = currentAlert.icon || getIconName(currentAlert.type);

  return (
    <>
      {/* Overlay escuro (aparece apenas em emergência) */}
      {currentAlert.type === 'emergency' && (
        <Animated.View
          style={[
            styles.overlay,
            { opacity: opacityAnim },
            { pointerEvents: currentAlert ? 'auto' : 'none' },
          ]}
          pointerEvents={currentAlert ? 'auto' : 'none'}
        >
          <Pressable style={{ flex: 1 }} onPress={hideAlert} />
        </Animated.View>
      )}

      {/* Alerta principal */}
      <Animated.View
        style={[
          styles.alertContainer,
          {
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
            opacity: opacityAnim,
          },
          { top: insets.top + 8 },
        ]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={hideAlert}
          style={[styles.alertCard, { backgroundColor: alertStyles.background }]}
        >
          <View style={styles.alertContent}>
            {/* Barra colorida esquerda */}
            <View style={[styles.colorBar, { backgroundColor: alertStyles.color }]} />

            {/* Ícone */}
            <View style={[styles.iconContainer, { backgroundColor: alertStyles.colorLight }]}>
              <MaterialCommunityIcons
                name={iconName}
                size={24}
                color={alertStyles.color}
              />
            </View>

            {/* Texto */}
            <View style={styles.textContainer}>
              <Text style={[styles.alertTitle, { color: alertStyles.color }]}>
                {currentAlert.title}
              </Text>
              <Text style={[styles.alertMessage, { color: Colors.textSecondary }]}>
                {currentAlert.message}
              </Text>
            </View>

            {/* Botão de fechar */}
            <TouchableOpacity
              onPress={hideAlert}
              hitSlop={12}
              style={styles.closeBtn}
            >
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={alertStyles.color}
              />
            </TouchableOpacity>
          </View>

          {/* Botão de ação (se houver) */}
          {currentAlert.action && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: alertStyles.color }]}
              onPress={() => {
                currentAlert.action?.onPress();
                hideAlert();
              }}
            >
              <Text style={styles.actionBtnText}>{currentAlert.action.label}</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={16}
                color="#fff"
              />
            </TouchableOpacity>
          )}
        </Pressable>
      </Animated.View>
    </>
  );
}

/**
 * Retorna ícone baseado no tipo de alerta
 */
function getIconName(type: AlertConfig['type']): string {
  switch (type) {
    case 'emergency':
      return 'alarm-light';
    case 'success':
      return 'check-circle';
    case 'warning':
      return 'alert-circle';
    case 'info':
      return 'information';
    default:
      return 'bell';
  }
}

/**
 * Retorna cores baseadas no tipo de alerta
 */
function getAlertStyles(type: AlertConfig['type']) {
  switch (type) {
    case 'emergency':
      return {
        color: '#EF4444', // Red
        colorLight: '#FEE2E2',
        background: '#FFF5F5',
      };
    case 'success':
      return {
        color: '#10B981', // Green
        colorLight: '#D1FAE5',
        background: '#F0FDF4',
      };
    case 'warning':
      return {
        color: '#F59E0B', // Amber
        colorLight: '#FEF3C7',
        background: '#FFFBEB',
      };
    case 'info':
      return {
        color: '#3B82F6', // Blue
        colorLight: '#DBEAFE',
        background: '#EFF6FF',
      };
    default:
      return {
        color: Colors.primary,
        colorLight: Colors.primaryLight,
        background: '#F9FAFB',
      };
  }
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  alertContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 999,
    paddingHorizontal: 0,
  },
  alertCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  colorBar: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginLeft: -16,
    marginRight: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  closeBtn: {
    padding: 4,
    marginRight: -4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});