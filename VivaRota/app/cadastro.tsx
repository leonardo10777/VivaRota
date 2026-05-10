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
import { cadastrar } from "../services/auth";

const GENEROS = ["Masculino", "Feminino", "Outro", "Prefiro não dizer"];

export default function CadastroScreen() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [erros, setErros] = useState({ nome: "", email: "", senha: "", dataNascimento: "", genero: "" });
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");

  function handleDataChange(texto: string) {
    const numeros = texto.replace(/\D/g, "").slice(0, 8);
    let formatado = numeros;
    if (numeros.length > 4) formatado = numeros.slice(0, 2) + "/" + numeros.slice(2, 4) + "/" + numeros.slice(4);
    else if (numeros.length > 2) formatado = numeros.slice(0, 2) + "/" + numeros.slice(2);
    setDataNascimento(formatado);
    setErros((e) => ({ ...e, dataNascimento: "" }));
    setErroGeral("");
  }

  function converterData(data: string): string {
    const partes = data.split("/");
    if (partes.length !== 3) return "";
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }

  function emailValido(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  async function handleSalvar() {
    setErroGeral("");

    const novosErros = {
      nome: nome.trim() === "" ? "Informe o nome" : "",
      email: email.trim() === "" ? "Informe o e-mail" : !emailValido(email) ? "E-mail inválido" : "",
      senha: senha.trim() === "" ? "Informe a senha" : senha.length < 6 ? "A senha deve ter pelo menos 6 caracteres" : "",
      dataNascimento: dataNascimento.length < 10 ? "Informe a data no formato DD/MM/AAAA" : "",
      genero: genero === "" ? "Selecione o gênero" : "",
    };
    setErros(novosErros);
    if (Object.values(novosErros).some((e) => e !== "")) return;

    const dataISO = converterData(dataNascimento);
    if (!dataISO) {
      setErros((e) => ({ ...e, dataNascimento: "Data inválida" }));
      return;
    }

    setCarregando(true);
    try {
      await cadastrar({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        genero,
        dataNascimento: dataISO,
      });
      router.replace("/boasvindas");
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 400) {
        const msg = error?.response?.data?.message ?? "Dados inválidos. Verifique os campos.";
        setErroGeral(msg);
      } else if (status === 409) {
        setErroGeral("E-mail já cadastrado. Tente fazer login.");
      } else {
        setErroGeral("Erro de conexão. Verifique sua rede e tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
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
          {erroGeral ? (
            <View style={styles.erroGeralBox}>
              <Text style={styles.erroGeralText}>{erroGeral}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={[styles.input, erros.nome ? styles.inputErro : null]}
              placeholder="Seu Nome"
              placeholderTextColor="#BDBDBD"
              autoCapitalize="words"
              value={nome}
              onChangeText={(v) => { setNome(v); setErros((e) => ({ ...e, nome: "" })); }}
            />
            {erros.nome ? <Text style={styles.erro}>{erros.nome}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, erros.email ? styles.inputErro : null]}
              placeholder="seu@email.com"
              placeholderTextColor="#BDBDBD"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(v) => { setEmail(v); setErros((e) => ({ ...e, email: "" })); setErroGeral(""); }}
            />
            {erros.email ? <Text style={styles.erro}>{erros.email}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={[styles.input, erros.senha ? styles.inputErro : null]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#BDBDBD"
              secureTextEntry
              value={senha}
              onChangeText={(v) => { setSenha(v); setErros((e) => ({ ...e, senha: "" })); }}
            />
            {erros.senha ? <Text style={styles.erro}>{erros.senha}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Data de nascimento</Text>
            <TextInput
              style={[styles.input, erros.dataNascimento ? styles.inputErro : null]}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#BDBDBD"
              keyboardType="numeric"
              value={dataNascimento}
              onChangeText={handleDataChange}
              maxLength={10}
            />
            {erros.dataNascimento ? <Text style={styles.erro}>{erros.dataNascimento}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Gênero</Text>
            <View style={styles.generosGrid}>
              {GENEROS.map((g) => (
                <Pressable
                  key={g}
                  style={[styles.generoOpcao, genero === g && styles.generoSelecionado]}
                  onPress={() => { setGenero(g); setErros((e) => ({ ...e, genero: "" })); }}
                >
                  <Text style={[styles.generoTexto, genero === g && styles.generoTextoSelecionado]}>
                    {g}
                  </Text>
                </Pressable>
              ))}
            </View>
            {erros.genero ? <Text style={styles.erro}>{erros.genero}</Text> : null}
          </View>

          <View style={styles.btnRow}>
            <Pressable
              style={({ pressed }) => [styles.btnCancelar, pressed && styles.pressed]}
              onPress={() => router.back()}
              disabled={carregando}
            >
              <Text style={styles.btnCancelarText}>Voltar</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.btnSalvar, pressed && styles.pressed, carregando && styles.btnDesabilitado]}
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
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { flexGrow: 1, paddingHorizontal: 32, paddingTop: 72, paddingBottom: 40 },
  logoContainer: { alignItems: "center", marginBottom: 32 },
  logo: { width: 180, height: 180 },
  title: { fontSize: 36, fontWeight: "400", color: "#1A1A1A", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#9E9E9E", textAlign: "center", marginBottom: 40 },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: "500", color: "#1A1A1A" },
  input: { backgroundColor: "#F5F5F5", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: "#1A1A1A" },
  inputErro: { borderWidth: 1, borderColor: "#E53935" },
  erro: { fontSize: 12, color: "#E53935" },
  erroGeralBox: { backgroundColor: "#FFEBEE", borderRadius: 8, padding: 12 },
  erroGeralText: { color: "#C62828", fontSize: 14, textAlign: "center" },
  generosGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  generoOpcao: { backgroundColor: "#F5F5F5", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: "#E0E0E0" },
  generoSelecionado: { backgroundColor: "#1A1A2E", borderColor: "#1A1A2E" },
  generoTexto: { fontSize: 14, color: "#1A1A1A" },
  generoTextoSelecionado: { color: "#FFFFFF", fontWeight: "500" },
  btnRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  btnCancelar: { flex: 1, backgroundColor: "#EEEEEE", borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  btnCancelarText: { color: "#1A1A1A", fontSize: 16, fontWeight: "400" },
  btnSalvar: { flex: 1, backgroundColor: "#1A1A2E", borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  btnSalvarText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  btnDesabilitado: { opacity: 0.7 },
  pressed: { opacity: 0.75 },
});