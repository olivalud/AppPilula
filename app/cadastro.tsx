import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import Logo from '../src/assets/logo.png';

const InterfaceDeCadastro = () => {
  const router = useRouter();

  return (
    <LinearGradient
      style={styles.interfaceDeCadastro}
      locations={[0, 0.72, 1]}
      colors={['#d2d2d2', '#80aead', '#2f8b89']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollviewContent}>
        <Image source={Logo} style={styles.logo1Icon} resizeMode="contain" />
        <Text style={styles.crieSuaConta}>Crie sua conta</Text>

        <TextInput style={styles.input} placeholder="Nome Completo" />
        <TextInput style={styles.input} placeholder="CPF" keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Senha" secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirmar Senha" secureTextEntry />

        <Pressable style={styles.buttonCreate} onPress={() => { }}>
          <Text style={styles.criarContaText}>Criar Conta</Text>
        </Pressable>

        <Pressable style={styles.buttonReturn} onPress={() => router.back()}>
          <Text style={styles.fazerLogin}>Fazer Login</Text>
        </Pressable>

        <Text style={styles.v100}>v1.0.0</Text>
      </ScrollView>
    </LinearGradient>);
};

const styles = StyleSheet.create({
  interfaceDeCadastro: {
    flex: 1,
    width: "100%",
  },
  scrollviewContent: {
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 50,
    paddingHorizontal: 20
  },
  logo1Icon: {
    width: 200,
    height: 200,
    marginBottom: 15
  },
  crieSuaConta: {
    fontSize: 36,
    fontWeight: '500',
    color: "rgba(0, 0, 0, 0.9)",
    marginBottom: 30
  },
  input: {
    width: '90%',
    height: 60,
    borderBottomWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.9)",
    fontSize: 22,
    marginBottom: 20,
    paddingHorizontal: 10
  },
  buttonCreate: {
    elevation: 4,
    borderRadius: 32,
    backgroundColor: "#fff",
    width: '90%',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  criarContaText: {
    fontSize: 30,
    fontWeight: '500',
    color: "rgba(0, 0, 0, 0.9)"
  },
  buttonReturn: {
    marginTop: 25
  },
  fazerLogin: {
    fontSize: 18,
    fontWeight: '500',
    color: "rgba(0, 0, 0, 0.9)"
  },
  v100: {
    fontSize: 20,
    color: "#000",
    fontWeight: "500",
    marginTop: 30
  }
});

export default InterfaceDeCadastro;
