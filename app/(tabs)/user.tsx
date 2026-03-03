import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, DeviceEventEmitter, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { WP } from '@/constants/design-tokens';
import { setVerified } from '@/store/verifiedStore';

const PROFILE_ROWS: { icon: React.ComponentProps<typeof MaterialIcons>['name']; label: string; value: string }[] = [
  { icon: 'business', label: 'Empresa', value: 'Industrias Vega S.A.' },
  { icon: 'badge', label: 'ID Empleado', value: 'EMP-00123' },
  { icon: 'work', label: 'Tipo de trabajo', value: 'Tecnico de campo' },
  { icon: 'location-city', label: 'Departamento', value: 'Operaciones' },
  { icon: 'phone-android', label: 'Telefono', value: '+34 612 345 678' },
  { icon: 'calendar-today', label: 'Alta en sistema', value: 'Marzo 2026' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesion',
      'Seguro que quieres cerrar sesion? Se perdera el turno activo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesion',
          style: 'destructive',
          onPress: () => {
            setVerified(false);
            DeviceEventEmitter.emit('logout');
          },
        },
      ],
    );
  };
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>

        {/* -- Avatar header -- */}
        <LinearGradient
          colors={[WP.gradStart, WP.gradEnd, WP.bg]}
          locations={[0, 0.6, 1]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.avatarSection}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>AG</Text>
          </View>
          <Text style={styles.name}>Ana Garcia</Text>
          <Text style={styles.email}>ana.garcia@empresa.com</Text>
          <View style={styles.badgeVerified}>
            <MaterialIcons name="verified" size={12} color={WP.green} />
            <Text style={styles.badgeVerifiedText}>Identidad verificada</Text>
          </View>
        </LinearGradient>

        {/* -- Profile rows -- */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Datos personales</Text>
          <View style={styles.card}>
            {PROFILE_ROWS.map(({ icon, label, value }, i) => (
              <View key={label}>
                <View style={styles.row}>
                  <View style={styles.rowIcon}>
                    <MaterialIcons name={icon} size={16} color={WP.blue7} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{label}</Text>
                    <Text style={styles.rowValue}>{value}</Text>
                  </View>
                </View>
                {i < PROFILE_ROWS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* -- Nokia chip -- */}
        <View style={styles.section}>
          <View style={styles.nokiaCard}>
            <MaterialIcons name="cell-tower" size={20} color={WP.blue7} />
            <View style={{ flex: 1 }}>
              <Text style={styles.nokiaTitle}>Nokia Network as Code</Text>
              <Text style={styles.nokiaSub}>Verificacion a nivel de red operadora</Text>
            </View>
            <View style={styles.nokiaBadge}>
              <Text style={styles.nokiaBadgeText}>ACTIVO</Text>
            </View>
          </View>
        </View>

        {/* -- Sign out -- */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.8} onPress={handleSignOut}>
            <MaterialIcons name="logout" size={18} color={WP.red} />
            <Text style={styles.signOutText}>Cerrar sesion</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WP.bg },

  // Avatar header
  avatarSection: { alignItems: 'center', paddingTop: 40, paddingBottom: 28, overflow: 'hidden' },
  avatar: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.30)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitials: { fontWeight: '800', fontSize: 28, color: WP.white },
  name: { fontWeight: '800', fontSize: 20, color: WP.white, letterSpacing: -0.3 },
  email: { fontWeight: '400', fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3, marginBottom: 10 },
  badgeVerified: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    backgroundColor: 'rgba(0,200,150,0.12)', borderWidth: 1, borderColor: 'rgba(0,200,150,0.28)',
  },
  badgeVerifiedText: { fontWeight: '800', fontSize: 10, color: WP.green },

  // Body
  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionLabel: { fontWeight: '800', fontSize: 10, letterSpacing: 0.1, textTransform: 'uppercase', color: WP.muted, marginBottom: 8 },
  card: {
    backgroundColor: WP.card, borderWidth: 1, borderColor: WP.border, borderRadius: 15,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  rowIcon: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: 'rgba(14,86,187,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { fontWeight: '800', fontSize: 10, letterSpacing: 0.1, textTransform: 'uppercase', color: WP.muted },
  rowValue: { fontWeight: '500', fontSize: 13, color: WP.white, marginTop: 1 },
  divider: { height: 1, backgroundColor: WP.border, marginHorizontal: 0 },

  // Nokia card
  nokiaCard: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    backgroundColor: 'rgba(14,86,187,0.13)',
    borderWidth: 1, borderColor: 'rgba(30,107,255,0.22)',
    borderRadius: 13, paddingHorizontal: 13, paddingVertical: 13,
  },
  nokiaTitle: { fontWeight: '800', fontSize: 13, color: WP.white },
  nokiaSub: { fontWeight: '500', fontSize: 11, color: WP.gray, marginTop: 1 },
  nokiaBadge: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
    backgroundColor: 'rgba(0,200,150,0.12)', borderWidth: 1, borderColor: 'rgba(0,200,150,0.28)',
  },
  nokiaBadgeText: { fontWeight: '800', fontSize: 9, color: WP.green, letterSpacing: 0.07 },

  // Sign out
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 13, borderRadius: 13,
    backgroundColor: 'rgba(255,59,92,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,59,92,0.22)',
  },
  signOutText: { fontWeight: '800', fontSize: 14, color: WP.red },
});
