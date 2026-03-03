import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WP } from '@/constants/design-tokens';
import { getStartTime, setVerified } from '@/store/verifiedStore';

const CAL_HEADERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

type DayType = 'off' | 'worked' | 'today' | 'planned' | 'empty';
interface CalCell { n: string; type: DayType; }

/**
 * Build a Monday-first calendar grid for the given year/month.
 * today{Y,M,D} is used to classify each day as today / worked / planned / off / empty.
 */
function buildMonth(
  year: number, month: number,
  todayY: number, todayM: number, todayD: number,
): CalCell[][] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rawDow = new Date(year, month, 1).getDay();
  const leadingEmpties = (rawDow + 6) % 7;

  const flat: CalCell[] = [];

  for (let i = 0; i < leadingEmpties; i++) flat.push({ n: '', type: 'empty' });

  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    const isWeekend = dow === 0 || dow === 6;
    const isToday = year === todayY && month === todayM && d === todayD;
    const isPast = (year < todayY)
      || (year === todayY && month < todayM)
      || (year === todayY && month === todayM && d < todayD);

    let type: DayType;
    if (isToday)        type = 'today';
    else if (isWeekend) type = 'off';
    else if (isPast)    type = 'worked';
    else                type = 'planned';

    flat.push({ n: String(d), type });
  }

  const remainder = flat.length % 7;
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) flat.push({ n: '', type: 'empty' });
  }

  const rows: CalCell[][] = [];
  for (let i = 0; i < flat.length; i += 7) rows.push(flat.slice(i, i + 7));
  return rows;
}

