import React from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from './components/DateTimePickerWrapper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdicionarMedicamentoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [editingId, setEditingId] = React.useState<string | null>(null);

  // campos do formulário (mantive e adicionei campos do protótipo)
  const [nome, setNome] = React.useState('');
  const [dose, setDose] = React.useState('');
  const [forma, setForma] = React.useState('Comprimido');
  const [icone, setIcone] = React.useState('pill');
  const [frequencia, setFrequencia] = React.useState(1);
  // agora armazenamos horários como array e usamos um date/time picker
  const [horarios, setHorarios] = React.useState<string[]>(['08:00']);
  const [horarioTemp, setHorarioTemp] = React.useState(new Date());
  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const [duracao, setDuracao] = React.useState('7 dias');
  const [observacoes, setObservacoes] = React.useState('');
  const [lembrete, setLembrete] = React.useState(true);
  // datas (inicial e final)
  const [startDate, setStartDate] = React.useState<Date | null>(new Date());
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = React.useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = React.useState(false);
  const [semDataFinal, setSemDataFinal] = React.useState(false);

  const incrementar = () => setFrequencia((q) => Math.min(10, q + 1));
  const decrementar = () => setFrequencia((q) => Math.max(1, q - 1));

  const parseHorarios = (text: string) =>
    text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const removeHorario = (h: string) => setHorarios((prev) => prev.filter((p) => p !== h));
  const missingFields = React.useMemo(() => {
    const missing: string[] = [];
    if (!nome.trim()) missing.push('Nome do Medicamento');
    if (!dose.trim()) missing.push('Dosagem');
    if (!startDate) missing.push('Data inicial');
    // Duração pode ser satisfeita por: semDataFinal (Todos os dias) OR endDate OR duracao textual
    if (!semDataFinal && !endDate && (!duracao || !duracao.toString().trim())) {
      missing.push('Data final / Duração (ou marque Todos os dias)');
    }
    return missing;
  }, [nome, dose, startDate, endDate, semDataFinal, duracao]);

  const isValid = missingFields.length === 0;

  const onSave = () => {
    if (!isValid) {
      Alert.alert('Campos obrigatórios', `Preencha: \n- ${missingFields.join('\n- ')}`);
      return;
    }

    const novo = {
      id: String(Date.now()),
      nome: nome.trim(),
      dose: dose || '',
      forma,
      frequencia,
      horarios,
      // calcular duracao final para exibição: se semDataFinal => 'Todos os dias', senão usar endDate
      duracao: semDataFinal ? 'Todos os dias' : endDate ? endDate.toLocaleDateString() : duracao,
      observacoes,
      // lembrete desativado na UI — aqui mantemos vazio para não enviar aviso
      aviso: '',
      startDate: startDate ? startDate.toISOString() : null,
      endDate: semDataFinal ? null : endDate ? endDate.toISOString() : null,
      semDataFinal,
      status: 'pendente',
      icone: icone,
    } as any;

    // enviar novo medicamento para a Home via query string (garante que Home leia com useLocalSearchParams)
    const q = encodeURIComponent(JSON.stringify(novo));
    // mostrar confirmação antes de navegar
    if (editingId) {
      // ao atualizar, não mostramos alert — apenas navegamos de volta para a Home com o param
      router.push(`/home?updatedMed=${q}`);
    } else {
      Alert.alert('Sucesso', `O Medicamento ${novo.nome} foi adicionado com sucesso!`, [
        { text: 'OK', onPress: () => router.push(`/home?newMed=${q}`) },
      ]);
    }
  };

  // carregar editMed se presente
  React.useEffect(() => {
    if (!params || !params.editMed) return;
    try {
      let parsed: any = null;
      const raw = params.editMed as string;
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        try {
          const dec = decodeURIComponent(raw);
          parsed = JSON.parse(dec);
        } catch (err2) {
          console.warn('Falha ao parsear editMed', err, err2);
        }
      }
      if (parsed) {
        setEditingId(parsed.id ?? null);
        setNome(parsed.nome ?? '');
        setDose(parsed.dose ?? '');
        setForma(parsed.forma ?? 'Comprimido');
        setIcone(parsed.icone ?? 'pill');
        setFrequencia(parsed.frequencia ?? 1);
        setHorarios(Array.isArray(parsed.horarios) ? parsed.horarios : ['08:00']);
        setDuracao(parsed.duracao ?? '7 dias');
        setObservacoes(parsed.observacoes ?? '');
        setStartDate(parsed.startDate ? new Date(parsed.startDate) : new Date());
        setEndDate(parsed.endDate ? new Date(parsed.endDate) : null);
        setSemDataFinal(!!parsed.semDataFinal);
      }
    } catch (e) {
      // ignore
    }
  }, [params?.editMed]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: 12 + (Platform.OS === 'android' ? (StatusBar.currentHeight || 8) : 0) },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name={icone as any} size={22} color="#5CA498" />
            </View>
            <Text style={styles.title}>{editingId ? 'Editar Medicamento' : 'Adicionar Medicamento'}</Text>
          </View>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={22} color="#333" />
          </Pressable>
        </View>

        <Text style={styles.label}>Nome do Medicamento <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Paracetamol" />

        <Text style={styles.label}>Dosagem <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={dose} onChangeText={setDose} placeholder="Ex: 500mg" />

        <Text style={styles.label}>Forma de administração</Text>
        <View style={styles.formaRow}>
          {['Comprimido', 'Gotas', 'Injeção', 'Xarope', 'Cápsula'].map((f) => (
            <Pressable
              key={f}
              onPress={() => setForma(f)}
              style={[styles.formaChip, forma === f && styles.formaChipActive]}
            >
              <Text style={[styles.formaText, forma === f && styles.formaTextActive]}>{f}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Ícone</Text>
        <View style={styles.iconPickerRow}>
          {[
            { key: 'pill', label: 'Comprimido', icon: 'pill' },
            { key: 'needle', label: 'Injeção', icon: 'needle' },
            { key: 'drops', label: 'Gotas', icon: 'water' },
            { key: 'syrup', label: 'Xarope', icon: 'bottle-soda' },
          ].map((it) => (
            <Pressable
              key={it.key}
              onPress={() => setIcone(it.icon)}
              style={[styles.iconChip, icone === it.icon && styles.iconChipActive]}
            >
              <MaterialCommunityIcons name={it.icon as any} size={18} color={icone === it.icon ? '#00695C' : '#555'} />
              <Text style={[styles.iconLabel, icone === it.icon && styles.iconLabelActive]}>{it.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Frequência por dia</Text>
        <View style={styles.rowCenter}>
          <Pressable style={styles.smallBtn} onPress={decrementar}><Text style={styles.smallBtnText}>-</Text></Pressable>
          <View style={styles.countBox}><Text style={styles.countText}>{frequencia}x</Text></View>
          <Pressable style={styles.smallBtn} onPress={incrementar}><Text style={styles.smallBtnText}>+</Text></Pressable>
        </View>

        <Text style={styles.label}>Horários</Text>
        <View style={styles.horariosRow}>
          {horarios.map((h, i) => (
            <Pressable key={`h-${i}`} style={styles.horarioChipSmall} onPress={() => removeHorario(h)}>
              <Text style={styles.horarioTextSmall}>{h}</Text>
              <MaterialCommunityIcons name="close" size={14} color="#00695C" style={{ marginLeft: 6 }} />
            </Pressable>
          ))}
          <Pressable style={styles.addHorarioBtn} onPress={() => setShowTimePicker(true)}>
            <MaterialCommunityIcons name="plus" size={20} color="#5CA498" />
          </Pressable>
        </View>

        {/* Date/time picker modal - quando showTimePicker true */}
        {showTimePicker && (
          <DateTimePicker
            value={horarioTemp}
            mode="time"
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e: any, selected?: Date) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (!selected) return;
              const hh = String(selected.getHours()).padStart(2, '0');
              const mm = String(selected.getMinutes()).padStart(2, '0');
              const timeStr = `${hh}:${mm}`;
              setHorarioTemp(selected);
              setHorarios((prev) => (prev.includes(timeStr) ? prev : [...prev, timeStr]));
            }}
          />
        )}

        <Text style={styles.label}>Data inicial <Text style={styles.required}>*</Text></Text>
        <View style={styles.rowCenter}>
          <Pressable style={styles.datePickerBtn} onPress={() => setShowStartDatePicker(true)}>
            <Text style={styles.dateText}>{startDate ? startDate.toLocaleDateString() : 'Selecionar data'}</Text>
          </Pressable>
        </View>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'calendar' : 'default'}
            onChange={(e: any, selected?: Date) => {
              setShowStartDatePicker(Platform.OS === 'ios');
              if (!selected) return;
              setStartDate(selected);
            }}
          />
        )}

        <Text style={styles.label}>Duração / Data final <Text style={styles.required}>*</Text></Text>
        <View style={[styles.rowCenter, { justifyContent: 'space-between' }]}>
          <Pressable style={[styles.datePickerBtn, { flex: 1, marginRight: 12 }]} onPress={() => !semDataFinal && setShowEndDatePicker(true)}>
            <Text style={styles.dateText}>{semDataFinal ? 'Todos os dias' : endDate ? endDate.toLocaleDateString() : duracao}</Text>
          </Pressable>
          <Pressable style={[styles.smallBtn, semDataFinal && { backgroundColor: '#E0F2F1' }]} onPress={() => setSemDataFinal((s) => !s)}>
            <Text style={styles.smallBtnText}>{semDataFinal ? '✓' : '—'}</Text>
          </Pressable>
        </View>
        {showEndDatePicker && !semDataFinal && (
          <DateTimePicker
            value={endDate ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'calendar' : 'default'}
            onChange={(e: any, selected?: Date) => {
              setShowEndDatePicker(Platform.OS === 'ios');
              if (!selected) return;
              setEndDate(selected);
              setDuracao(`${selected.toLocaleDateString()}`);
            }}
          />
        )}

        <Text style={styles.label}>Observações</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={observacoes}
          onChangeText={setObservacoes}
          placeholder="Informações adicionais"
          multiline
          numberOfLines={4}
        />

        {/* Lembrete
        <View style={styles.lembreteRow}>
          <Pressable onPress={() => setLembrete((v) => !v)} style={styles.lembreteBox}>
            <MaterialCommunityIcons
              name={lembrete ? 'bell-ring' : 'bell-off-outline'}
              size={20}
              color={lembrete ? '#5CA498' : '#999'}
            />
          </Pressable>
          <Text style={styles.lembreteLabel}>Ativar lembrete</Text>
        </View>
        */}

        <View style={styles.actions}>
          <Pressable style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]} onPress={onSave} disabled={!isValid}>
            <Text style={styles.saveText}>{editingId ? 'Atualizar' : 'Salvar'}</Text>
          </Pressable>
          <Pressable style={styles.cancelBtn} onPress={() => router.back()}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F7F6' },
  content: { padding: 20, paddingBottom: 40, paddingTop: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: 'rgba(0,0,0,0.08)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, marginRight: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 20, fontWeight: '700', color: '#333' },
  closeButton: { padding: 6 },
  label: { fontSize: 14, color: '#555', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, height: 44, fontSize: 16, borderWidth: 1, borderColor: '#e6e6e6' },
  textArea: { height: Platform.OS === 'ios' ? 100 : 110, textAlignVertical: 'top', paddingTop: 12 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  smallBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginHorizontal: 8, borderWidth: 1, borderColor: '#e6e6e6' },
  smallBtnText: { fontSize: 18, color: '#333' },
  countBox: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e6e6e6' },
  countText: { fontSize: 16, color: '#333' },
  lembreteRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  lembreteBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e6e6e6' },
  lembreteLabel: { marginLeft: 12, fontSize: 15, color: '#333' },
  actions: { marginTop: 20 },
  saveBtn: { backgroundColor: '#5CA498', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelBtn: { backgroundColor: '#fff', paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  cancelText: { color: '#333', fontSize: 16, fontWeight: '600' },
  horariosRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 8 },
  horarioChipSmall: { backgroundColor: '#E0F2F1', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, marginRight: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  horarioTextSmall: { color: '#00695C', fontWeight: '600' },
  formaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  formaChip: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#e6e6e6' },
  formaChipActive: { backgroundColor: '#E0F2F1', borderColor: '#5CA498' },
  formaText: { color: '#333', fontSize: 14 },
  formaTextActive: { color: '#00695C', fontWeight: '700' },
  addHorarioBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e6e6e6' },
  datePickerBtn: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#e6e6e6' },
  dateText: { color: '#333', fontSize: 16 },
  saveBtnDisabled: { backgroundColor: '#BDBDBD', opacity: 0.8 },
  required: { color: '#D9534F', fontWeight: '700' },
  iconPickerRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  iconChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#e6e6e6' },
  iconChipActive: { backgroundColor: '#E0F2F1', borderColor: '#5CA498' },
  iconLabel: { marginLeft: 8, color: '#333' },
  iconLabelActive: { color: '#00695C', fontWeight: '700' },
});
