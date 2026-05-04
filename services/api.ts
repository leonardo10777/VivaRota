import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const ROTAS_PUBLICAS = ['/usuarios/cadastro', '/auth/login'];

console.log('🌐 [API] Base URL:', process.env.EXPO_PUBLIC_API_URL);

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use(async (config) => {
  const isPublica = ROTAS_PUBLICAS.some((rota) =>
    config.url?.includes(rota)
  );

  if (!isPublica) {
    const token = await SecureStore.getItemAsync('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 [INTERCEPTOR] JWT injetado na requisição:', config.url);
    } else {
      console.log('⚠️ [INTERCEPTOR] Sem token para:', config.url);
    }
  } else {
    console.log('🔓 [INTERCEPTOR] Rota pública — sem JWT:', config.url);
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ [INTERCEPTOR] Resposta:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('❌ [INTERCEPTOR] Erro:', error?.response?.status, error?.config?.url);
    console.log('❌ [INTERCEPTOR] Mensagem:', error?.response?.data);
    return Promise.reject(error);
  }
);