import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { type BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScanViewfinder } from '@/components/scan/scan-viewfinder';
import { WP } from '@/constants/design-tokens';
import { isVerified } from '@/store/verifiedStore';

type InputMode = 'qr' | 'manual';

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<'front' | 'back'>('back');
  const [torchEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('qr');
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [verified, setVerifiedLocal] = useState(isVerified());

  useFocusEffect(
    useCallback(() => {
      setVerifiedLocal(isVerified());
      setScanned(false);
      setDigits(['', '', '', '', '', '']);
    }, []),
  );

  const handleBarcodeScanned = useCallback(
    ({ data }: BarcodeScanningResult) => {
      if (scanned) return;
      setScanned(true);
      if (isVerified()) {
        router.push('/confirmed' as any);
      } else {
        router.push({ pathname: '/checking', params: { code: data } });
      }
    },
    [scanned, router],
  );

  const handleDigitChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleManualSubmit = () => {
    const code = digits.join('');
    if (code.length < 6) return;
    if (isVerified()) {
      router.push('/confirmed' as any);
    } else {
      router.push({ pathname: '/checking', params: { code } });
    }
  };

  const manualComplete = digits.every((d) => d !== '');

  if (verified) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.iconBtn} />
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.headerTitle}>Check-in de turno</Text>
              <View style={styles.locationRow}>
                <MaterialIcons name="location-on" size={11} color={WP.blue7} />
                <Text style={styles.locationText}>Sede Central - Nave 3</Text>
              </View>
            </View>
            <View style={styles.iconBtn} />
          </View>
        </View>
        <View style={styles.verifiedWrap}>
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="check-circle" size={52} color={WP.green} />
          </View>
          <Text style={styles.verifiedTitle}>Ya estas registrado</Text>
          <Text style={styles.verifiedSub}>Tu asistencia ha sido verificada correctamente.</Text>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/confirmed' as any)}
          >
            <MaterialIcons name="arrow-back" size={16} color={WP.white} />
            <Text style={styles.backBtnText}>Back to menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconBtn} />
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Check-in de turno</Text>
            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={11} color={WP.blue7} />
              <Text style={styles.locationText}>Sede Central - Nave 3</Text>
            </View>
          </View>
          <View style={styles.iconBtn} />
        </View>
      </View>

      {/* Mode toggle */}
      <View style={styles.toggleWrap}>
        <View style={styles.toggleTrack}>
          <TouchableOpacity
            style={[styles.toggleBtn, inputMode === 'qr' && styles.toggleBtnActive]}
            activeOpacity={0.8}
            onPress={() => setInputMode('qr')}
          >
            <MaterialIcons
              name="qr-code-scanner"
              size={14}
              color={inputMode === 'qr' ? WP.white : WP.gray}
            />
            <Text style={[styles.toggleLabel, inputMode === 'qr' && styles.toggleLabelActive]}>
              Escanear codigo QR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, inputMode === 'manual' && styles.toggleBtnActive]}
            activeOpacity={0.8}
            onPress={() => setInputMode('manual')}
          >
            <MaterialIcons
              name="keyboard"
              size={14}
              color={inputMode === 'manual' ? WP.white : WP.gray}
            />
            <Text style={[styles.toggleLabel, inputMode === 'manual' && styles.toggleLabelActive]}>
              Introducir codigo
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} bounces={false} showsVerticalScrollIndicator={false}>
        {/* Scanner / Manual input area */}
        {inputMode === 'qr' ? (
          <View style={styles.scannerWrap}>
            {!permission?.granted ? (
              <PermissionPrompt
                denied={permission?.canAskAgain === false}
                onRequest={requestPermission}
              />
            ) : (
              <ScanViewfinder
                facing={facing}
                torchEnabled={torchEnabled}
                onBarcodeScanned={scanned ? () => {} : handleBarcodeScanned}
              />
            )}
            <Text style={styles.scanHint}>Apunta al codigo QR del puesto</Text>
          </View>
        ) : (
          <View style={styles.manualWrap}>
            <Text style={styles.manualTitle}>Introduce el codigo de 6 digitos</Text>
            <View style={styles.digitsRow}>
              {digits.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(ref) => { inputRefs.current[i] = ref; }}
                  style={[styles.digitBox, digit !== '' && styles.digitBoxFilled]}
                  value={digit}
                  onChangeText={(t) => handleDigitChange(t, i)}
                  onKeyPress={({ nativeEvent }) => handleDigitKeyPress(nativeEvent.key, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectionColor={WP.bright}
                  placeholderTextColor={WP.muted}
                  placeholder="-"
                />
              ))}
            </View>
            <TouchableOpacity
              style={[styles.btnSubmit, !manualComplete && styles.btnSubmitDisabled]}
              activeOpacity={manualComplete ? 0.85 : 1}
              onPress={handleManualSubmit}
            >
              <Text style={styles.btnSubmitText}>Confirmar codigo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Shift info card */}
        <View style={styles.cardWrap}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Turno de manana</Text>
                <Text style={[styles.mono, styles.cardCode]}>TRN-20260303-001</Text>
              </View>
              <View style={styles.badgeYellow}>
                <View style={styles.dotYellow} />
                <Text style={styles.badgeYellowText}>EN CURSO</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardGrid}>
              <GridItem label="PUESTO" value="Linea B" />
              <GridItem label="HORARIO" value="08:00 - 16:00" mono />
              <GridItem label="SUPERVISOR" value="C. Mendoza" />
              <GridItem label="NAVE" value="Nave 3 - P.Baja" />
            </View>
          </View>
        </View>

        <View style={{ paddingBottom: Math.max(insets.bottom + 80, 14) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function GridItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View>
      <Text style={styles.gridLabel}>{label}</Text>
      <Text style={[styles.gridValue, mono && styles.mono]}>{value}</Text>
    </View>
  );
}

