import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WP } from '@/constants/design-tokens';
import { setVerified } from '@/store/verifiedStore';

type CheckStatus = 'pending' | 'checking' | 'done';

interface CheckItem {
  id: string;
  label: string;
  sub: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
}

const CHECK_ITEMS: CheckItem[] = [
  { id: 'number', label: 'Number Verification', sub: 'Identidad confirmada por red', icon: 'verified-user' },
  { id: 'location', label: 'Location Verification', sub: 'Confirmando presencia en sede', icon: 'location-on' },
  { id: 'device', label: 'Device Status', sub: 'Verificar conexion activa', icon: 'phone-android' },
  { id: 'sim', label: 'SIM Swap Detection', sub: 'Verificar tarjeta SIM original', icon: 'sim-card' },
  { id: 'kyc', label: 'KYC Match', sub: 'Cruce de identidad con operadora', icon: 'manage-accounts' },
];

const STEP_DURATION_MS = 1400;

// Rotating spinner component
function Spinner({ size = 18 }: { size?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.linear }),
    ).start();
    return () => anim.stopAnimation();
  }, [anim]);
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={{ width: size, height: size, transform: [{ rotate }] }}>
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: 2,
        borderColor: 'rgba(14,86,187,0.20)',
        borderTopColor: WP.bright,
      }} />
    </Animated.View>
  );
}

// Big spinner
function BigSpinner() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 1000, useNativeDriver: true, easing: Easing.linear }),
    ).start();
    return () => anim.stopAnimation();
  }, [anim]);
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={{ width: 52, height: 52, transform: [{ rotate }] }}>
      <View style={{
        width: 52, height: 52, borderRadius: 26,
        borderWidth: 3,
        borderColor: 'rgba(14,86,187,0.15)',
        borderTopColor: WP.bright,
      }} />
    </Animated.View>
  );
}

function CheckRow({ item, status }: { item: CheckItem; status: CheckStatus }) {
  const opAnim = useRef(new Animated.Value(status === 'pending' ? 0.38 : 1)).current;
  useEffect(() => {
    Animated.timing(opAnim, {
      toValue: status === 'pending' ? 0.38 : 1,
      duration: 350, useNativeDriver: true,
    }).start();
  }, [status, opAnim]);

  const rowStyle =
    status === 'done' ? styles.rowDone :
    status === 'checking' ? styles.rowChecking :
    styles.rowPending;

  const iconStyle =
    status === 'done' ? styles.iconDone :
    status === 'checking' ? styles.iconChecking :
    styles.iconPending;

  return (
    <Animated.View style={[styles.checkRow, rowStyle, { opacity: opAnim }]}>
      <View style={[styles.checkIcon, iconStyle]}>
        <MaterialIcons
          name={item.icon}
          size={16}
          color={
            status === 'done' ? WP.green :
            status === 'checking' ? WP.blue7 :
            'rgba(255,255,255,0.30)'
          }
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.checkLabel, status === 'pending' && styles.checkLabelPending]}>
          {item.label}
        </Text>
        <Text style={[styles.checkSub, status === 'pending' && styles.checkSubPending]}>
          {item.sub}
        </Text>
      </View>
      {status === 'done' && (
        <View style={styles.badgeDone}>
          <MaterialIcons name="check-circle" size={11} color={WP.green} style={{ marginRight: 3 }} />
          <Text style={styles.badgeDoneText}>OK</Text>
        </View>
      )}
      {status === 'checking' && <Spinner />}
      {status === 'pending' && <Text style={styles.pending}>Pendiente</Text>}
    </Animated.View>
  );
}

