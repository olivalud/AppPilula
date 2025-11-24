import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import ButtonAddMedicamento from './components/ButtonAddMedicamento';
import api from '../services/api'; // ajusta caminho se necessário
import { getUsuarioLogado } from '@/services/user';

// Tipagem baseada no retorno que você mostrou
type BackendMedicamento = {
    id: number;
    cpfUsuario: string;
    nome: string;
    dosagem: string | null;
    administracao?: string;
    frequencia?: string;
    inicio?: string | null;
    termino?: string | null;
    continuo?: boolean;
    observacoes?: string;
    horasPrevistas?: string[];
};

type UIManagableMed = {
    id: string; // o componente usa strings para chaves em alguns lugares
    nome: string;
    dose?: string;
    icone?: string;
    horarios: string[]; // ex: ["08:00:00","16:00:00","00:00:00"]
    status?: 'pendente' | 'concluido';
    aviso?: string; // 'Atrasado' | 'Uma dose restante' | ''
    observacoes?: string;
    raw?: BackendMedicamento; // mantém referência ao objeto original se precisar
};

const mockResumo = { total: 0, administrados: 0, atrasados: 0 };

export default function HomeScreen() {
    const router = useRouter();

    const [medicamentos, setMedicamentos] = useState<UIManagableMed[]>([]);
    const [resumo, setResumo] = useState(mockResumo);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'concluido' | 'atrasado'>('all');

    const [history, setHistory] = useState<any[]>([]);
    const [unreadHistoryCount, setUnreadHistoryCount] = useState(0);

    const params = useLocalSearchParams();

    const processedIdsRef = useRef<Set<string>>(new Set());
    const lastDeletedRef = useRef<any | null>(null);
    const snackbarTimerRef = useRef<any | null>(null);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarText, setSnackbarText] = useState('');
    const [loading, setLoading] = useState(true);

    const mapBackendToUI = (b: BackendMedicamento): UIManagableMed => {
        return {
            id: String(b.id),
            nome: b.nome ?? '',
            dose: b.dosagem ?? '',
            icone: 'pill',
            horarios: Array.isArray(b.horasPrevistas) ? b.horasPrevistas.map((h) => h.slice(0, 5)) : [],
            status: 'pendente',
            aviso: '',
            observacoes: b.observacoes ?? '',
            raw: b,
        };
    };

    const normalizeMed = (m: any): UIManagableMed | null => {
        if (!m) return null;
        try {
            const id = String(m.id ?? m.raw?.id ?? Date.now());
            const nome = m.nome ?? m.raw?.nome ?? '';
            const horarios = Array.isArray(m.horarios) ? m.horarios : (Array.isArray(m.raw?.horarios) ? m.raw.horasPrevistas.map((h: string) => h.slice(0, 5)) : []);
            const status = (m.status ?? 'pendente') as UIManagableMed['status'];
            const iconMap = new Map([
                ['COMPRIMIDO', 'pill'],
                ['INJECAO', 'needle'],
                ['GOTA', 'water'],
                ['XAROPE', 'bottle-soda']
            ]);
            return {
                id,
                nome,
                dose: m.dose ?? m.raw?.dosagem ?? '',
                icone: iconMap.get(m.raw.administracao) ?? iconMap.get('COMPRIMIDO'),
                horarios,
                status,
                aviso: m.aviso ?? '',
                observacoes: m.observacoes ?? m.raw?.observacoes ?? '',
                raw: m.raw ?? (m.raw ? m.raw : undefined),
            };
        } catch (e) {
            console.warn('[normalizeMed] falha normalizando med', e, m);
            return null;
        }
    };

    const loadMedicamentosFromApi = async () => {
        try {
            setLoading(true);
            const resp = await api.get<BackendMedicamento[]>('/medicamentos/usuario');
            const list = (resp.data || []).map(mapBackendToUI);
            const withAvisos = computeAvisosSync(list);
            setMedicamentos(withAvisos);
            const administrados = withAvisos.filter((x) => x.status === 'concluido').length;
            const atrasados = withAvisos.filter((x) => !!x.aviso && x.status !== 'concluido').length;
            const nextResumo = { total: withAvisos.length, administrados, atrasados };
            setResumo(nextResumo);
            try {
                await AsyncStorage.setItem('medicamentos', JSON.stringify(withAvisos));
                await AsyncStorage.setItem('resumo', JSON.stringify(nextResumo));
            } catch (e) {
                console.warn('[Home] falha ao salvar storage após load', e);
            }
        } catch (err) {
            console.warn('[Home] erro ao carregar medicamentos da API', err);
            try {
                const medsJson = await AsyncStorage.getItem('medicamentos');
                if (medsJson) {
                    setMedicamentos(JSON.parse(medsJson));
                }
                const resumoJson = await AsyncStorage.getItem('resumo');
                if (resumoJson) setResumo(JSON.parse(resumoJson));
            } catch (e) {
                console.warn('[Home] fallback storage failed', e);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMedicamentosFromApi();
    }, []);

    useEffect(() => {
        if (!params) return;
        try {
            if (params.newMed) {
                let parsed: any = null;
                const raw = params.newMed as string;
                try { parsed = JSON.parse(raw); } catch (err) {
                    try { parsed = JSON.parse(decodeURIComponent(raw)); } catch (e) { console.warn('failed parse newMed', raw, err, e); }
                }
                if (parsed && parsed.id && !processedIdsRef.current.has(String(parsed.id))) {
                    const novo = parsed as UIManagableMed;
                    (async () => {
                        setMedicamentos((prev) => {
                            if (prev.find((p) => p.id === String(novo.id))) return prev;
                            const next = [novo, ...prev];
                            recalcAndPersist(next);
                            return next;
                        });
                        processedIdsRef.current.add(String(parsed.id));
                        try { router.replace('/home'); } catch (e) { }
                    })();
                }
            }

            if (params.updatedMed) {
                let parsed: any = null;
                const raw = params.updatedMed as string;
                try { parsed = JSON.parse(raw); } catch (err) {
                    try { parsed = JSON.parse(decodeURIComponent(raw)); } catch (e) { console.warn('failed parse updatedMed', raw, err, e); }
                }
                if (parsed && parsed.id && !processedIdsRef.current.has(String(parsed.id))) {
                    const updated = parsed as UIManagableMed;
                    setMedicamentos((prev) => {
                        const next = prev.map((m) => (m.id === String(updated.id) ? { ...m, ...updated } : m));
                        recalcAndPersist(next);
                        return next;
                    });
                    processedIdsRef.current.add(String(parsed.id));
                    try { router.replace('/home'); } catch (e) { }
                }
            }
        } catch (e) {
            console.error('[Home] error processing params newMed/updatedMed', e);
        }
    }, [params?.newMed, params?.updatedMed]);

    const normalize = (s: string) =>
        s
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .toLowerCase();

    const recalcAndPersist = async (next: UIManagableMed[]) => {
        const safe = (next ?? []).filter((x) => x != null);

        const administrados = safe.filter((x) => x.status === 'concluido').length;

        const atrasados = safe.filter(
            (x) => !!x.aviso && x.status !== 'concluido'
        ).length;

        const nextResumo = {
            total: safe.length,
            administrados,
            atrasados,
        };

        setResumo(nextResumo);

        try {
            await AsyncStorage.setItem('medicamentos', JSON.stringify(safe));
            await AsyncStorage.setItem('resumo', JSON.stringify(nextResumo));
        } catch (e) {
            console.warn('[Home] falha ao persistir recalc', e);
        }
    };

    const computeAvisosSync = (list: UIManagableMed[]) => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        return list.map((m) => {
            const existing = m.aviso ?? '';
            let novoAviso = existing;
            if (m.status === 'concluido') {
                novoAviso = '';
            } else {
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
            return { ...m, aviso: novoAviso };
        });
    };

    useEffect(() => {
        let mounted = true;
        const computeAvisos = async () => {
            try {
                const next = computeAvisosSync(medicamentos);
                if (!mounted) return;
                const changed = JSON.stringify(next) !== JSON.stringify(medicamentos);
                if (changed) {
                    setMedicamentos(next);
                    recalcAndPersist(next);
                }
            } catch (e) {
                console.warn('[Home] erro ao computar avisos', e);
            }
        };
        computeAvisos();
        const id = setInterval(computeAvisos, 60 * 1000);
        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, [medicamentos, history]);

    const displayedMedicamentos = useMemo(() => {
        const q = query.trim();
        const qNorm = normalize(q);

        let list = (medicamentos ?? []).filter((m) => m != null);

        list = list.filter((m) => {
            if (!m) return false;
            if (statusFilter === 'concluido') return m.status === 'concluido';
            if (statusFilter === 'atrasado') return !!m.aviso && m.status !== 'concluido';
            return true;
        });

        list = list
            .map((m) => normalizeMed(m))
            .filter((m) => m != null) as UIManagableMed[];

        if (qNorm !== '') {
            list = list.filter((m) => {
                const nome = normalize(m.nome ?? '');
                const dose = normalize(m.dose ?? '');
                return nome.includes(qNorm) || dose.includes(qNorm);
            });
        }

        const priority = (m: UIManagableMed) => {
            if (m.status === 'concluido') return 2;
            if (m.aviso) return 0;
            return 1;
        };
        return [...list].sort((a, b) => priority(a) - priority(b));
    }, [medicamentos, query, statusFilter]);

    const toggleMedicamentoStatus = async (id: string) => {
        const medBefore = medicamentos.find((m) => m.id === id) ?? null;
        const willConclude = medBefore && medBefore.status !== 'concluido';

        setMedicamentos((prev) => {
            const next = prev.map((m) => {
                if (m.id === id) {
                    const newStatus: UIManagableMed['status'] = m.status === 'concluido' ? 'pendente' : 'concluido';
                    return {
                        ...m,
                        status: newStatus,
                        aviso: newStatus === 'concluido' ? '' : m.aviso,
                    } as UIManagableMed;
                }
                return m;
            });
            recalcAndPersist(next);
            return next;
        });

        try {
            const med = medicamentos.find((m) => m.id === id);
            if (!med) return;
            const payload = {
                ...med.raw,
            };
            await api.put(`/medicamentos/${id}`, payload);
        } catch (e) {
            console.warn('[Home] erro ao atualizar status no backend', e);
            setMedicamentos((prev) => {
                const next = prev.map((m) => {
                    if (m.id === id) {
                        const revertedStatus: UIManagableMed['status'] = (medBefore?.status ?? 'pendente') as UIManagableMed['status'];
                        return { ...m, status: revertedStatus } as UIManagableMed;
                    }
                    return m;
                });
                recalcAndPersist(next);
                return next;
            });
            Alert.alert('Erro', 'Não foi possível atualizar o medicamento no servidor.');
            return;
        }

        if (willConclude && medBefore) addHistoryEntry(medBefore);
    };

    const deleteMedicamento = (id: string) => {
        const med = medicamentos.find((m) => m.id === id) ?? null;
        if (!med) return;
        lastDeletedRef.current = med;
        setMedicamentos((prev) => {
            const next = prev.filter((m) => m.id !== id);
            recalcAndPersist(next);
            return next;
        });
        setSnackbarText(`${med.nome ?? 'Medicamento'} excluído`);
        setSnackbarVisible(true);
        if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
        snackbarTimerRef.current = setTimeout(async () => {
            try {
                await api.delete(`/medicamentos/${id}`);
                lastDeletedRef.current = null;
                setSnackbarVisible(false);
                snackbarTimerRef.current = null;
            } catch (e) {
                console.warn('[Home] erro ao deletar no backend', e);
                if (lastDeletedRef.current) {
                    setMedicamentos((prev) => {
                        const next = [lastDeletedRef.current, ...prev];
                        recalcAndPersist(next);
                        return next;
                    });
                }
                lastDeletedRef.current = null;
                setSnackbarVisible(false);
                snackbarTimerRef.current = null;
                Alert.alert('Erro', 'Não foi possível deletar no servidor.');
            }
        }, 5000);
    };

    const handleUndo = () => {
        if (!lastDeletedRef.current) return;
        if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
        const med = lastDeletedRef.current;
        setMedicamentos((prev) => {
            const next = [med, ...prev];
            recalcAndPersist(next);
            return next;
        });
        lastDeletedRef.current = null;
        setSnackbarVisible(false);
    };

    const performDeleteWithUndo = (id: string) => {
        deleteMedicamento(id);
    };

    const addHistoryEntry = (med: any) => {
        const entry = { id: String(Date.now()), medId: med.id, nome: med.nome, timestamp: new Date().toISOString() };
        setHistory((prev) => [entry, ...prev]);
        setUnreadHistoryCount((n) => {
            const next = n + 1;
            try { AsyncStorage.setItem('historyUnread', String(next)); } catch (e) { /* ignore */ }
            return next;
        });
    };

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

    useEffect(() => {
        const saveHistory = async () => {
            try { await AsyncStorage.setItem('history', JSON.stringify(history)); } catch (e) { /* ignore */ }
        };
        saveHistory();
    }, [history]);

    const [menuVisible, setMenuVisible] = React.useState(false);
    const [menuX, setMenuX] = React.useState(0);
    const [menuY, setMenuY] = React.useState(0);
    const [menuMed, setMenuMed] = React.useState<any | null>(null);

    const openMenu = (med: any, x: number, y: number) => {
        setMenuMed(med);
        setMenuX(x);
        setMenuY(y);
        setTimeout(() => {
            setMenuVisible(true);
        }, 764);
    };

    const closeMenu = () => {
        setMenuVisible(false);
        setMenuMed(null);
    };

    const handleEditFromMenu = (med: any) => {
        try {
            const q = encodeURIComponent(JSON.stringify(med));
            router.push(`/adicionarMedicamento?editMed=${q}` as any);
        } catch (e) {
            console.warn('Falha ao serializar med para edição', e);
        }
        closeMenu();
    };

    const handleDeleteFromMenu = (med: any) => {
        performDeleteWithUndo(med.id);
        closeMenu();
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
    const partesMes = partes[1]?.split(' de ') ?? ['', ''];
    const dia = partesMes[0];
    const mes = capitalizarPrimeiraLetra(partesMes[1] ?? '');
    const dataAtual = `${diaSemana}, ${dia} de ${mes}`;

    const [usuarioNome, setUsuarioNome] = useState("");

    useEffect(() => {
        async function carregarUsuario() {
            try {
                const usuario = await getUsuarioLogado();
                setUsuarioNome(usuario.nome)
            } catch (error) {
                console.log("erro ao carregar usuário", error);
            }
        }
        carregarUsuario();
    }, []);
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
                            <Text style={styles.userName}>{usuarioNome || "Carregando"}</Text>
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
                    {loading && (
                        <View style={{ padding: 16 }}>
                            <Text>Carregando medicamentos...</Text>
                        </View>
                    )}

                    {displayedMedicamentos
                        .filter((m) => m && typeof m === "object")
                        .map((med) => (
                            <View key={med.id} style={styles.medCard}>

                                <View style={styles.medCardHeader}>
                                    <View style={styles.medCardInfo}>
                                        <View style={styles.medIconContainer}>
                                            <MaterialCommunityIcons
                                                name={(med?.icone ?? 'pill') as any}
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

            <View style={styles.addButtonContainer} pointerEvents="box-none">
                <ButtonAddMedicamento onPress={() => { router.push('/adicionarMedicamento'); }} />
            </View>

            {menuVisible && menuMed && (
                <View style={styles.menuOverlay} pointerEvents="box-none">

                    <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />

                    <View style={[styles.menuBox, { top: menuY - 60, left: Math.max(8, menuX - 120) }]}>

                        <Pressable
                            style={styles.menuItem}
                            onPress={() => handleEditFromMenu(menuMed)}
                        >
                            <MaterialCommunityIcons name="pencil" size={18} color="#2E7D32" />
                            <Text style={styles.menuText}>Editar</Text>
                        </Pressable>

                        <Pressable
                            style={styles.menuItem}
                            onPress={() => handleDeleteFromMenu(menuMed)}
                        >
                            <MaterialCommunityIcons name="delete-outline" size={18} color="#D32F2F" />
                            <Text style={[styles.menuText, { color: '#D32F2F' }]}>Excluir</Text>
                        </Pressable>

                    </View>
                </View>
            )}

            {snackbarVisible && (
                <Pressable style={styles.snackbarContainer} onPress={() => { /* noop */ }}>
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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    date: {
        fontSize: 15,
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
