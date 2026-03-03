import * as LocalAuthentication from 'expo-local-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Circle, Path, Rect, Svg } from 'react-native-svg';

import { WP } from '@/constants/design-tokens';

const GRAD = [WP.gradStart, WP.gradEnd] as const;

export default function RegisterScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    if (phone.replace(/\s/g, '').length < 9) {
      Alert.alert('Numero invalido', 'Introduce un numero de telefono valido.');
      return;
    }

    setLoading(true);
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!compatible || !enrolled) {
        Alert.alert(
          'Biometria no disponible',
          'Este dispositivo no tiene autenticacion biometrica configurada.',
        );
        setLoading(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirma tu identidad para continuar',
        fallbackLabel: 'Usar PIN',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      if (result.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Autenticacion fallida', 'No se pudo verificar tu identidad.');
      }
    } catch {
      Alert.alert('Error', 'Ocurrio un error durante la autenticacion.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* -- Badge -- */}
          <View style={styles.hero}>
            <View style={styles.badge}>
              <ShieldSvg />
              <Text style={styles.badgeText}>TruSim Check-in</Text>
            </View>

            {/* -- Logo placeholder -- */}
            <View style={styles.logo}>
              <ImageSvg />
              <Text style={styles.logoLabel}>LOGO</Text>
            </View>

            {/* -- Slogan -- */}
            <Text style={styles.headline}>Siempre presente</Text>
            <Text style={styles.sub}>
              Autenticacion segura a nivel de red.{'\n'}Sin contrasenas. Sin fricciones.
            </Text>
          </View>

          {/* -- Card -- */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Numero de telefono</Text>

            {/* -- Phone row -- */}
            <View style={styles.phoneRow}>
              <View style={styles.flagBox}>
                <Text style={styles.flag}>ES</Text>
                <Text style={styles.prefix}>+34</Text>
                <ChevronSvg />
              </View>
              <TextInput
                style={styles.input}
                placeholder="600 000 000"
                placeholderTextColor={WP.muted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                selectionColor={WP.bright}
              />
            </View>

            {/* -- CTA -- */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleVerify}
              disabled={loading}
              style={styles.btnWrap}
            >
              <LinearGradient
                colors={GRAD}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.btn}
              >
                <Text style={styles.btnText}>
                  {loading ? 'Verificando...' : 'Verificar numero'}
                </Text>
                {!loading && <ArrowSvg />}
              </LinearGradient>
            </TouchableOpacity>

            {/* -- Feature checks -- */}
            <View style={styles.checks}>
              <CheckRow label="Security" title="Verificacion segura" />
              <CheckRow label="Network" title="Autenticacion a nivel de red" />
              <CheckRow label="Protection" title="Anti-fraude con SIM Swap" />
            </View>
          </View>

          {/* -- T&C -- */}
          <View style={styles.tc}>
            <Text style={styles.tcText}>
              Al continuar aceptas nuestros terminos de servicio{'\n'}y politica de tratamiento de datos.
            </Text>
            <Text style={styles.tcLink}>Politica de privacidad y terminos</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// --- Small SVG components ---

function CheckRow({ label, title }: { label: string; title: string }) {
  return (
    <View style={styles.checkRow}>
      <View style={styles.checkIcon}>
        <CheckSvg />
      </View>
      <View>
        <Text style={styles.checkLabel}>{label}</Text>
        <Text style={styles.checkTitle}>{title}</Text>
      </View>
    </View>
  );
}

function ShieldSvg() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        stroke={WP.blue7}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ImageSvg() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={3} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
      <Circle cx={8.5} cy={8.5} r={1.5} fill="rgba(255,255,255,0.35)" />
      <Path d="M21 15l-5-5L5 21" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronSvg() {
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke="rgba(255,255,255,0.4)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ArrowSvg() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckSvg() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17l-5-5" stroke={WP.green} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#04091a',
  },
  scroll: {
    padding: 22,
    paddingTop: 48,
    paddingBottom: 40,
    gap: 24,
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 0,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 30,
    backgroundColor: 'rgba(14,86,187,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(14,86,187,0.35)',
    marginBottom: 22,
  },
  badgeText: {
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1,
    color: WP.blue7,
    textTransform: 'uppercase',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginBottom: 18,
  },
  logoLabel: {
    fontWeight: '800',
    fontSize: 8,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
  },
  headline: {
    fontWeight: '800',
    fontSize: 32,
    color: WP.white,
    lineHeight: 36,
    letterSpacing: -0.6,
    marginBottom: 8,
    textAlign: 'center',
  },
  sub: {
    fontWeight: '500',
    fontSize: 13,
    color: WP.gray,
    lineHeight: 19,
    textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: '#091f45',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 22,
    padding: 20,
    gap: 0,
  },
  inputLabel: {
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: WP.muted,
    marginBottom: 10,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  flagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: WP.border,
    borderRadius: 12,
  },
  flag: { fontSize: 17, color: WP.white, fontWeight: '800' },
  prefix: { fontWeight: '800', fontSize: 13, color: WP.white },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: WP.border,
    borderRadius: 12,
    color: WP.white,
    fontWeight: '500',
    fontSize: 15,
    paddingHorizontal: 14,
    fontVariant: ['tabular-nums'],
  },

  // Button
  btnWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#00187c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  btn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnText: {
    color: WP.white,
    fontWeight: '800',
    fontSize: 15,
  },

  // Checks
  checks: { gap: 12 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,200,150,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,150,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkLabel: {
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: WP.muted,
    marginBottom: 1,
  },
  checkTitle: {
    fontWeight: '800',
    fontSize: 13,
    color: WP.white,
  },

  // T&C
  tc: {
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 6,
  },
  tcText: {
    fontWeight: '500',
    fontSize: 11,
    color: WP.muted,
    lineHeight: 17,
    textAlign: 'center',
  },
  tcLink: {
    fontWeight: '800',
    fontSize: 10,
    color: WP.blue,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