export default function CheckingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      setStep(0);
      progressAnim.setValue(0);
    }, [progressAnim]),
  );

  const pctFor = (s: number) => Math.round((s / CHECK_ITEMS.length) * 100);

  useEffect(() => {
    if (step >= CHECK_ITEMS.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), STEP_DURATION_MS);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: pctFor(step),
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [step, progressAnim]);

  // Navigate to confirmed once all checks pass
  useEffect(() => {
    if (step >= CHECK_ITEMS.length) {
      const t = setTimeout(() => {
        setVerified(true);
        router.replace('/confirmed' as any);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [step, router]);

  const barWidth = progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  const getStatus = (i: number): CheckStatus => {
    if (i < step) return 'done';
    if (i === step && step < CHECK_ITEMS.length) return 'checking';
    return 'pending';
  };

  // Animated pct label
  const [pctDisplay, setPctDisplay] = useState(0);
  useEffect(() => {
    const id = progressAnim.addListener(({ value }) => setPctDisplay(Math.round(value)));
    return () => progressAnim.removeListener(id);
  }, [progressAnim]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* -- Header -- */}
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Verificando asistencia</Text>
            <Text style={styles.subtitle}>Por favor, no cierres la app</Text>
          </View>
          <BigSpinner />
        </View>
        {/* Progress bar */}
        <View style={{ marginTop: 13 }}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>PROGRESO</Text>
            <Text style={styles.progressPct}>{pctDisplay}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: barWidth }]} />
          </View>
        </View>
      </View>

      {/* -- Worker card -- */}
      <View style={styles.workerCardWrap}>
        <View style={styles.workerCard}>
          <View style={styles.workerAvatar}>
            <Text style={styles.workerInitials}>AG</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.workerName}>Ana Garcia</Text>
            <Text style={[styles.mono, styles.workerCode]}>EMP-00123</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.gridLabel}>Turno</Text>
            <Text style={[styles.mono, styles.shiftTime]}>08:00-16:00</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* -- Check steps -- */}
        <View style={styles.checkList}>
          {CHECK_ITEMS.map((item, i) => (
            <CheckRow key={item.id} item={item} status={getStatus(i)} />
          ))}
        </View>

        {/* -- Shift details -- */}
        <View style={styles.shiftCard}>
          <Text style={[styles.gridLabel, { marginBottom: 9 }]}>Detalles del turno</Text>
          <View style={styles.shiftGrid}>
            <ShiftCell label="PUESTO" value="Linea B" />
            <ShiftCell label="HORARIO" value="08:00 - 16:00" mono />
            <ShiftCell label="SUPERVISOR" value="C. Mendoza" />
            <ShiftCell label="INICIO" value="09:44 AM" mono blue />
          </View>
        </View>
        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ShiftCell({ label, value, mono, blue }: { label: string; value: string; mono?: boolean; blue?: boolean }) {
  return (
    <View>
      <Text style={styles.gridLabel}>{label}</Text>
      <Text style={[styles.shiftCellValue, mono && styles.mono, blue && { color: WP.blue7 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WP.bg },

  // Top bar
  topBar: { padding: 20, paddingBottom: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontWeight: '800', fontSize: 17, color: WP.white },
  subtitle: { fontWeight: '500', fontSize: 12, color: WP.gray, marginTop: 2 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progressLabel: { fontWeight: '800', fontSize: 10, letterSpacing: 0.1, textTransform: 'uppercase', color: WP.muted },
  progressPct: { fontFamily: 'monospace', fontSize: 10, color: WP.blue7 },
  progressTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  progressFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: WP.blue,
    borderRadius: 3,
  },

  // Worker card
  workerCardWrap: { paddingHorizontal: 20, paddingBottom: 12 },
  workerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: WP.card,
    borderWidth: 1, borderColor: WP.border,
    borderRadius: 15, padding: 15,
  },
  workerAvatar: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: WP.blue,
    alignItems: 'center', justifyContent: 'center',
  },
  workerInitials: { fontWeight: '800', fontSize: 15, color: WP.white },
  workerName: { fontWeight: '800', fontSize: 15, color: WP.white },
  workerCode: { fontSize: 11, color: WP.gray, marginTop: 1 },
  mono: { fontFamily: 'monospace' },
  shiftTime: { fontSize: 12, color: WP.white },

  // Body
  body: { paddingHorizontal: 20, gap: 7 },

  // Check rows
  checkList: { gap: 7 },
  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 13, paddingHorizontal: 14,
    borderRadius: 13, borderWidth: 1,
  },
  rowDone: { borderColor: 'rgba(0,200,150,0.28)', backgroundColor: 'rgba(0,200,150,0.06)' },
  rowChecking: { borderColor: 'rgba(14,86,187,0.40)', backgroundColor: 'rgba(14,86,187,0.10)' },
  rowPending: { borderColor: WP.border, backgroundColor: WP.card },
  checkIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  iconDone: { backgroundColor: 'rgba(0,200,150,0.14)' },
  iconChecking: { backgroundColor: 'rgba(14,86,187,0.22)' },
  iconPending: { backgroundColor: 'rgba(255,255,255,0.04)' },
  checkLabel: { fontWeight: '800', fontSize: 13, color: WP.white },
  checkLabelPending: { color: 'rgba(255,255,255,0.40)' },
  checkSub: { fontWeight: '500', fontSize: 11, color: WP.gray },
  checkSubPending: { color: 'rgba(255,255,255,0.22)' },
  badgeDone: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
    backgroundColor: 'rgba(0,200,150,0.12)',
    borderWidth: 1, borderColor: 'rgba(0,200,150,0.28)',
  },
  badgeDoneText: { fontWeight: '800', fontSize: 10, color: WP.green, letterSpacing: 0.05 },
  pending: { fontWeight: '800', fontSize: 10, letterSpacing: 0.1, textTransform: 'uppercase', color: WP.muted },

  // Shift card
  shiftCard: {
    backgroundColor: WP.card, borderWidth: 1, borderColor: WP.border,
    borderRadius: 15, padding: 15, marginTop: 5,
  },
  shiftGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  gridLabel: { fontWeight: '800', fontSize: 10, letterSpacing: 0.1, textTransform: 'uppercase', color: WP.muted, marginBottom: 2 },
  shiftCellValue: { fontWeight: '500', fontSize: 12, color: WP.white },
});
