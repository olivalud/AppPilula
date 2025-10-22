import { useRouter } from "expo-router";
import * as React from "react";
import {Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundLogin from "../../src/assets/background-login.png";
import Logo from "../../src/assets/logo.png";
import { MaskedTextInput } from "react-native-mask-text";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const InterfaceDeLoginImage = () => {
  const router = useRouter();

const [password, setPassword] = React.useState('');
  const [isPasswordVisible, setPasswordVisible] = React.useState(false);

  return (
    <View style={styles.interfaceDeLoginImage}>
      <ImageBackground source={BackgroundLogin} style={styles.backgroundIcon} resizeMode="cover">
        <SafeAreaView style={styles.view}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.headerContainer}>
              <Image source={Logo} style={styles.logo1Icon} resizeMode="contain"/>
              <Text style={styles.plula}>Pílula+</Text>
            </View>
            <MaskedTextInput style={styles.input} placeholder="CPF" keyboardType="numeric" mask="999.999.999-99" onChangeText={(text, rawText) => { console.log(text); console.log(rawText); }}/>
            <View style={styles.passwordContainer}>
              <TextInput style={styles.inputField} placeholder="Senha" value={password} onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}/>
              <Pressable onPress={() => setPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                <MaterialCommunityIcons name={isPasswordVisible ? 'eye' : 'eye-off'} size={30} color="rgba(0, 0, 0, 0.7)"/>
              </Pressable>
            </View>
            <Pressable style={styles.forgotPasswordButton}>
              <Text style={styles.esqueceuASenha}>Esqueceu a senha?</Text>
            </Pressable>
            <Pressable style={styles.buttonLogin} onPress={() => {}}>
              <Text style={styles.entrar}>Entrar</Text>
            </Pressable>
            <Pressable style={styles.registerButton} onPress={() => {router.push("/cadastro");}}>
              <Text style={styles.cadastreSe}>Cadastre-se</Text>
            </Pressable>
            <Text style={styles.v100}>v1.0.0</Text>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  interfaceDeLoginImage: {
    flex: 1,
  },
  view: {
    width: "100%",
    flex: 1,
  },
  backgroundIcon: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  logo1Icon: {
    width: 200,
    height: 150,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  plula: {
    fontSize: 45,
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#000",
    marginTop: 10,
  },
  input: {
    width: "90%",
    height: 60,
    borderBottomWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.9)",
    fontSize: 26,
    marginBottom: 25,
    paddingHorizontal: 10,
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
  forgotPasswordButton: {
    marginBottom: 40,
  },
  esqueceuASenha: {
    fontSize: 22,
    color: "rgba(0, 0, 0, 0.9)",
    fontFamily: "Inter-Medium",
    fontWeight: "500",
  },
  buttonLogin: {
    elevation: 4,
    borderRadius: 32,
    backgroundColor: "#fff",
    width: "90%",
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  entrar: {
    fontSize: 30,
    color: "rgba(0, 0, 0, 0.9)",
    fontFamily: "Inter-Medium",
    fontWeight: "500",
  },
  registerButton: {
    marginBottom: 50,
  },
  cadastreSe: {
    fontSize: 22,
    color: "rgba(0, 0, 0, 0.9)",
    fontFamily: "Inter-Medium",
    fontWeight: "500",
  },
  v100: {
    fontSize: 20,
    color: "#000",
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    position: "absolute",
    bottom: 15,
  },
});

export default InterfaceDeLoginImage;
