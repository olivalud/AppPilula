import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Para o botão de logout
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

  const capitalizarPrimeiraLetra = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const dataObj = new Date();
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  };

  const dataFormatada = dataObj.toLocaleDateString('pt-BR', options);

  const partes = dataFormatada.split(', ');
  const diaSemana = capitalizarPrimeiraLetra(partes[0]);
  
  const partesMes = partes[1].split(' de ');
  const dia = partesMes[0];
  const mes = capitalizarPrimeiraLetra(partesMes[1]);

  const dataAtual = `${diaSemana}, ${dia} de ${mes}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons 
            name="account-circle" 
            size={50}
            color="#5CA498"
          />
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>Usuário</Text>
            <Text style={styles.date}>{dataAtual}</Text>
          </View>
        </View>

        <Pressable onPress={() => router.replace('/')}>
          <MaterialCommunityIcons 
            name="logout" 
            size={35}
            color="#555" 
          />
        </Pressable>
      </View>


    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3E3E3',
  },
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 10,
    paddingBottom: 20, 
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 20,
    color: '#777',
  },
});