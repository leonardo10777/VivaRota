import * as SecureStore from 'expo-secure-store';
import api from './api';

const TOKEN_KEY = 'vivarota_token';
const USER_KEY = 'vivarota_user';

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface CadastroPayload {
  nome: string;
  email: string;
  senha: string;
  genero: string;
  dataNascimento: string; // formato: "YYYY-MM-DD"
}

export interface Usuario {
  token: string;
  nomeUsuario: string;
  usuarioId: number;
}

// Salva token e dados do usuário no SecureStore
export async function salvarSessao(dados: Usuario) {
  await SecureStore.setItemAsync(TOKEN_KEY, dados.token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(dados));
  // Injeta o token no header padrão do Axios para todas as requisições futuras
  api.defaults.headers.common['Authorization'] = `Bearer ${dados.token}`;
}

// Recupera a sessão salva (usar ao abrir o app)
export async function recuperarSessao(): Promise<Usuario | null> {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    if (!raw) return null;
    const dados: Usuario = JSON.parse(raw);
    api.defaults.headers.common['Authorization'] = `Bearer ${dados.token}`;
    return dados;
  } catch {
    return null;
  }
}

// Remove sessão (logout)
export async function limparSessao() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
  delete api.defaults.headers.common['Authorization'];
}

// POST /auth/login
export async function login(payload: LoginPayload): Promise<Usuario> {
  const response = await api.post('/auth/login', payload);
  const dados: Usuario = {
    token: response.data.token,
    nomeUsuario: response.data.nomeUsuario,
    usuarioId: response.data.usuarioId,
  };
  await salvarSessao(dados);
  return dados;
}

// POST /usuarios/cadastro
export async function cadastrar(payload: CadastroPayload): Promise<void> {
  await api.post('/usuarios/cadastro', payload);
  // Após cadastro, faz login automaticamente
  await login({ email: payload.email, senha: payload.senha });
}