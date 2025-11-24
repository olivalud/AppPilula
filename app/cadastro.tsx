import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as React from "react";
import api from "../services/api"
import axios from "axios";

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

const InterfaceDeCadastro = () => {
    const router = useRouter();

    const [password, setPassword] = React.useState("");
    const [isPasswordVisible, setPasswordVisible] = React.useState(false);

    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [isConfirmPasswordVisible, setConfirmPasswordVisible] =
        React.useState(false);
    const [nome, setNome] = React.useState("");
    const [cpf, setCpf] = React.useState("");
    const [email, setEmail] = React.useState("");

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            alert("As senhas não coincidem");
            return;
        }

        try {
            const response = await api.post("/auth/register", {
                nome,
                cpf,
                email,
                senha: password,
            });

            alert("Usuário cadastrado com sucesso");
            router.replace("/");
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.log("erro no registro:", error.response?.data || error.message);
                alert(error.response?.data?.message || `Erro ao cadastrar ${error}`);
            } else if (error instanceof Error) {
                console.log("erro no registro:", error.message);
                alert(error.message);
            } else {
                console.log("erro no registro:", error);
                alert("Erro ao cadastrar");
            }
        }
    };

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
                <Text style={styles.crieSuaConta}>Crie sua conta</Text>

                <TextInput style={styles.input}
                    placeholder="Nome Completo"
                    value={nome}
                    onChangeText={setNome} />
                <MaskedTextInput
                    style={styles.input}
                    placeholder="CPF"
                    keyboardType="numeric"
                    mask="999.999.999-99"
                    value={cpf}
                    onChangeText={(text, rawText) => {
                        setCpf(rawText);
                    }}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    value={email}
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    onChangeText={setEmail}
                />
                <View style={styles.passwordContainer}>
                    <TextInput style={styles.inputField} placeholder="Senha" value={password} onChangeText={setPassword}
                        secureTextEntry={!isPasswordVisible} />
                    <Pressable onPress={() => setPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                        <MaterialCommunityIcons name={isPasswordVisible ? 'eye' : 'eye-off'} size={30} color="rgba(0, 0, 0, 0.7)" />
                    </Pressable>
                </View>

                <View style={styles.passwordContainer}>
                    <TextInput style={styles.inputField} placeholder="Confirmar Senha" value={confirmPassword} onChangeText={setConfirmPassword}
                        secureTextEntry={!isConfirmPasswordVisible} />
                    <Pressable onPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.eyeIcon}>
                        <MaterialCommunityIcons name={isConfirmPasswordVisible ? 'eye' : 'eye-off'} size={30} color="rgba(0, 0, 0, 0.7)" />
                    </Pressable>
                </View>

                <Pressable style={styles.buttonCreate} onPress={handleRegister}>
                    <Text style={styles.criarContaText}>Criar Conta</Text>
                </Pressable>

                <Pressable style={styles.buttonReturn} onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace("/"); } }}>
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
    buttonCreate: {
        elevation: 4,
        borderRadius: 32,
        backgroundColor: "#fff",
        width: "80%",
        height: 70,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    criarContaText: {
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
        bottom: 10,
    },
});

export default InterfaceDeCadastro;