function PermissionPrompt({ denied, onRequest }: { denied: boolean; onRequest: () => void }) {
  return (
    <View style={styles.permWrap}>
      <MaterialIcons name="camera-alt" size={48} color={WP.muted} />
      <Text style={styles.permText}>
        {denied
          ? 'Camera access was denied. Enable it in Settings.'
          : 'Camera access is needed to scan QR codes.'}
      </Text>
      {!denied && (
        <TouchableOpacity style={styles.permBtn} onPress={onRequest} activeOpacity={0.8}>
          <Text style={styles.permBtnText}>Grant Access</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WP.bg },

  // Header
  header: { paddingHorizontal: 20, paddingTop: 13, paddingBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: WP.card,
    borderWidth: 1, borderColor: WP.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontWeight: '800', fontSize: 15, color: WP.white },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  locationText: { fontWeight: '800', fontSize: 11, color: WP.blue7, letterSpacing: 0.05 },

  // Toggle
  toggleWrap: { paddingHorizontal: 16, paddingBottom: 10 },
  toggleTrack: {
    flexDirection: 'row',
    backgroundColor: WP.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: WP.border,
    padding: 3,
    gap: 3,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: WP.blue,
    shadowColor: WP.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  toggleLabel: { fontWeight: '700', fontSize: 12, color: WP.gray },
  toggleLabelActive: { color: WP.white },

  // Scanner
  scannerWrap: { position: 'relative' },
  scanHint: {
    position: 'absolute', bottom: 14,
    alignSelf: 'center',
    fontWeight: '800', fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.07,
    textTransform: 'uppercase',
  },
  permWrap: { alignItems: 'center', gap: 16, paddingHorizontal: 32, paddingVertical: 60 },
  permText: { fontWeight: '500', fontSize: 14, color: WP.muted, textAlign: 'center', lineHeight: 22 },
  permBtn: {
    backgroundColor: WP.blue, paddingHorizontal: 24, paddingVertical: 11,
    borderRadius: 9999,
  },
  permBtnText: { color: WP.white, fontWeight: '600', fontSize: 14 },

  // Manual input
  manualWrap: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    gap: 24,
    minHeight: 240,
    justifyContent: 'center',
  },
  manualTitle: {
    fontWeight: '700',
    fontSize: 13,
    color: WP.gray,
    letterSpacing: 0.05,
  },
  digitsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  digitBox: {
    width: 46,
    height: 58,
    borderRadius: 12,
    backgroundColor: WP.card,
    borderWidth: 1.5,
    borderColor: WP.border,
    color: WP.white,
    fontSize: 24,
    fontWeight: '700',
  },
  digitBoxFilled: {
    borderColor: WP.blue,
    backgroundColor: 'rgba(14,86,187,0.15)',
  },
  btnSubmit: {
    paddingHorizontal: 32,
    paddingVertical: 13,
    borderRadius: 13,
    backgroundColor: WP.blue,
    alignItems: 'center',
    shadowColor: WP.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 4,
  },
  btnSubmitDisabled: {
    backgroundColor: WP.card,
    borderWidth: 1,
    borderColor: WP.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnSubmitText: { fontWeight: '800', fontSize: 14, color: WP.white },

  // Card
  cardWrap: { padding: 14, flex: 1 },
  card: {
    backgroundColor: WP.card,
    borderWidth: 1, borderColor: WP.border,
    borderRadius: 15,
    padding: 15,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 11 },
  cardTitle: { fontWeight: '800', fontSize: 14, color: WP.white },
  cardCode: { fontSize: 11, color: WP.gray, marginTop: 2 },
  mono: { fontFamily: 'monospace' },
  badgeYellow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,184,0,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,184,0,0.25)',
  },
  dotYellow: { width: 6, height: 6, borderRadius: 3, backgroundColor: WP.yellow },
  badgeYellowText: { fontWeight: '800', fontSize: 10, color: WP.yellow, letterSpacing: 0.05 },
  divider: { height: 1, backgroundColor: WP.border, marginBottom: 10 },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridLabel: { fontWeight: '800', fontSize: 10, letterSpacing: 0.1, textTransform: 'uppercase', color: WP.muted, marginBottom: 2 },
  gridValue: { fontWeight: '500', fontSize: 13, color: WP.white },

  // Verified state
  verifiedWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  verifiedBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0,200,150,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,150,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  verifiedTitle: {
    fontWeight: '800',
    fontSize: 18,
    color: WP.white,
    textAlign: 'center',
  },
  verifiedSub: {
    fontWeight: '500',
    fontSize: 13,
    color: WP.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: WP.blue,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 13,
    shadowColor: WP.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 4,
  },
  backBtnText: {
    fontWeight: '800',
    fontSize: 14,
    color: WP.white,
  },
});
