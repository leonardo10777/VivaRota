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

export default function ApresentacaoScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.row}>
          <View style={[styles.card, styles.cardLeft]}>
            <Image
              source={require("../assets/images/Logo VivaRota Fundo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.texto}>
              <Text style={styles.destaque}>🚶‍♂️ O que é o VivaRota?{"\n"}</Text>
              O VivaRota é um aplicativo de navegação para pedestres que prioriza
              a sua segurança. Ele mostra o caminho mais tranquilo para você
              chegar a pé ao seu destino, considerando dados reais sobre áreas de
              risco.
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.cardRight]}>
            <Text style={styles.texto}>
              <Text style={styles.destaque}>Como funciona em 4 passos:{"\n\n"}</Text>
              <Text style={styles.destaque}>1️⃣ Você escolhe o destino{"\n"}</Text>
              Digite para onde quer ir, como em qualquer mapa.{"\n\n"}
              <Text style={styles.destaque}>2️⃣ O VivaRota analisa a região{"\n"}</Text>
              O app utiliza informações atualizadas sobre ocorrências de assaltos
              e zonas de alerta na sua cidade.{"\n\n"}
              <Text style={styles.destaque}>3️⃣ Receba a rota mais segura{"\n"}</Text>
              O VivaRota calcula automaticamente o trajeto que evita áreas
              perigosas – priorizando ruas movimentadas, bem iluminadas e com
              menor histórico de violência.{"\n\n"}
              <Text style={styles.destaque}>4️⃣ Veja os lugares de atenção no mapa{"\n"}</Text>
              Além da rota sugerida, você visualiza zonas de alerta marcadas no
              mapa (em cores como vermelho ou laranja). Assim, você fica informado
              e pode redobrar a atenção onde for necessário.
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.cardLeft]}>
            <Text style={styles.texto}>
              <Text style={styles.destaque}>⚠️ Alertas durante o caminho{"\n"}</Text>
              Enquanto você caminha, o VivaRota avisa se você estiver se
              aproximando de uma região com histórico de ocorrências.{"\n\n"}
              <Text style={styles.alerta}>
                "Atenção: você está entrando em uma zona de alerta. Mantenha-se
                atento ao redor."{"\n\n"}
              </Text>
              <Text style={styles.destaque}>Por que escolher o VivaRota?{"\n"}</Text>
              🚶 Foco no pedestre – pensado para quem anda a pé, não para carros{"\n"}
              🔒 Segurança em primeiro lugar – a rota mais tranquila vale mais que a mais rápida{"\n"}
              🗺️ Informação visual clara – mapa com cores indicando níveis de alerta{"\n"}
              😌 Tranquilidade para caminhar – você sabe onde está e o que esperar de cada região
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.btnAnterior,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.btnAnteriorText}>ANTERIOR</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.btnProximo,
              pressed && styles.pressed,
            ]}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.btnProximoText}>PRÓXIMO</Text>
          </Pressable>
        </View>
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
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  row: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    width: "85%",
    gap: 12,
  },
  cardLeft: {
    alignSelf: "flex-start",
  },
  cardRight: {
    alignSelf: "flex-end",
  },
  logo: {
    width: 90,
    height: 90,
    alignSelf: "center",
  },
  texto: {
    fontSize: 13,
    color: "#1A1A1A",
    lineHeight: 21,
  },
  destaque: {
    fontWeight: "700",
    color: "#1A1A1A",
  },
  alerta: {
    fontStyle: "italic",
    color: "#E65100",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 8,
  },
  btnAnterior: {
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  btnAnteriorText: {
    color: "#1A7FD4",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  btnProximo: {
    paddingHorizontal: 8,
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