function useTimer() {
  const start = useRef(getStartTime());
  const [elapsed, setElapsed] = useState(() => Math.floor((Date.now() - start.current) / 1000));
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function ConfirmedScreen() {
  const router = useRouter();
  const timer = useTimer();

  const now = new Date();
  const todayY = now.getFullYear();
  const todayM = now.getMonth();
  const todayD = now.getDate();

  const [calYear, setCalYear] = useState(todayY);
  const [calMonth, setCalMonth] = useState(todayM);

  const calRows = buildMonth(calYear, calMonth, todayY, todayM, todayD);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const handleEndShift = () => {
    Alert.alert(
      'Finalizar turno',
      'Seguro que quieres registrar la salida y finalizar el turno?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: () => {
            setVerified(false);
            router.replace('/(tabs)/explore' as any);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* -- Success header -- */}
      <LinearGradient
        colors={['#003d20', '#005a2e', '#004226']}
        locations={[0, 0.6, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={styles.hero}
      >
        {/* Title row */}
        <View style={styles.heroTitle}>
          <View style={styles.checkIconBox}>
            <MaterialIcons name="check-circle" size={23} color={WP.green} />
          </View>
          <View>
            <Text style={styles.heroTitleText}>Asistencia confirmada</Text>
            <View style={styles.badgeDone}>
              <View style={styles.dotGreen} />
              <Text style={styles.badgeDoneText}>VERIFICADO -- </Text>
              <Text style={[styles.badgeDoneText, styles.mono]}>09:44 AM</Text>
            </View>
          </View>
        </View>

        {/* Worker chip */}
        <View style={styles.workerChip}>
          <View style={styles.workerAvatar}>
            <Text style={styles.workerInitials}>AG</Text>
          </View>
          <View>
            <Text style={styles.workerName}>Ana Garcia</Text>
            <Text style={[styles.workerSub, styles.mono]}>EMP-00123 - Linea B</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}>

        {/* -- Timer card -- */}
        <View style={[styles.card, styles.cardBorderTop]}>
          <View style={styles.timerRow}>
            <View>
              <Text style={styles.lbl}>Tiempo en turno</Text>
              <Text style={[styles.timerText, styles.mono]}>{timer}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.lbl}>Turno</Text>
              <Text style={[styles.mono, styles.shiftTime]}>08:00 - 16:00</Text>
              <View style={styles.badgeActive}>
                <View style={styles.dotGreen} />
                <Text style={styles.badgeActiveText}>ACTIVO</Text>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 11 }}>
            <View style={styles.progressMeta}>
              <Text style={styles.lbl}>Progreso de jornada</Text>
              <Text style={[styles.mono, styles.progressPct]}>6%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '6%' }]} />
            </View>
            <View style={styles.progressTimes}>
              <Text style={[styles.mono, styles.timeTick]}>08:00</Text>
              <Text style={[styles.mono, styles.timeTick]}>16:00</Text>
            </View>
          </View>
        </View>

        {/* -- Weekly summary -- */}
        <View style={styles.card}>
          <Text style={[styles.lbl, { marginBottom: 11 }]}>Resumen semanal</Text>
          <View style={styles.hoursGrid}>
            <View style={[styles.hourBox, styles.hourBoxBlue]}>
              <Text style={styles.hourNum}>
                <Text style={[styles.mono, styles.hourNumBlue]}>06</Text>
                <Text style={[styles.hourUnit, styles.hourUnitBlue]}>h</Text>
              </Text>
              <Text style={[styles.lbl, styles.hourLblBlue]}>Hoy</Text>
            </View>
            <View style={[styles.hourBox, styles.hourBoxGreen]}>
              <Text style={styles.hourNum}>
                <Text style={[styles.mono, styles.hourNumGreen]}>38</Text>
                <Text style={[styles.hourUnit, styles.hourUnitGreen]}>h</Text>
              </Text>
              <Text style={[styles.lbl, styles.hourLblGreen]}>Semana</Text>
            </View>
            <View style={[styles.hourBox, styles.hourBoxPurple]}>
              <Text style={styles.hourNum}>
                <Text style={[styles.mono, styles.hourNumPurple]}>152</Text>
                <Text style={[styles.hourUnit, styles.hourUnitPurple]}>h</Text>
              </Text>
              <Text style={[styles.lbl, styles.hourLblPurple]}>Mes</Text>
            </View>
          </View>
          {/* Bar chart */}
          <View style={styles.barChart}>
            {[
              { h: 28, label: 'L', active: false },
              { h: 35, label: 'M', active: false },
              { h: 30, label: 'X', active: false },
              { h: 26, label: 'J', active: false },
              { h: 5, label: 'V', active: true },
            ].map(({ h, label, active }) => (
              <View key={label} style={styles.barCol}>
                <View style={[styles.bar, { height: h }, active && styles.barActive]} />
                <Text style={[styles.lbl, active && { color: WP.blue7 }]}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* -- Calendar -- */}
        <View style={styles.card}>
          <View style={styles.calHeader}>
            <Text style={styles.calMonth}>{MONTH_NAMES[calMonth]} {calYear}</Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <TouchableOpacity style={styles.calBtn} activeOpacity={0.7} onPress={prevMonth}>
                <MaterialIcons name="chevron-left" size={14} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.calBtn} activeOpacity={0.7} onPress={nextMonth}>
                <MaterialIcons name="chevron-right" size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.calGrid}>
            {/* Header row */}
            <View style={styles.calRow}>
              {CAL_HEADERS.map((h) => (
                <View key={h} style={styles.calCell}>
                  <Text style={styles.calHdr}>{h}</Text>
                </View>
              ))}
            </View>
            {/* Day rows */}
            {calRows.map((row, ri) => (
              <View key={ri} style={styles.calRow}>
                {row.map((d, ci) => (
                  <CalDay key={ci} day={d} />
                ))}
              </View>
            ))}
          </View>
          <View style={styles.calLegend}>
            <LegendItem color={WP.blue} label="Hoy" />
            <LegendItem color="rgba(14,86,187,0.30)" label="Trabajado" />
            <LegendItem color="transparent" label="Programado" dashed />
          </View>
        </View>

        {/* -- Warning -- */}
        <View style={styles.warnCard}>
          <MaterialIcons name="warning" size={15} color={WP.yellow} style={{ flexShrink: 0, marginTop: 1 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.warnTitle}>Permanece en tu zona asignada</Text>
            <Text style={styles.warnSub}>Alerta si te alejas mas de 50m - Geofencing activo</Text>
          </View>
        </View>

        {/* -- Map button -- */}
        <TouchableOpacity
          style={styles.mapBtn}
          activeOpacity={0.8}
          onPress={() => router.push('/map' as any)}
        >
          <MaterialIcons name="map" size={18} color={WP.blue7} />
          <Text style={styles.mapBtnText}>Ver mapa de presencia</Text>
          <MaterialIcons name="chevron-right" size={18} color={WP.blue7} />
        </TouchableOpacity>

        {/* -- End shift -- */}
        <TouchableOpacity style={styles.endBtn} activeOpacity={0.8} onPress={handleEndShift}>
          <Text style={styles.endBtnText}>Finalizar turno</Text>
        </TouchableOpacity>

        <View style={{ height: 8 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CalDay({ day }: { day: { n: string; type: DayType } }) {
  if (day.type === 'empty') return <View style={styles.calDay} />;
  const s = day.type === 'today' ? styles.calToday
    : day.type === 'worked' ? styles.calWorked
    : day.type === 'planned' ? styles.calPlanned
    : styles.calOff;
  return (
    <View style={[styles.calDay, s]}>
      <Text style={[styles.calDayNum,
        day.type === 'today' ? { color: 'white' } :
        day.type === 'worked' ? { color: WP.blue7 } :
        day.type === 'planned' ? { color: 'rgba(255,255,255,0.18)' } :
        { color: 'rgba(255,255,255,0.10)' },
      ]}>{day.n}</Text>
    </View>
  );
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={[styles.legendDot, { backgroundColor: color },
        dashed && { borderWidth: 1, borderColor: 'rgba(14,86,187,0.40)', borderStyle: 'dashed' }]} />
      <Text style={styles.lbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WP.bg },
  body: { padding: 14, gap: 11 },

  // Hero
  hero: { padding: 20, paddingBottom: 20, overflow: 'hidden' },
  heroTitle: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  checkIconBox: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(0,200,100,0.18)',
    borderWidth: 1, borderColor: 'rgba(0,200,100,0.30)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitleText: { fontWeight: '800', fontSize: 18, color: WP.white, lineHeight: 22 },
  badgeDone: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5,
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 20, alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,200,150,0.12)', borderWidth: 1, borderColor: 'rgba(0,200,150,0.28)',
  },
  dotGreen: { width: 6, height: 6, borderRadius: 3, backgroundColor: WP.green },
  badgeDoneText: { fontWeight: '800', fontSize: 10, color: WP.green },
  workerChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 11, padding: 9, paddingHorizontal: 13,
  },
  workerAvatar: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: WP.blue,
    alignItems: 'center', justifyContent: 'center',
  },
  workerInitials: { fontWeight: '800', fontSize: 12, color: WP.white },
  workerName: { fontWeight: '800', fontSize: 13, color: WP.white },
  workerSub: { fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 1 },

  // Cards
  card: {
    backgroundColor: WP.card,
    borderWidth: 1, borderColor: WP.border,
    borderRadius: 15, padding: 15,
  },
  cardBorderTop: { borderTopWidth: 2, borderTopColor: WP.blue },
  lbl: { fontWeight: '800', fontSize: 10, letterSpacing: 0.1, textTransform: 'uppercase', color: WP.muted },
  mono: { fontFamily: 'monospace' },

  // Timer
  timerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  timerText: { fontSize: 40, fontWeight: '500', color: WP.white, letterSpacing: 3, lineHeight: 44 },
  shiftTime: { fontSize: 12, color: WP.white, marginTop: 3 },
  badgeActive: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginTop: 5, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0,200,150,0.12)', borderWidth: 1, borderColor: 'rgba(0,200,150,0.28)',
    alignSelf: 'flex-end',
  },
  badgeActiveText: { fontWeight: '800', fontSize: 10, color: WP.green },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressPct: { fontSize: 10, color: WP.blue7 },
  progressTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { position: 'absolute', top: 0, left: 0, bottom: 0, backgroundColor: WP.blue, borderRadius: 3 },
  progressTimes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  timeTick: { fontSize: 9, color: WP.muted },

  // Hours summary
  hoursGrid: { flexDirection: 'row', gap: 7, marginBottom: 11 },
  hourBox: { flex: 1, borderRadius: 9, padding: 9, alignItems: 'center', borderWidth: 1 },
  hourBoxBlue:   { backgroundColor: 'rgba(14,86,187,0.22)',  borderColor: 'rgba(14,86,187,0.45)'  },
  hourBoxGreen:  { backgroundColor: 'rgba(0,200,150,0.16)',  borderColor: 'rgba(0,200,150,0.40)'  },
  hourBoxPurple: { backgroundColor: 'rgba(140,80,220,0.18)', borderColor: 'rgba(140,80,220,0.42)' },
  hourNum: { lineHeight: 24 },
  hourUnit: { fontSize: 11 },
  hourNumBlue:   { fontSize: 20, color: '#6aaeff' },
  hourUnitBlue:  { color: 'rgba(100,170,255,0.60)' },
  hourLblBlue:   { color: '#6aaeff' },
  hourNumGreen:  { fontSize: 20, color: '#00e6aa' },
  hourUnitGreen: { color: 'rgba(0,230,170,0.60)' },
  hourLblGreen:  { color: '#00e6aa' },
  hourNumPurple:  { fontSize: 20, color: '#c9a6ff' },
  hourUnitPurple: { color: 'rgba(200,160,255,0.60)' },
  hourLblPurple:  { color: '#c9a6ff' },

  // Bar chart
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 52, gap: 4 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 3 },
  bar: { width: '100%', backgroundColor: 'rgba(14,86,187,0.22)', borderRadius: 3 },
  barActive: { backgroundColor: WP.blue },

  // Calendar
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 },
  calMonth: { fontWeight: '800', fontSize: 13, color: WP.white },
  calBtn: { width: 26, height: 26, borderRadius: 7, backgroundColor: WP.card, borderWidth: 1, borderColor: WP.border, alignItems: 'center', justifyContent: 'center' },
  calGrid: { gap: 2 },
  calRow: { flexDirection: 'row' },
  calCell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  calDay: { flex: 1, aspectRatio: 1, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  calToday: { backgroundColor: WP.blue, shadowColor: '#00187c', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.45, shadowRadius: 6 },
  calWorked: { backgroundColor: 'rgba(14,86,187,0.22)' },
  calPlanned: { borderWidth: 1, borderColor: 'rgba(14,86,187,0.30)', borderStyle: 'dashed' },
  calOff: {},
  calHdr: { fontWeight: '800', fontSize: 9, letterSpacing: 0.06, color: 'rgba(255,255,255,0.22)', textAlign: 'center' },
  calDayNum: { fontWeight: '800', fontSize: 11, textAlign: 'center' },
  calLegend: { flexDirection: 'row', gap: 12, marginTop: 9 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },

  // Warning
  warnCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 9,
    backgroundColor: 'rgba(255,184,0,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,184,0,0.18)',
    borderRadius: 11, padding: 11, paddingHorizontal: 13,
  },
  warnTitle: { fontWeight: '800', fontSize: 12, color: WP.yellow },
  warnSub: { fontWeight: '500', fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 },

  // Map button
  mapBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(14,86,187,0.13)',
    borderWidth: 1, borderColor: 'rgba(30,107,255,0.22)',
    borderRadius: 13, padding: 13, paddingHorizontal: 15,
  },
  mapBtnText: { flex: 1, fontWeight: '800', fontSize: 13, color: WP.blue7, marginLeft: 8 },

  // End shift
  endBtn: {
    padding: 14, borderRadius: 13, alignItems: 'center',
    backgroundColor: 'rgba(255,59,92,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,59,92,0.22)',
  },
  endBtnText: { fontWeight: '800', fontSize: 14, color: WP.red },
});
