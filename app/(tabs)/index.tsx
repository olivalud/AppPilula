import * as React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundLogin from '../../src/assets/background-login.png';
import Logo from '../../src/assets/logo.png';

const InterfaceDeLoginImage = () => {

  return (
    <SafeAreaView style={styles.interfaceDeLoginImage}>
      <View style={styles.view}>
        <Image source={BackgroundLogin} style={styles.backgroundIcon} resizeMode="cover" />
        <Image source={Logo} style={styles.logo1Icon} resizeMode="cover" />
        <View style={[styles.buttonCpf, styles.buttonPosition]}>
          <Text style={[styles.cpf, styles.cpfTypo]}>CPF</Text>
        </View>
        <View style={[styles.buttonPassword, styles.buttonPosition]}>
          <Text style={[styles.cpf, styles.cpfTypo]}>Senha</Text>
        </View>
        <Pressable style={[styles.buttonLogin, styles.buttonSpaceBlock]} onPress={() => { }}>
          <Text style={[styles.entrar, styles.cpfTypo]}>Entrar</Text>
        </Pressable>
        <View style={[styles.buttonPasswords, styles.buttonSpaceBlock]}>
          <Text style={styles.esqueceuASenha}>Esqueceu a senha ?</Text>
        </View>
        <Pressable style={[styles.buttonRegister, styles.buttonSpaceBlock]} onPress={() => { }}>
          <Text style={[styles.cadastreSe, styles.v100Typo]}>Cadastre-se</Text>
        </Pressable>
        <Text style={[styles.v100, styles.v100Typo]}>v1.0.0</Text>
        <View style={[styles.plulaWrapper, styles.buttonSpaceBlock]}>
          <Text style={[styles.plula, styles.cpfTypo]}>Pílula+</Text>
        </View>
        <Text style={[styles.v100, styles.v100Typo]}>v1.0.0</Text>
        <View style={styles.child} />
        <View style={styles.lockPage}>
          <View style={styles.rightSide}>
            <View style={[styles.battery, styles.batteryPosition]}>
              <View style={styles.rectangleIcon} />
              <View style={[styles.combinedShapeIcon, styles.batteryPosition]} />
              <View style={styles.interfaceDeLoginImageRectangleIcon} />
            </View>
            <View style={styles.wifiIcon} />
            <View style={styles.mobileSignalIcon} />
          </View>
          <View style={[styles.leftSide, styles.leftSidePosition]}>
            <Text style={[styles.sim1, styles.cpfTypo]}>SIM 1</Text>
          </View>
          <View style={[styles.lockPageChild, styles.leftSidePosition]} />
        </View>
      </View>
    </SafeAreaView>);
};

const styles = StyleSheet.create({
  interfaceDeLoginImage: {
    flex: 1
  },
  buttonPosition: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    flexDirection: "row",
    width: 309,
    borderBottomWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.9)",
    borderStyle: "solid",
    marginLeft: -154,
    left: "50%",
    position: "absolute"
  },
  cpfTypo: {
    textAlign: "left",
    fontWeight: "500",
    lineHeight: 20
  },
  buttonSpaceBlock: {
    padding: 10,
    flexDirection: "row"
  },
  v100Typo: {
    fontSize: 20,
    letterSpacing: 0.2,
    textAlign: "left",
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    lineHeight: 20
  },
  batteryPosition: {
    right: 0,
    position: "absolute"
  },
  leftSidePosition: {
    top: 6,
    position: "absolute"
  },
  view: {
    width: "100%",
    height: 956,
    overflow: "hidden",
    flex: 1
  },
  backgroundIcon: {
    top: 60,
    left: -90,
    width: 619,
    height: 959,
    position: "absolute"
  },
  logo1Icon: {
    top: 100,
    left: 121,
    width: 200,
    height: 200,
    position: "absolute"
  },
  buttonCpf: {
    top: 408
  },
  cpf: {
    fontSize: 26,
    color: "rgba(0, 0, 0, 0.9)",
    letterSpacing: 0.3,
    textAlign: "left",
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    lineHeight: 20
  },
  buttonPassword: {
    top: 500
  },
  buttonLogin: {
    top: 636,
    left: 45,
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    elevation: 4,
    borderRadius: 32,
    backgroundColor: "#fff",
    width: 350,
    height: 70,
    justifyContent: "center",
    padding: 10,
    alignItems: "center",
    position: "absolute"
  },
  entrar: {
    fontSize: 30,
    color: "rgba(0, 0, 0, 0.9)",
    letterSpacing: 0.3,
    textAlign: "left",
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    lineHeight: 20
  },
  buttonPasswords: {
    marginLeft: -93,
    top: 578,
    justifyContent: "center",
    padding: 10,
    alignItems: "center",
    position: "absolute",
    left: "50%"
  },
  esqueceuASenha: {
    fontSize: 18,
    letterSpacing: 0.2,
    textAlign: "left",
    color: "rgba(0, 0, 0, 0.9)",
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    lineHeight: 20
  },
  buttonRegister: {
    marginLeft: -70,
    top: 719,
    justifyContent: "center",
    padding: 10,
    alignItems: "center",
    position: "absolute",
    left: "50%"
  },
  cadastreSe: {
    color: "#1e1e1e"
  },
  v100: {
    marginLeft: -28,
    top: 911,
    color: "#000",
    left: "50%",
    position: "absolute"
  },
  plulaWrapper: {
    marginLeft: -69,
    top: 301,
    justifyContent: "center",
    padding: 0,
    alignItems: "center",
    position: "absolute",
    left: "50%",
    backgroundColor: 'transparent'
  },
  plula: {
    fontSize: 30,
    letterSpacing: 0,
    color: "#000",
    fontFamily: "Inter-Medium",
    textAlign: "left",
    fontWeight: "500",
    lineHeight: 20
  },
  child: {
    marginLeft: -220,
    borderTopLeftRadius: 51,
    borderTopRightRadius: 51,
    backgroundColor: "#c7d3d8",
    width: 440,
    height: 64,
    top: 0,
    left: "50%",
    position: "absolute"
  },
  lockPage: {
    marginLeft: -187,
    top: 8,
    width: 375,
    height: 44,
    left: "50%",
    position: "absolute",
    overflow: "hidden"
  },
  rightSide: {
    top: 17,
    right: 15,
    width: 67,
    height: 11,
    position: "absolute"
  },
  battery: {
    width: 24,
    height: 11,
    top: 0
  },
  rectangleIcon: {
    right: 2,
    borderRadius: 3,
    width: 22,
    opacity: 0.35,
    height: 11,
    top: 0,
    position: "absolute"
  },
  combinedShapeIcon: {
    top: 4,
    width: 1,
    height: 4,
    color: "#000"
  },
  interfaceDeLoginImageRectangleIcon: {
    top: 2,
    right: 4,
    borderRadius: 1,
    width: 18,
    height: 7,
    color: "#000",
    position: "absolute"
  },
  wifiIcon: {
    width: 15,
    height: 11
  },
  mobileSignalIcon: {
    width: 17,
    height: 11
  },
  leftSide: {
    left: 25,
    justifyContent: "flex-end",
    padding: 10,
    flexDirection: "row"
  },
  sim1: {
    fontSize: 14,
    letterSpacing: 0.1,
    fontFamily: "Roboto-Medium",
    color: "#000",
    textAlign: "left",
    fontWeight: "500",
    lineHeight: 20
  },
  lockPageChild: {
    marginLeft: -62.5,
    borderRadius: 21,
    backgroundColor: "#000",
    width: 125,
    height: 36,
    left: "50%"
  }
});

export default InterfaceDeLoginImage;
