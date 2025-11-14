import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoricoScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [medicamentos, setMedicamentos] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const h = await AsyncStorage.getItem('history');
        const m = await AsyncStorage.getItem('medicamentos');
        if (!mounted) return;
        if (h) setHistory(JSON.parse(h));
        if (m) setMedicamentos(JSON.parse(m));
      } catch (e) {
        // ignore
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const overdue = medicamentos.filter((x) => !!x.aviso && x.status !== 'concluido');

  useEffect(() => {
    // mark history as read when opening historico
    const markRead = async () => {
      try { await AsyncStorage.setItem('historyUnread', '0'); } catch (e) { /* ignore */ }
    };
    markRead();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#333" />
          </Pressable>
          <Text style={styles.title}>Histórico</Text>
        </View>
      </View>

      <ScrollView style={{ padding: 16 }}>
        <Text style={styles.sectionTitle}>Administrados</Text>
        {history.length === 0 && <Text style={styles.empty}>Nenhum registro encontrado.</Text>}
        {history.map((h) => (
          <View key={h.id} style={[styles.item, styles.administradoItem]}>
            <View style={styles.dotGreen} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{h.nome}</Text>
              <Text style={styles.itemSub}>{new Date(h.timestamp).toLocaleString()}</Text>
            </View>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Atrasados</Text>
        {overdue.length === 0 && <Text style={styles.empty}>Nenhum medicamento atrasado.</Text>}
        {overdue.map((m) => (
          <View key={m.id} style={[styles.item, styles.atrasadoItem]}>
            <View style={styles.dotRed} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{m.nome}</Text>
              <Text style={styles.itemSub}>{m.aviso}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F7F6' },
  header: { padding: 16, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', color: '#333' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 8 },
  item: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, elevation: 2 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  itemSub: { color: '#666', marginTop: 4 },
  empty: { color: '#777', marginBottom: 8 }
  ,
  administradoItem: { flexDirection: 'row', alignItems: 'center' },
  atrasadoItem: { flexDirection: 'row', alignItems: 'center', borderColor: '#fdecea' },
  dotGreen: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#5CA498', marginRight: 10 },
  dotRed: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D9534F', marginRight: 10 },
});
