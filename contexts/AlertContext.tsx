// ═══════════════════════════════════════════════════════════════
// 📁 contexts/AlertContext.tsx
// ═══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface AlertConfig {
  type: 'emergency' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // em ms, 0 = não desaparece automaticamente
  icon?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
  currentAlert: AlertConfig | null;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [currentAlert, setCurrentAlert] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((config: AlertConfig) => {
    setCurrentAlert(config);

    // Se tem duration, remove automaticamente
    if (config.duration && config.duration > 0) {
      const timer = setTimeout(() => {
        setCurrentAlert(null);
      }, config.duration);
      return () => clearTimeout(timer);
    }
  }, []);

  const hideAlert = useCallback(() => {
    setCurrentAlert(null);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, currentAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert deve ser usado dentro de AlertProvider');
  }
  return context;
}