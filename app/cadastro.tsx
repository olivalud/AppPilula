import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Logo from '../src/assets/logo.png';
import { MaskedTextInput } from "react-native-mask-text";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const InterfaceDeCadastro = () => {
  const router = useRouter();

const [password, setPassword] = React.useState('');
  const [isPasswordVisible, setPasswordVisible] = React.useState(false);
  
const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = React.useState(false);

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
        <MaskedTextInput style={styles.input} placeholder="CPF" keyboardType="numeric" mask="999.999.999-99" onChangeText={(text, rawText) => { console.log(text); console.log(rawText); }}/>
        <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress"/>
        <View style={styles.passwordContainer}>
          <TextInput style={styles.inputField} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible}/>
          <Pressable onPress={() => setPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
              <MaterialCommunityIcons name={isPasswordVisible ? 'eye' : 'eye-off'} size={30} color="rgba(0, 0, 0, 0.7)"/>
                </Pressable>
                  </View>
        <View style={styles.passwordContainer}>
          <TextInput style={styles.inputField} placeholder="Confirmar Senha" value={confirmPassword} onChangeText={setConfirmPassword}
          secureTextEntry={!isConfirmPasswordVisible}/>
          <Pressable onPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.eyeIcon}>
            <MaterialCommunityIcons name={isConfirmPasswordVisible ? 'eye' : 'eye-off'} size={30} color="rgba(0, 0, 0, 0.7)"/>
              </Pressable>
                </View>

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
  passwordContainer: {
    flexDirection: 'row',       
    alignItems: 'center',     
    width: '90%',
    height: 60,
    borderBottomWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.9)",
    marginBottom: 25,
  },
  inputField: {
    flex: 1,               
    height: '100%',
    fontSize: 26,
    paddingHorizontal: 10,
  },
  eyeIcon: {
    padding: 10, 
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
    fontSize: 25,
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
