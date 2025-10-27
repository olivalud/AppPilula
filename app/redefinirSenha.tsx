import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  SafeAreaView,
} from "react-native";
import Logo from "../src/assets/logo.png";
import { MaskedTextInput } from "react-native-mask-text";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const InterfaceDeRedefinirSenha = () => {
  const router = useRouter();

  return (
    <LinearGradient
      style={styles.interfaceDeCadastro}
      locations={[0, 0.72, 1]}
      colors={["#d2d2d2", "#80aead", "#2f8b89"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollviewContent}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Image source={Logo} style={styles.logo1Icon} resizeMode="contain" />
        <Text style={styles.crieSuaConta}>Recuperar Senha</Text>
        <Text style={styles.textoSecund}>Enviaremos um link para {"\n"}redefinir sua senha</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Pressable style={styles.buttonSend} onPress={() => {}}>
          <Text style={styles.enviarText}>Enviar</Text>
        </Pressable>

        <Pressable style={styles.buttonReturn} onPress={() => {if (router.canGoBack()) { router.back(); } else { router.replace("/"); }}}>
          <Text style={styles.fazerLogin}>Fazer Login</Text>
        </Pressable>

        <Text style={styles.v100}>v1.0.0</Text>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  interfaceDeCadastro: {
    flex: 1,
    width: "100%",
  },
  scrollviewContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 70,
    paddingBottom: 50,
  },
  logo1Icon: {
    width: 200,
    height: 200,
    marginBottom: 15,
  },
  crieSuaConta: {
    fontSize: 36,
    fontWeight: "500",
    color: "rgba(0, 0, 0, 0.9)",
    marginBottom: 30,
  },
  textoSecund: {
    textAlign: "center",
    marginBottom: 25,
    fontSize: 20,
    fontWeight: "500",
    lineHeight: 25,
  },
  input: {
    width: "80%",
    height: 60,
    borderBottomWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.9)",
    fontSize: 22,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    height: 60,
    borderBottomWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.9)",
    marginBottom: 25,
    position: "relative",
  },
  inputField: {
    flex: 1,
    height: "100%",
    fontSize: 22,
    paddingHorizontal: 10,
    paddingRight: 20,
  },
  eyeIcon: {
    position: "absolute",
    right: 0,
    padding: 10,
  },
  buttonSend: {
    elevation: 4,
    borderRadius: 32,
    backgroundColor: "#fff",
    width: "80%",
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  enviarText: {
    fontSize: 30,
    fontWeight: "500",
    color: "rgba(0, 0, 0, 0.9)",
  },
  buttonReturn: {
    marginTop: 25,
  },
  fazerLogin: {
    fontSize: 20,
    fontWeight: "500",
    color: "rgba(0, 0, 0, 0.9)",
  },
  v100: {
    fontSize: 20,
    color: "#000",
    fontWeight: "500",
    position: "absolute",
    bottom: 15,
  },
});

export default InterfaceDeRedefinirSenha;
