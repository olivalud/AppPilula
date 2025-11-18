import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { mockMedicamentos, mockResumo } from '../src/data/mockData';
import ButtonAddMedicamento from './components/ButtonAddMedicamento';

export default function HomeScreen() {
  const router = useRouter();

  const [medicamentos, setMedicamentos] = useState(mockMedicamentos);
  const [resumo, setResumo] = useState(mockResumo);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'concluido' | 'atrasado'>('all');

  const [history, setHistory] = useState<any[]>([]);
  const [unreadHistoryCount, setUnreadHistoryCount] = useState(0);

  const params = useLocalSearchParams();


  const processedIdsRef = React.useRef<Set<string>>(new Set());


  const lastDeletedRef = useRef<any | null>(null);
  const snackbarTimerRef = useRef<any | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');


  useEffect(() => {
    if (!params) return;
    try {
      // Novo Medicamento
      if (params.newMed) {
        console.log('[Home] received params.newMed:', params.newMed);
        let parsed: any = null;
        const raw = params.newMed as string;
        try {
          parsed = JSON.parse(raw);
        } catch (err) {
          try {
            const decoded = decodeURIComponent(raw);
            parsed = JSON.parse(decoded);
          } catch (err2) {
            console.warn('[Home] failed to parse newMed:', raw, err, err2);
          }
        }
        if (parsed && parsed.id && !processedIdsRef.current.has(parsed.id)) {
          const novo = parsed;
          // Persistir (evita race com storage)
          (async () => {
            try {
              // Ler storage atual
              const storedJson = await AsyncStorage.getItem('medicamentos');
              const currentList = storedJson ? JSON.parse(storedJson) : medicamentos;
              // Evitar duplicado
              if (currentList.find((p: any) => p.id === novo.id)) {
                processedIdsRef.current.add(parsed.id);
                try { router.replace('/home'); } catch (e) { }
                return;
              }
              const next = [novo, ...currentList];
              const administrados = next.filter((x) => x.status === 'concluido').length;
              const atrasados = next.filter((x) => !!x.aviso && x.status !== 'concluido').length;
              await AsyncStorage.setItem('medicamentos', JSON.stringify(next));
              await AsyncStorage.setItem('resumo', JSON.stringify({ ...mockResumo, administrados, atrasados, total: next.length }));
              // Atualizar estado em memória
              setMedicamentos(next);
              setResumo((r) => ({ ...r, administrados, atrasados, total: next.length } as any));
            } catch (e) {
              console.warn('[Home] erro ao persistir novo medicamento', e);
              // Fallback: aplicar em memória (update funcional)
              setMedicamentos((prev) => {
                if (prev.find((p) => p.id === novo.id)) return prev;
                const next = [novo, ...prev];
                const administrados = next.filter((x) => x.status === 'concluido').length;
                const atrasados = next.filter((x) => !!x.aviso && x.status !== 'concluido').length;
                setResumo((r) => ({ ...r, administrados, atrasados, total: next.length } as any));
                return next;
              });
            } finally {
              processedIdsRef.current.add(parsed.id);
              try { router.replace('/home'); } catch (e) { }
            }
          })();
        }
      }

      // Editar Medicamento
      if (params.updatedMed) {
        console.log('[Home] received params.updatedMed:', params.updatedMed);
        let parsed: any = null;
        const raw = params.updatedMed as string;
        try {
          parsed = JSON.parse(raw);
        } catch (err) {
          try {
            const decoded = decodeURIComponent(raw);
            parsed = JSON.parse(decoded);
          } catch (err2) {
            console.warn('[Home] failed to parse updatedMed:', raw, err, err2);
          }
        }
        if (parsed && parsed.id && !processedIdsRef.current.has(parsed.id)) {
          const updated = parsed;
          (async () => {
            try {
              // Ler storage atual
              const storedJson = await AsyncStorage.getItem('medicamentos');
              const currentList = storedJson ? JSON.parse(storedJson) : medicamentos;
              console.log('[Home] applying updatedMed id=', updated.id, 'medicamentosCount=', currentList.length, 'hasId=', currentList.some((m: any) => m.id === updated.id));
              let next = currentList.map((m: any) => (m.id === updated.id ? { ...m, ...updated } : m));
              // Se id não existir, inserir no topo
              if (!next.some((m: any) => m.id === updated.id)) {
                next = [updated, ...currentList];
                console.log('[Home] updatedMed id not found in existing list — inserting at top');
              }
              const administrados = next.filter((x: any) => x.status === 'concluido').length;
              const atrasados = next.filter((x: any) => !!x.aviso && x.status !== 'concluido').length;
              await AsyncStorage.setItem('medicamentos', JSON.stringify(next));
              await AsyncStorage.setItem('resumo', JSON.stringify({ ...mockResumo, administrados, atrasados, total: next.length }));
              setMedicamentos(next);
              setResumo((r) => ({ ...r, administrados, atrasados, total: next.length } as any));
            } catch (e) {
              console.warn('[Home] erro ao persistir medicamento atualizado', e);
              // Fallback: aplicar em memória
              setMedicamentos((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
            } finally {
              processedIdsRef.current.add(parsed.id);
              try { router.replace('/home'); } catch (e) { }
            }
          })();
        }
      }
    } catch (e) {
      console.error('[Home] error processing params newMed/updatedMed', e);
    }
  }, [params?.newMed, params?.updatedMed]);

  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const displayedMedicamentos = useMemo(() => {
    const q = query.trim();
    const qNorm = normalize(q);

    // Filtro Status
    let list = medicamentos.filter((m) => {
      if (statusFilter === 'concluido') return m.status === 'concluido';
      // 'atrasado' apenas c/ aviso e não concluído
      if (statusFilter === 'atrasado') return !!m.aviso && m.status !== 'concluido';
      return true;
    });

    // Filtro - Normalizador
    if (qNorm) {
      list = list.filter((m) => {
        const nome = (m.nome ?? '').toString();
        return normalize(nome).includes(qNorm);
      });
    }

    // Ordenar prioridade
    const priority = (m: any) => {
      if (m.status === 'concluido') return 2;
      if (m.aviso) return 0;
      return 1;
    };

    list = [...list].sort((a, b) => priority(a) - priority(b));
    return list;
  }, [medicamentos, query, statusFilter]);

  const toggleMedicamentoStatus = (id: string) => {
    const medBefore = medicamentos.find((m) => m.id === id) ?? null;
    const willConclude = medBefore && medBefore.status !== 'concluido';

    setMedicamentos((prev) => {
      const next = prev.map((m) => {
        if (m.id === id) {
          const newStatus = m.status === 'concluido' ? 'pendente' : 'concluido';
          // limpar aviso ao concluir
          return { ...m, status: newStatus, aviso: newStatus === 'concluido' ? '' : m.aviso };
        }
        return m;
      });

      // recalcular resumo
      const administrados = next.filter((x) => x.status === 'concluido').length;
      const atrasados = next.filter((x) => !!x.aviso && x.status !== 'concluido').length;
      setResumo({ ...resumo, administrados, atrasados, total: next.length } as any);

      return next;
    });

    // adicionar ao histórico ao concluir
    if (willConclude && medBefore) {
      addHistoryEntry(medBefore);
    }
  };

  const deleteMedicamento = (id: string) => {
    setMedicamentos((prev) => {
      const next = prev.filter((m) => m.id !== id);
      const administrados = next.filter((x) => x.status === 'concluido').length;
      const atrasados = next.filter((x) => !!x.aviso && x.status !== 'concluido').length;
      setResumo((r) => ({ ...r, administrados, atrasados, total: next.length } as any));
      return next;
    });
  };

  // Excluir otimista + Desfazer
  const performDeleteWithUndo = (id: string) => {
    const med = medicamentos.find((m) => m.id === id) ?? null;
    if (!med) return;
    // store for possible undo
    lastDeletedRef.current = med;
    // remove immediately
    deleteMedicamento(id);
    // show snackbar
    setSnackbarText(`${med.nome ?? 'Medicamento'} excluído`);
    setSnackbarVisible(true);
    // start timer to finalize (clear backup)
    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    snackbarTimerRef.current = setTimeout(() => {
      lastDeletedRef.current = null;
      setSnackbarVisible(false);
      snackbarTimerRef.current = null;
    }, 5000);
  };

  const handleUndo = () => {
    if (!lastDeletedRef.current) return;
    // cancel timer
    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    const med = lastDeletedRef.current;
    // restore at top
    setMedicamentos((prev) => {
      const next = [med, ...prev];
      const administrados = next.filter((x) => x.status === 'concluido').length;
      const atrasados = next.filter((x) => !!x.aviso && x.status !== 'concluido').length;
      setResumo((r) => ({ ...r, administrados, atrasados, total: next.length } as any));
      return next;
    });
    lastDeletedRef.current = null;
    setSnackbarVisible(false);
  };

  // Ler storage ao montar
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const medsJson = await AsyncStorage.getItem('medicamentos');
        const resumoJson = await AsyncStorage.getItem('resumo');
        const historyJson = await AsyncStorage.getItem('history');
        const unread = await AsyncStorage.getItem('historyUnread');
        if (!mounted) return;
        if (medsJson) {
          try { setMedicamentos(JSON.parse(medsJson)); } catch (e) { /* ignore */ }
        }
        if (resumoJson) {
          try { setResumo(JSON.parse(resumoJson)); } catch (e) { /* ignore */ }
        }
        if (historyJson) {
          try { setHistory(JSON.parse(historyJson)); } catch (e) { /* ignore */ }
        }
        if (unread) {
          try { setUnreadHistoryCount(Number(unread) || 0); } catch (e) { /* ignore */ }
        }
      } catch (e) {
        console.warn('Falha ao carregar storage', e);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Salvar ao mudar meds/resumo
  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem('medicamentos', JSON.stringify(medicamentos));
        await AsyncStorage.setItem('resumo', JSON.stringify(resumo));
        await AsyncStorage.setItem('history', JSON.stringify(history));
      } catch (e) {
        console.warn('Falha ao salvar storage', e);
      }
    };
    save();
  }, [medicamentos, resumo]);

  // Salvar histórico ao mudar
  useEffect(() => {
    const saveHistory = async () => {
      try { await AsyncStorage.setItem('history', JSON.stringify(history)); } catch (e) { /* ignore */ }
    };
    saveHistory();
  }, [history]);

  // Recalcular avisos (hora) — preservar avisos manuais
  useEffect(() => {
    let mounted = true;
    const computeAvisos = async () => {
      try {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        let changed = false;
        const next = medicamentos.map((m) => {
          const existing = m.aviso ?? '';
          let novoAviso = existing;
          if (m.status === 'concluido') {
            // concluídos não devem mostrar aviso
            novoAviso = '';
          } else {
            // se já existe um aviso textual (ex: 'Acabando!'), preservamos
            if (!existing || !String(existing).trim()) {
              const horarios = Array.isArray(m.horarios) ? m.horarios : [];
              const minutes = horarios
                .map((h: string) => {
                  const parts = h.split(':').map((p) => Number(p));
                  if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return NaN;
                  return parts[0] * 60 + parts[1];
                })
                .filter((x: any) => !Number.isNaN(x))
                .sort((a: number, b: number) => a - b);
              if (minutes.length > 0) {
                const past = minutes.filter((t: number) => t <= currentMinutes).length;
                const future = minutes.length - past;
                if (past > 0) novoAviso = 'Atrasado';
                else if (future === 1) novoAviso = 'Uma dose restante';
                else novoAviso = '';
              } else {
                novoAviso = '';
              }
            } else {
              novoAviso = String(existing);
            }
          }
          if (String(novoAviso || '') !== String(existing || '')) changed = true;
          return { ...m, aviso: novoAviso };
        });

        if (!mounted) return;
        if (changed) {
          setMedicamentos(next);
          const administrados = next.filter((x) => x.status === 'concluido').length;
          const atrasados = next.filter((x) => !!x.aviso && x.status !== 'concluido').length;
          setResumo((r) => ({ ...r, administrados, atrasados, total: next.length } as any));
          try {
            await AsyncStorage.setItem('medicamentos', JSON.stringify(next));
            await AsyncStorage.setItem('resumo', JSON.stringify({ ...mockResumo, administrados, atrasados, total: next.length }));
          } catch (e) {
            console.warn('[Home] falha ao salvar avisos', e);
          }
        }
      } catch (e) {
        console.warn('[Home] erro ao computar avisos', e);
      }
    };

    // compute immediately, and every minute to reflect time changes
    computeAvisos();
    const id = setInterval(computeAvisos, 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [medicamentos, history]);

  const addHistoryEntry = (med: any) => {
    const entry = { id: String(Date.now()), medId: med.id, nome: med.nome, timestamp: new Date().toISOString() };
    setHistory((prev) => [entry, ...prev]);
    // increment unread badge
    setUnreadHistoryCount((n) => {
      const next = n + 1;
      try { AsyncStorage.setItem('historyUnread', String(next)); } catch (e) { /* ignore */ }
      return next;
    });
  };
  // contextual menu state (positioned near the three-dot button)
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [menuX, setMenuX] = React.useState(0);
  const [menuY, setMenuY] = React.useState(0);
  const [menuMed, setMenuMed] = React.useState<any | null>(null);

  const openMenu = (med: any, x: number, y: number) => {
    setMenuMed(med);
    setMenuX(x);
    setMenuY(y);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setMenuMed(null);
  };

  const handleEditFromMenu = (med: any) => {
    try {
      console.log('[Home] Edit requested for med id:', med?.id);
      const q = encodeURIComponent(JSON.stringify(med));
      router.push(`/adicionarMedicamento?editMed=${q}` as any);
    } catch (e) {
      console.warn('Falha ao serializar med para edição', e);
    }
    closeMenu();
  };

  const handleDeleteFromMenu = (med: any) => {
    confirmDelete(med);
  };

  const confirmDelete = (med: any) => {
    Alert.alert('Confirmar exclusão', `Deseja excluir "${med.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => { performDeleteWithUndo(med.id); closeMenu(); } },
    ]);
  };

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
    <SafeAreaView style={styles.container} edges={['top']}>

      <View style={styles.headerContainer}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ marginRight: 12 }}>
              <Pressable onPress={async () => { try { await AsyncStorage.setItem('historyUnread', '0'); } catch (e) { } setUnreadHistoryCount(0); router.push('/historico' as any); }}>
                <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" accessibilityRole="image" accessibilityLabel="Sino de notificações">
                  <Path d="M10.268 21a2 2 0 0 0 3.464 0" stroke="#696868ff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" stroke="#696868ff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Pressable>
              {unreadHistoryCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{unreadHistoryCount}</Text>
                </View>
              )}
            </View>
            <Pressable onPress={() => router.replace('/')}>
              <MaterialCommunityIcons
                name="logout"
                size={35}
                color="#696868ff"
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <Pressable
            style={[styles.summaryCard, styles.summaryMedicamentos, statusFilter === 'all' && styles.summaryCardActive]}
            onPress={() => setStatusFilter('all')}
          >
            <Text style={styles.summaryNumber}>{medicamentos.length}</Text>
            <Text style={styles.summaryLabel}>Medicamentos</Text>
          </Pressable>
          <Pressable
            style={[styles.summaryCard, styles.summaryAdministrados, statusFilter === 'concluido' && styles.summaryCardActive]}
            onPress={() => setStatusFilter('concluido')}
          >
            <Text style={styles.summaryNumber}>{resumo.administrados}</Text>
            <Text style={styles.summaryLabel}>Administrados</Text>
          </Pressable>
          <Pressable
            style={[styles.summaryCard, styles.summaryAtrasados, statusFilter === 'atrasado' && styles.summaryCardActive]}
            onPress={() => setStatusFilter('atrasado')}
          >
            <Text style={styles.summaryNumber}>{resumo.atrasados}</Text>
            <Text style={styles.summaryLabel}>Atrasados</Text>
          </Pressable>
        </View>

        <View style={styles.searchBarContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color="#777" style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar Medicamento"
            style={styles.searchInput}
            placeholderTextColor="#777"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>


      <View style={styles.mainContent}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Lista dinâmica de medicamentos */}
          {displayedMedicamentos.map((med: any) => (
            <View key={med.id} style={styles.medCard}>

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
                    <Text style={styles.medName}>{med.nome ?? ''}</Text>
                    <Text style={styles.medDose}>{med.dose ?? ''}</Text>
                  </View>
                </View>
                <Pressable
                  onPressIn={(e) => {
                    const { pageX, pageY } = e.nativeEvent;
                    openMenu(med, pageX, pageY);
                  }}
                  style={{ padding: 6 }}
                >
                  <MaterialCommunityIcons name="dots-vertical" size={24} color="#555" />
                </Pressable>
              </View>

              <View style={styles.divider} />
              <View style={styles.horariosSection}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#555" />
                <Text style={styles.horariosTitle}>Horários</Text>
              </View>
              <View style={styles.horariosContainer}>
                {med.horarios.map((horario: any, index: number) => (
                  <View style={styles.horarioChip} key={`${med.id}-horario-${index}`}>
                    <Text style={styles.horarioText}>{horario}</Text>
                  </View>
                ))}
              </View>


              {med.aviso && (
                <View style={styles.doseWarningContainer}>
                  <MaterialCommunityIcons name="clock-alert-outline" size={20} color="#D9534F" />
                  <Text style={styles.doseWarningText}>{med.aviso}</Text>
                </View>
              )}


              <Pressable
                style={[
                  styles.statusButton,
                  med.status === 'concluido' ? styles.statusConcluido : styles.statusPendente,
                ]}
                onPress={() => toggleMedicamentoStatus(med.id)}
              >
                <MaterialCommunityIcons
                  name={med.status === 'concluido' ? "check-circle-outline" : "chevron-right-circle-outline"}
                  size={22}
                  color="#FFF"
                />
                <Text style={styles.statusButtonText}>
                  {med.status === 'concluido' ? 'Concluído' : 'Marcar como Concluído'}
                </Text>
              </Pressable>

            </View>
          ))}
        </ScrollView>
      </View>

      {/* botão adicionar medicamento (fixed) */}
      <View style={styles.addButtonContainer} pointerEvents="box-none">
        <ButtonAddMedicamento onPress={() => { router.push('/adicionarMedicamento'); }} />
      </View>

      {/* contextual menu (edit / delete) */}
      {menuVisible && menuMed && (
        <View style={styles.menuOverlay} pointerEvents="box-none">
          {/* backdrop: captures taps outside menu to close */}
          <Pressable style={styles.menuBackdrop} onPress={closeMenu} />
          <View style={[styles.menuBox, { top: menuY - 60, left: Math.max(8, menuX - 120) }]}>
            <Pressable style={styles.menuItem} onPress={() => { handleEditFromMenu(menuMed); }}>
              <MaterialCommunityIcons name="pencil" size={18} color="#2E7D32" />
              <Text style={styles.menuText}>Editar</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => { confirmDelete(menuMed); }}>
              <MaterialCommunityIcons name="delete-outline" size={18} color="#D32F2F" />
              <Text style={[styles.menuText, { color: '#D32F2F' }]}>Excluir</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Snackbar de ação (Desfazer) */}
      {snackbarVisible && (
        <Pressable style={styles.snackbarContainer} onPress={() => { /* noop: keep */ }}>
          <Text style={styles.snackbarText}>{snackbarText}</Text>
          <Pressable onPress={handleUndo} style={styles.snackbarAction}>
            <Text style={styles.snackbarActionText}>Desfazer</Text>
          </Pressable>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7F6',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
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
    color: '#333',
  },
  date: {
    fontSize: 20,
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
    // Shadow: slightly larger radius and opacity for rounded appearance
    elevation: 4,
    shadowColor: 'rgba(0,0,0,0.22)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
  },
  summaryMedicamentos: { backgroundColor: '#5CA498' },
  summaryAdministrados: { backgroundColor: '#4CAF50' },
  summaryAtrasados: { backgroundColor: '#E57373' },
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
  summaryCardActive: {
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.18)',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
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
  mainContent: {
    flex: 1,
    backgroundColor: '#E3E3E3',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 15,
    paddingTop: 20,
  },


  medCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 4,
    shadowColor: 'rgba(0,0,0,0.16)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
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

  doseWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderColor: '#FFD54F',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 15,
  },
  doseWarningText: {
    color: '#D9534F',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 10,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 15,
  },
  statusConcluido: {
    backgroundColor: '#5CA498',
  },
  statusPendente: {
    backgroundColor: '#4285F4',
  },
  statusButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  addButtonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    zIndex: 30,
  },
  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  menuBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  menuBox: { position: 'absolute', width: 200, backgroundColor: '#fff', borderRadius: 8, paddingVertical: 6, elevation: 6, shadowColor: 'rgba(0,0,0,0.18)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  menuText: { marginLeft: 10, fontSize: 16, color: '#222' },
  snackbarContainer: { position: 'absolute', left: 16, right: 16, bottom: 22, backgroundColor: '#323232', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 6 },
  snackbarText: { color: '#fff', flex: 1, marginRight: 12 },
  snackbarAction: { paddingHorizontal: 10, paddingVertical: 6 },
  snackbarActionText: { color: '#FFD54F', fontWeight: '700' },
  badgeContainer: { position: 'absolute', top: -6, right: -6, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: '#D9534F', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, elevation: 6 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});