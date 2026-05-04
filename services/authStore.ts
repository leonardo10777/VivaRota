import { router } from "expo-router";
import { create } from "zustand";
import { cadastrar, login, logout } from "../services/auth";

interface AuthStore {
  carregando: boolean;
  erro: string | null;
  nomeUsuario: string | null;
  fazerLogin: (email: string, senha: string) => Promise<void>;
  fazerCadastro: (dados: {
    nome: string;
    email: string;
    senha: string;
    genero: string;
    dataNascimento: string;
  }) => Promise<void>;
  fazerLogout: () => Promise<void>;
  limparErro: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  carregando: false,
  erro: null,
  nomeUsuario: null,

  limparErro: () => set({ erro: null }),

  fazerLogin: async (email, senha) => {
    console.log("🔐 [AUTH] Iniciando login para:", email);
    set({ carregando: true, erro: null });

    try {
      const data = await login(email, senha);
      console.log("✅ [AUTH] Login bem-sucedido:", data.nomeUsuario);
      console.log("🎟️ [AUTH] Token recebido:", data.token?.substring(0, 20) + "...");
      set({ nomeUsuario: data.nomeUsuario });
      router.replace("/mapa");

    } catch (e: any) {
      const status = e?.response?.status;

      let msg = "Erro ao fazer login. Tente novamente.";
      if (status === 400 || status === 401 || status === 403) {
        msg = "E-mail ou senha incorretos.";
      } else if (status === 404) {
        msg = "Usuário não encontrado.";
      } else if (status === 500) {
        msg = "Erro interno do servidor. Tente novamente mais tarde.";
      } else if (!status) {
        msg = "Sem conexão com o servidor. Verifique sua internet.";
      }

      console.log("❌ [AUTH] Erro no login — status:", status, "| mensagem:", msg);
      set({ erro: msg });

    } finally {
      set({ carregando: false });
      console.log("🔄 [AUTH] Login finalizado");
    }
  },

  fazerCadastro: async (dados) => {
    console.log("📝 [AUTH] Iniciando cadastro para:", dados.email);
    set({ carregando: true, erro: null });

    try {
      console.log("📤 [AUTH] Enviando dados de cadastro:", {
        nome: dados.nome,
        email: dados.email,
        genero: dados.genero,
        dataNascimento: dados.dataNascimento,
      });

      await cadastrar({ ...dados });
      console.log("✅ [AUTH] Cadastro realizado com sucesso");

      console.log("🔐 [AUTH] Fazendo login automático após cadastro...");
      const data = await login(dados.email, dados.senha);
      console.log("✅ [AUTH] Login automático bem-sucedido:", data.nomeUsuario);
      set({ nomeUsuario: data.nomeUsuario });
      router.replace("/mapa");

    } catch (e: any) {
      const status = e?.response?.status;
      const msgBackend = e?.response?.data?.message;

      let msg = "Erro ao cadastrar. Tente novamente.";
      if (status === 400) {
        msg = msgBackend ?? "Dados inválidos. Verifique os campos.";
      } else if (status === 409) {
        msg = "E-mail já cadastrado. Tente fazer login.";
      } else if (status === 500) {
        msg = "Erro interno do servidor. Tente novamente mais tarde.";
      } else if (status === 503) {
        msg = "Serviço indisponível. Verifique sua conexão.";
      } else if (!status) {
        msg = "Sem conexão com o servidor. Verifique sua internet.";
      }

      console.log("❌ [AUTH] Erro no cadastro — status:", status, "| mensagem:", msg);
      set({ erro: msg });

    } finally {
      set({ carregando: false });
      console.log("🔄 [AUTH] Cadastro finalizado");
    }
  },

  fazerLogout: async () => {
    console.log("🚪 [AUTH] Fazendo logout...");
    await logout();
    set({ nomeUsuario: null, erro: null });
    console.log("✅ [AUTH] Logout realizado");
    router.replace("/login");
  },
}));