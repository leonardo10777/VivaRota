import { api } from './api';
import * as SecureStore from 'expo-secure-store';

export async function cadastrar(dados: {
  nome: string;
  email: string;
  senha: string;
  genero?: string;
  dataNascimento?: string;
}) {
  console.log('📡 [API] POST /usuarios/cadastro');
  const { data } = await api.post('/usuarios/cadastro', dados);
  console.log('📡 [API] Resposta cadastro:', data);
  return data;
}

export async function login(email: string, senha: string) {
  console.log('📡 [API] POST /auth/login — email:', email);
  const { data } = await api.post('/auth/login', { email, senha });
  console.log('📡 [API] Resposta login — usuário:', data.nomeUsuario);
  await SecureStore.setItemAsync('jwt_token', data.token);
  console.log('💾 [API] Token salvo no SecureStore');
  return data;
}

export async function logout() {
  console.log('📡 [API] Removendo token do SecureStore');
  await SecureStore.deleteItemAsync('jwt_token');
}

export async function getToken() {
  const token = await SecureStore.getItemAsync('jwt_token');
  console.log('🔑 [API] Token recuperado:', token ? 'existe' : 'não encontrado');
  return token;
}