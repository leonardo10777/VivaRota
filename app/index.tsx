import { recuperarSessao } from '@/services/auth';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Index() {
  useEffect(() => {
    recuperarSessao().then(sessao => {
      setTimeout(() => {
        if (sessao) {
          router.replace('/perfil');
        } else {
          router.replace('/login');
        }
      }, 100);
    });
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1a56db" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4ff' },
});