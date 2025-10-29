import { useRouter } from "expo-router";
import * as React from "react";
import {Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Platform} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundLogin from "../src/assets/background-login.png";
import Logo from "../src/assets/logo.png";
import { MaskedTextInput } from "react-native-mask-text";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const iconSize = Platform.OS === 'web' ? 22 : 30;

const InterfaceDeLoginImage = () => {
  const router = useRouter();

const [password, setPassword] = React.useState('');
  const [isPasswordVisible, setPasswordVisible] = React.useState(false);

  return (
    <View style={styles.interfaceDeLoginImage}>
      <ImageBackground source={BackgroundLogin} style={styles.backgroundIcon} resizeMode="cover" imageStyle={{ opacity: 0.35 }}>
        <SafeAreaView style={styles.view}>
          <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsHorizontalScrollIndicator={false}>
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
            <Pressable style={styles.forgotPasswordButton} onPress={() => {router.push("/redefinirSenha");}}>
              <Text style={styles.esqueceuASenha}>Esqueceu a senha?</Text>
            </Pressable>
            <Pressable style={styles.buttonLogin} onPress={() => {router.push("/home");}}>
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
    flex: 1,
    ...Platform.select({
    web: {
      justifyContent: 'center'
    }
  })
  },
  backgroundIcon: {
    width: "100%", 
    height: "100%",
    position: 'absolute',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
    ...Platform.select({
      web: {
        maxWidth: 500,
        width: '100%', 
        marginHorizontal: 'auto',
        paddingBottom: 50,
      }
    })
  },
  logo1Icon: {
    width: 200,
    height: 150,
    ...Platform.select({
      web: { // Logo menor no web
        width: 150,
        height: 112,
      }
    })
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
    ...Platform.select({ web: { marginBottom: 25 } })
  },
  plula: {
    fontSize: 45,
    fontWeight: "500",
    color: "#000",
    marginTop: 10,
    ...Platform.select({
      web: { // Fonte bem menor no web
        fontSize: 32,
        marginTop: 5,
      }
    })
  },
  input: {
    width: "90%",
    height: 60,
    borderBottomWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.9)",
    fontSize: 26,
    marginBottom: 25,
    paddingHorizontal: 10,
    ...Platform.select({
      web: { // Input com altura e fonte padrão web
        height: 44,
        fontSize: 16,
        marginBottom: 15,
      }
    })
  },
  passwordContainer: {
    flexDirection: 'row',       
    alignItems: 'center',     
    width: '90%',
    height: 60,
    borderBottomWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.9)",
    marginBottom: 25,
    ...Platform.select({
      web: { // O container deve ter a mesma altura do input
        height: 44,
        marginBottom: 15,
      }
    })
  },
  inputField: {
    flex: 1,               
    height: '100%',
    fontSize: 26,
    paddingHorizontal: 10,
    ...Platform.select({
      web: { // Fonte do input
        fontSize: 16,
      }
    })
  },
  eyeIcon: {
    padding: 10, 
    ...Platform.select({
      web: {
        padding: 8, // Área de clique um pouco menor
      }
    })
  },
  forgotPasswordButton: {
    marginBottom: 40,
    ...Platform.select({ web: { marginBottom: 30 } })
  },
  esqueceuASenha: {
    fontSize: 22,
    color: "rgba(0, 0, 0, 0.9)",
    fontWeight: "500",
    ...Platform.select({
      web: { // Fonte padrão web
        fontSize: 14,
      }
    })
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
    ...Platform.select({
      web: { // Botão com altura padrão web
        height: 48,
        marginBottom: 20,
      }
    })
  },
  entrar: {
    fontSize: 30,
    color: "rgba(0, 0, 0, 0.9)",
    fontWeight: "500",
    ...Platform.select({
      web: { // Fonte do botão
        fontSize: 18,
      }
    })
  },
  registerButton: {
    marginBottom: 50,
  },
  cadastreSe: {
    fontSize: 22,
    color: "rgba(0, 0, 0, 0.9)",
    fontWeight: "500",
    ...Platform.select({
      web: { // Fonte padrão web
        fontSize: 14,
      }
    })
  },
  v100: {
    fontSize: 20,
    color: "#000",
    fontWeight: "500",
    position: "absolute",
    bottom: 15,
    ...Platform.select({
      web: { // Fonte menor
        fontSize: 12,
      }
    })
  },
});

export default InterfaceDeLoginImage;
