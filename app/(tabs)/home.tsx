import React, { useState } from 'react'; 
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable,
  ScrollView,
  TextInput // 1. Importado novamente para a busca
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockMedicamentos, mockResumo } from './mockData'; 
// REMOVEMOS a importação do LinearGradient

export default function HomeScreen() {
  const router = useRouter();

  const [medicamentos, setMedicamentos] = useState(mockMedicamentos);
  const [resumo, setResumo] = useState(mockResumo);

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
    // 2. Fundo do container volta a ser o claro
    <SafeAreaView style={styles.container} edges={['top']}>
      
      {/* ===== ÁREA DO CABEÇALHO (FUNDO CLARO) ===== */}
      {/* 3. Voltamos a usar uma <View> normal */}
      <View style={styles.headerContainer}>
        {/* Parte 1: Info do Usuário e Logout */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons 
              name="account-circle" 
              size={50}
              // 4. Cores dos ícones e textos voltam ao original
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

        {/* Parte 2: Cards de Resumo (com cores sólidas) */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.summaryMedicamentos]}>
            <Text style={styles.summaryNumber}>{medicamentos.length}</Text>
            <Text style={styles.summaryLabel}>Medicamentos</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryAdministrados]}>
            <Text style={styles.summaryNumber}>{resumo.administrados}</Text>
            <Text style={styles.summaryLabel}>Administrados</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryAtrasados]}>
            <Text style={styles.summaryNumber}>{resumo.atrasados}</Text>
            <Text style={styles.summaryLabel}>Atrasados</Text>
          </View>
        </View>

        {/* 5. (ADICIONADO DE VOLTA) Barra de Busca */}
        <View style={styles.searchBarContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color="#777" style={styles.searchIcon} />
          <TextInput 
            placeholder="Buscar Medicamento" 
            style={styles.searchInput}
            placeholderTextColor="#777"
          />
        </View>

      </View>
      {/* ===== FIM DA ÁREA DO CABEÇALHO ===== */}


      {/* ===== CONTEÚDO PRINCIPAL (FOLHA CINZA) ===== */}
      <View style={styles.mainContent}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Lista dinâmica de medicamentos */}
          {medicamentos.map((med) => (
            <View key={med.id} style={styles.medCard}>
              {/* ... O conteúdo dos cards continua o mesmo ... */}
              <View style={styles.medCardHeader}>
                <View style={styles.medCardInfo}>
                  <View style={styles.medIconContainer}>
                    <MaterialCommunityIcons 
                      name={med.icone as any} 
                      size={26} 
                      color={med.icone === 'pill' ? '#5CA498' : '#6a5acd'} 
                    />
                  </View>
                  <View>
                    <Text style={styles.medName}>{med.nome}</Text>
                    <Text style={styles.medDose}>{med.dose}</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="dots-vertical" size={24} color="#555" />
              </View>

              <View style={styles.divider} />

              <View style={styles.horariosSection}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#555" />
                <Text style={styles.horariosTitle}>Horários</Text>
              </View>

              <View style={styles.horariosContainer}>
                {med.horarios.map((horario, index) => (
                  <View style={styles.horarioChip} key={`${med.id}-horario-${index}`}>
                    <Text style={styles.horarioText}>{horario}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
  A    </View>
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Cor de fundo clara para o topo
    backgroundColor: '#F0F7F6', 
  },
  headerContainer: {
    paddingHorizontal: 20, 
    paddingTop: 10,
    paddingBottom: 20, 
    // Removemos o 'borderBottomRadius'
  },
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
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
    // Cor do texto escura
    color: '#333',
  },
  date: {
    fontSize: 20,
    // Cor do texto escura
    color: '#777',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  summaryCard: {
    flex: 1, 
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    minHeight: 85,
    justifyContent: 'center',
    // Removemos a borda e fundo transparente
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  // 6. Cores sólidas de fundo (como na sua imagem)
  summaryMedicamentos: { backgroundColor: '#5CA498' }, // Verde-azulado
  summaryAdministrados: { backgroundColor: '#4CAF50' }, // Verde
  summaryAtrasados: { backgroundColor: '#E57373' }, // Vermelho
  summaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
    textAlign: 'center',
  },

  // 7. (ADICIONADO DE VOLTA) Estilos da Busca
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF', // Fundo branco
    borderRadius: 12,
    paddingHorizontal: 15,
    marginTop: 20,
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },

  // 8. Estilo do "sheet" cinza
  mainContent: {
    flex: 1, 
    backgroundColor: '#E3E3E3', // Fundo cinza
    // Adicionamos as bordas arredondadas de volta
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25,
    paddingHorizontal: 15, 
    // Removemos o 'marginTop' negativo
    paddingTop: 20, // Padding normal
  },

  // ... (O restante dos estilos 'medCard' etc. continua igual)
  medCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  medCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  medCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#F0F7F6', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  medName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  medDose: {
    fontSize: 14,
    color: '#777',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 15, 
},
  horariosSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  horariosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  horariosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
  },
  horarioChip: {
    backgroundColor: '#E0F2F1', 
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  horarioText: {
    color: '#00695C', 
    fontWeight: '600',
  },
});