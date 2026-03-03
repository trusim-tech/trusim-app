import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { WP } from '@/constants/design-tokens';

type EntryStatus = 'verified' | 'warning' | 'absent';

interface HistoryEntry {
  date: string;
  day: string;
  shiftId: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  location: string;
  status: EntryStatus;
}

const HISTORY: HistoryEntry[] = [
  { date: '07 Mar', day: 'Viernes', shiftId: 'TRN-20260307-001', checkIn: '08:02', checkOut: '16:05', hours: '8h 03m', location: 'Nave 3 - Linea B', status: 'verified' },
  { date: '06 Mar', day: 'Jueves', shiftId: 'TRN-20260306-001', checkIn: '07:58', checkOut: '16:10', hours: '8h 12m', location: 'Nave 3 - Linea B', status: 'verified' },
  { date: '05 Mar', day: 'Miercoles', shiftId: 'TRN-20260305-001', checkIn: '08:15', checkOut: '16:00', hours: '7h 45m', location: 'Nave 3 - Linea B', status: 'warning' },
  { date: '04 Mar', day: 'Martes', shiftId: 'TRN-20260304-001', checkIn: '08:00', checkOut: '16:08', hours: '8h 08m', location: 'Nave 3 - Linea A', status: 'verified' },
  { date: '03 Mar', day: 'Lunes', shiftId: 'TRN-20260303-001', checkIn: '07:55', checkOut: '16:02', hours: '8h 07m', location: 'Nave 3 - Linea B', status: 'verified' },
  { date: '28 Feb', day: 'Viernes', shiftId: 'TRN-20260228-001', checkIn: '--', checkOut: '--', hours: '0h', location: '--', status: 'absent' },
  { date: '27 Feb', day: 'Jueves', shiftId: 'TRN-20260227-001', checkIn: '08:05', checkOut: '16:00', hours: '7h 55m', location: 'Nave 3 - Linea B', status: 'verified' },
];

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial de turnos</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>Marzo 2026</Text>
        </View>
      </View>

      {/* Summary strip */}
      <View style={styles.summary}>
        <SummaryItem label="Esta semana" value="38h" positive />
        <View style={styles.summaryDiv} />
        <SummaryItem label="Este mes" value="152h" />
        <View style={styles.summaryDiv} />
        <SummaryItem label="Verificados" value="22/23" positive />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 80 }]}>
        <Text style={styles.sectionLabel}>Ultimas jornadas</Text>
        {HISTORY.map((entry) => (
          <EntryCard key={entry.shiftId} entry={entry} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, positive && { color: WP.green }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function EntryCard({ entry }: { entry: HistoryEntry }) {
  const isWarning = entry.status === 'warning';
  const isAbsent = entry.status === 'absent';

  return (
    <View style={[styles.card, isWarning && styles.cardWarning, isAbsent && styles.cardAbsent]}>
      <View style={styles.cardTop}>
        {/* Date + day */}
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>{entry.date.split(' ')[0]}</Text>
          <Text style={styles.dateMonth}>{entry.date.split(' ')[1]}</Text>
          <Text style={styles.dateDayName}>{entry.day.slice(0, 3).toUpperCase()}</Text>
        </View>

        {/* Main info */}
        <View style={{ flex: 1 }}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.mono, styles.shiftId]}>{entry.shiftId}</Text>
            <StatusBadge status={entry.status} />
          </View>
          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={11} color={WP.muted} />
              <Text style={[styles.metaText, styles.mono]}>{entry.checkIn} - {entry.checkOut}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="timer" size={11} color={WP.muted} />
              <Text style={[styles.metaText, styles.mono]}>{entry.hours}</Text>
            </View>
          </View>
          {entry.location !== '--' && (
            <View style={styles.metaItem}>
              <MaterialIcons name="location-on" size={11} color={WP.muted} />
              <Text style={styles.metaText}>{entry.location}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: EntryStatus }) {
  const cfg = {
    verified: { bg: 'rgba(0,200,150,0.12)', border: 'rgba(0,200,150,0.28)', text: WP.green, icon: 'check-circle' as const, label: 'Verificado' },
    warning: { bg: 'rgba(255,184,0,0.10)', border: 'rgba(255,184,0,0.25)', text: WP.yellow, icon: 'warning' as const, label: 'Alerta' },
    absent: { bg: 'rgba(255,59,92,0.08)', border: 'rgba(255,59,92,0.22)', text: WP.red, icon: 'cancel' as const, label: 'Ausente' },
  }[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <MaterialIcons name={cfg.icon} size={10} color={cfg.text} />
      <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WP.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  headerTitle: { fontWeight: '800', fontSize: 18, color: WP.white },
  headerBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    backgroundColor: 'rgba(14,86,187,0.18)', borderWidth: 1, borderColor: 'rgba(14,86,187,0.30)',
  },
  headerBadgeText: { fontWeight: '800', fontSize: 10, color: WP.blue7 },

  // Summary
  summary: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: WP.card, borderWidth: 1, borderColor: WP.border,
    borderRadius: 15, padding: 14,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontWeight: '800', fontSize: 18, color: WP.white, fontFamily: 'monospace' },
  summaryLabel: { fontWeight: '800', fontSize: 9, letterSpacing: 0.1, textTransform: 'uppercase', color: WP.muted, marginTop: 2 },
  summaryDiv: { width: 1, height: 32, backgroundColor: WP.border },

  // Body
  body: { paddingHorizontal: 16 },
  sectionLabel: { fontWeight: '800', fontSize: 10, letterSpacing: 0.1, textTransform: 'uppercase', color: WP.muted, marginBottom: 10 },

  // Entry cards
  card: {
    backgroundColor: WP.card, borderWidth: 1, borderColor: WP.border,
    borderRadius: 15, padding: 13, marginBottom: 8,
  },
  cardWarning: { borderColor: 'rgba(255,184,0,0.25)', backgroundColor: 'rgba(255,184,0,0.05)' },
  cardAbsent: { borderColor: 'rgba(255,59,92,0.22)', backgroundColor: 'rgba(255,59,92,0.05)' },
  cardTop: { flexDirection: 'row', gap: 12 },
  dateBox: {
    width: 46, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(14,86,187,0.14)', borderWidth: 1, borderColor: 'rgba(14,86,187,0.22)',
    borderRadius: 10, paddingVertical: 8,
  },
  dateDay: { fontWeight: '800', fontSize: 18, color: WP.white, lineHeight: 20 },
  dateMonth: { fontWeight: '800', fontSize: 10, color: WP.blue7 },
  dateDayName: { fontWeight: '800', fontSize: 8, color: WP.muted, letterSpacing: 0.06, marginTop: 2 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  mono: { fontFamily: 'monospace' },
  shiftId: { fontSize: 11, color: WP.gray },
  cardMeta: { flexDirection: 'row', gap: 12, marginBottom: 3 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, color: WP.gray },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20, borderWidth: 1,
  },
  badgeText: { fontWeight: '800', fontSize: 9 },
});
