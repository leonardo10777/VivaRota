import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function BoasVindasScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoCard}>
          <Image
            source={require("../assets/images/Logo VivaRota Fundo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.texto}>
            💛 Que bom ter você por aqui!{"\n\n"}
            Sabemos que andar a pé pela cidade pode ser preocupante. Por isso,
            criamos o VivaRota – um guia inteligente que ajuda você a chegar ao
            seu destino com mais segurança.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.texto}>
            Com base em informações atualizadas sobre assaltos e áreas de risco,
            o VivaRota escolhe a rota mais tranquila para você. E mais: dá para
            ver no mapa os lugares perigosos, para você evitar ou ficar atento.
            {"\n\n"}
            🗺️ Aqui, o caminho mais curto nem sempre é o melhor. O mais seguro,
            sim.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.texto}>
            Na próxima tela, vamos te mostrar como funciona – é bem rápido.
            Depois, é só escolher pra onde quer ir e confiar na rota.{"\n\n"}
            Pronto para viver a rota com mais paz? 👣🔒{"\n\n"}
            <Text style={styles.tagline}>
              VivaRota – Seu caminho, sua vida, sua segurança.
            </Text>
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.btnProximo, pressed && styles.pressed]}
          onPress={() => router.push("/apresentacao")}
        >
          <Text style={styles.btnProximoText}>PRÓXIMO</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A7FD4",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  logoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
  texto: {
    fontSize: 14,
    color: "#1A1A1A",
    lineHeight: 22,
  },
  tagline: {
    fontWeight: "700",
    color: "#1A7FD4",
  },
  btnProximo: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  btnProximoText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
