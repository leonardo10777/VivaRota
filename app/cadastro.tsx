import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuthStore } from "@/services/authStore";

const GENEROS = ["Masculino", "Feminino", "Não binário", "Prefiro não informar"];

export default function CadastroScreen() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [genero, setGenero] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [erros, setErros] = useState({
    nome: "",
    email: "",
    senha: "",
    genero: "",
    dataNascimento: "",
  });

  const { fazerCadastro, carregando, erro, limparErro } = useAuthStore();

  function handleDataNascimento(v: string) {
    const numeros = v.replace(/\D/g, "");
    let formatado = numeros;
    if (numeros.length >= 3) formatado = numeros.slice(0, 2) + "/" + numeros.slice(2);
    if (numeros.length >= 5) formatado = numeros.slice(0, 2) + "/" + numeros.slice(2, 4) + "/" + numeros.slice(4, 8);
    setDataNascimento(formatado);
    setErros((e) => ({ ...e, dataNascimento: "" }));
    limparErro();
  }

  function converterData(data: string): string {
    const partes = data.split("/");
    if (partes.length !== 3) return "";
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }

  function handleSalvar() {
    const novosErros = {
      nome: nome.trim() === "" ? "Informe o nome" : "",
      email: email.trim() === "" ? "Informe o e-mail" : "",
      senha: senha.trim() === "" ? "Informe a senha" : "",
      genero: genero.trim() === "" ? "Selecione o gênero" : "",
      dataNascimento: dataNascimento.length < 10 ? "Informe a data de nascimento" : "",
    };
    setErros(novosErros);

    const temErro = Object.values(novosErros).some((e) => e !== "");
    if (temErro) return;

    fazerCadastro({
      nome,
      email,
      senha,
      genero,
      dataNascimento: converterData(dataNascimento),
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/Logo VivaRota Fundo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Cadastro</Text>
        <Text style={styles.subtitle}>Crie sua conta</Text>

        <View style={styles.form}>

          {/* Nome */}
          <View style={styles.field}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={[styles.input, erros.nome ? styles.inputErro : null]}
              placeholder="Seu Nome"
              placeholderTextColor="#BDBDBD"
              autoCapitalize="words"
              value={nome}
              onChangeText={(v) => {
                setNome(v);
                setErros((e) => ({ ...e, nome: "" }));
                limparErro();
              }}
            />
            {erros.nome ? <Text style={styles.erro}>{erros.nome}</Text> : null}
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, erros.email ? styles.inputErro : null]}
              placeholder="seu@email.com"
              placeholderTextColor="#BDBDBD"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setErros((e) => ({ ...e, email: "" }));
                limparErro();
              }}
            />
            {erros.email ? <Text style={styles.erro}>{erros.email}</Text> : null}
          </View>

          {/* Senha */}
          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={[styles.input, erros.senha ? styles.inputErro : null]}
              placeholder="••••••••••"
              placeholderTextColor="#BDBDBD"
              secureTextEntry
              value={senha}
              onChangeText={(v) => {
                setSenha(v);
                setErros((e) => ({ ...e, senha: "" }));
                limparErro();
              }}
            />
            {erros.senha ? <Text style={styles.erro}>{erros.senha}</Text> : null}
          </View>

          {/* Data de Nascimento */}
          <View style={styles.field}>
            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput
              style={[styles.input, erros.dataNascimento ? styles.inputErro : null]}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#BDBDBD"
              keyboardType="numeric"
              maxLength={10}
              value={dataNascimento}
              onChangeText={handleDataNascimento}
            />
            {erros.dataNascimento ? <Text style={styles.erro}>{erros.dataNascimento}</Text> : null}
          </View>

          {/* Gênero */}
          <View style={styles.field}>
            <Text style={styles.label}>Gênero</Text>
            <View style={styles.generoContainer}>
              {GENEROS.map((g) => (
                <Pressable
                  key={g}
                  style={[
                    styles.generoBotao,
                    genero === g && styles.generoBotaoSelecionado,
                  ]}
                  onPress={() => {
                    setGenero(g);
                    setErros((e) => ({ ...e, genero: "" }));
                    limparErro();
                  }}
                >
                  <Text
                    style={[
                      styles.generoTexto,
                      genero === g && styles.generoTextoSelecionado,
                    ]}
                  >
                    {g}
                  </Text>
                </Pressable>
              ))}
            </View>
            {erros.genero ? <Text style={styles.erro}>{erros.genero}</Text> : null}
          </View>

          {/* Erro da API */}
          {erro && (
            <View style={styles.erroContainer}>
              <Text style={styles.erroApi}>⚠️ {erro}</Text>
            </View>
          )}

          {/* Botões */}
          <View style={styles.btnRow}>
            <Pressable
              style={({ pressed }) => [styles.btnCancelar, pressed && styles.pressed]}
              onPress={() => router.back()}
              disabled={carregando}
            >
              <Text style={styles.btnCancelarText}>Logar</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.btnSalvar, pressed && styles.pressed]}
              onPress={handleSalvar}
              disabled={carregando}
            >
              {carregando
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.btnSalvarText}>Cadastrar</Text>
              }
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 72,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 36,
    fontWeight: "400",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#9E9E9E",
    textAlign: "center",
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1A1A1A",
  },
  erroContainer: {
    backgroundColor: "#FFF0F0",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#E53935",
  },
  erroApi: {
    color: "#E53935",
    fontSize: 13,
    fontWeight: "500",
  },
  generoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  generoBotao: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  generoBotaoSelecionado: {
    backgroundColor: "#1A1A2E",
    borderColor: "#1A1A2E",
  },
  generoTexto: {
    fontSize: 13,
    color: "#1A1A1A",
  },
  generoTextoSelecionado: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  btnCancelar: {
    flex: 1,
    backgroundColor: "#EEEEEE",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnCancelarText: {
    color: "#1A1A1A",
    fontSize: 16,
    fontWeight: "400",
  },
  btnSalvar: {
    flex: 1,
    backgroundColor: "#1A1A2E",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnSalvarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  inputErro: {
    borderWidth: 1,
    borderColor: "#E53935",
  },
  erro: {
    fontSize: 12,
    color: "#E53935",
  },
  pressed: {
    opacity: 0.75,
  },
});