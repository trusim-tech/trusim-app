import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WP } from '@/constants/design-tokens';

const SCREEN_H = Dimensions.get('window').height;
const SNAP_HIDDEN = 0;
const SNAP_SMALL = 190;
const SNAP_LARGE = SCREEN_H * 0.52;

/** Returns a random coordinate offset for a given distance in metres, at a random bearing. */
function randomOffsetCoord(
  lat: number,
  lon: number,
  metres: number,
): { latitude: number; longitude: number } {
  const bearing = Math.random() * 2 * Math.PI;
  const dLat = (metres / 111320) * Math.cos(bearing);
  const dLon = (metres / (111320 * Math.cos((lat * Math.PI) / 180))) * Math.sin(bearing);
  return { latitude: lat + dLat, longitude: lon + dLon };
}

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);

  // Worker coords derived once when location is known
  const workerCoords = useMemo(() => {
    if (!region) return null;
    return {
      jm: randomOffsetCoord(region.latitude, region.longitude, 10),
      cv: randomOffsetCoord(region.latitude, region.longitude, 50),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region?.latitude, region?.longitude]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      });
    })();
  }, []);

  const centerOnUser = () => {
    if (region && mapRef.current) mapRef.current.animateToRegion(region, 600);
  };

  // -- Bottom sheet animation --
  const sheetH = useRef(new Animated.Value(SNAP_SMALL)).current;
  const lastH = useRef(SNAP_SMALL);
  const [hidden, setHidden] = useState(false);

  const snapTo = (target: number) => {
    lastH.current = target;
    Animated.spring(sheetH, { toValue: target, useNativeDriver: false, bounciness: 4 }).start(() => {
      if (target === SNAP_HIDDEN) setHidden(true);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        sheetH.stopAnimation();
      },
      onPanResponderMove: (_, { dy }) => {
        const next = Math.max(0, lastH.current - dy);
        sheetH.setValue(Math.min(next, SNAP_LARGE + 40));
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        const cur = lastH.current - dy;
        if (vy > 1.5 || dy > 80) {
          if (cur < SNAP_SMALL * 0.6) snapTo(SNAP_HIDDEN);
          else snapTo(SNAP_SMALL);
        } else if (vy < -1.5 || dy < -80) {
          snapTo(SNAP_LARGE);
        } else {
          const dSmall = Math.abs(cur - SNAP_SMALL);
          const dLarge = Math.abs(cur - SNAP_LARGE);
          const dHidden = Math.abs(cur - SNAP_HIDDEN);
          const min = Math.min(dSmall, dLarge, dHidden);
          if (min === dHidden && cur < SNAP_SMALL * 0.4) snapTo(SNAP_HIDDEN);
          else if (min === dSmall || cur < (SNAP_SMALL + SNAP_LARGE) / 2) snapTo(SNAP_SMALL);
          else snapTo(SNAP_LARGE);
        }
      },
    }),
  ).current;

  const showSheet = () => {
    setHidden(false);
    snapTo(SNAP_SMALL);
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        customMapStyle={darkMapStyle}
        showsUserLocation
        showsMyLocationButton={false}
        region={region ?? { latitude: 41.3851, longitude: 2.1734, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
      >
        {region && (
          <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }}>
            <View style={styles.userDotWrap}>
              <View style={styles.userDot} />
            </View>
          </Marker>
        )}
        {workerCoords && (
          <>
            <Marker coordinate={workerCoords.jm}>
              <View style={[styles.workerPin, { backgroundColor: '#7c3aed' }]}>
                <Text style={styles.workerPinText}>JM</Text>
              </View>
            </Marker>
            <Marker coordinate={workerCoords.cv}>
              <View style={[styles.workerPin, { backgroundColor: '#b45309' }]}>
                <Text style={styles.workerPinText}>CV</Text>
              </View>
            </Marker>
          </>
        )}
      </MapView>

      {/* Map controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapCtrlBtn} onPress={centerOnUser} activeOpacity={0.7}>
          <MaterialIcons name="my-location" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* Show-sheet FAB (when hidden) */}
      {hidden && (
        <TouchableOpacity style={styles.showSheetBtn} onPress={showSheet} activeOpacity={0.85}>
          <MaterialIcons name="people" size={18} color="white" />
          <Text style={styles.showSheetText}>Colleagues</Text>
        </TouchableOpacity>
      )}

      {/* Top nav */}
      <SafeAreaView style={styles.topOverlay} edges={['top']} pointerEvents="box-none">
        <View style={styles.topOverlayInner}>
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} activeOpacity={0.7}>
              <MaterialIcons name="chevron-left" size={20} color="white" />
            </TouchableOpacity>
            <View style={styles.searchBar}>
              <MaterialIcons name="location-on" size={13} color={WP.blue7} />
              <Text style={styles.searchText}>Mi ubicacion en tiempo real</Text>
            </View>
            <View style={styles.iconBtn}>
              <MaterialIcons name="wifi" size={18} color="white" />
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom sheet */}
      {!hidden && (
        <Animated.View style={[styles.sheet, { height: sheetH }]}>
          {/* Drag handle */}
          <View style={styles.handleArea} {...panResponder.panHandlers}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeaderRow}>
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetTitle}>Sede Central</Text>
                  <Text style={styles.sheetSub}>Nave 3 - Linea B</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={styles.badgeInZone}>
                    <View style={styles.dotGreen} />
                    <Text style={styles.badgeInZoneText}>EN ZONA</Text>
                  </View>
                  <Text style={[styles.mono, styles.distLabel]}>18m - 09:44 AM</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.hideBtn} onPress={() => snapTo(SNAP_HIDDEN)} activeOpacity={0.7}>
                <MaterialIcons name="keyboard-arrow-down" size={20} color={WP.gray} />
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            <Text style={styles.lbl}>Companeros en turno</Text>
          </View>

          <ScrollView style={{ flex: 1, marginTop: 7 }} showsVerticalScrollIndicator={false}>
            {WORKERS.map((w) => (
              <WorkerRow key={w.name} worker={w} />
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const WORKERS = [
  { initials: 'AG', name: 'Ana Garcia', suffix: ' - Tu', line: 'Linea B', dist: '18m', status: 'in' as const, color: WP.blue },
  { initials: 'JM', name: 'Joan Martinez', suffix: '', line: 'Linea B', dist: '10m', status: 'in' as const, color: '#7c3aed' },
  { initials: 'CV', name: 'Carlos Vega', suffix: '', line: 'Linea A', dist: '50m', status: 'edge' as const, color: '#b45309' },
];

function WorkerRow({ worker }: { worker: typeof WORKERS[number] }) {
  const isEdge = worker.status === 'edge';
  return (
    <View style={styles.workerRow}>
      <View style={[styles.workerAvatar, { backgroundColor: worker.color }]}>
        <Text style={styles.workerInitials}>{worker.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.workerName}>
          {worker.name}
          {worker.suffix ? <Text style={styles.workerSuffix}>{worker.suffix}</Text> : null}
        </Text>
        <Text style={styles.workerLine}>{worker.line}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        {isEdge ? (
          <View style={styles.badgeEdge}>
            <View style={styles.dotYellow} />
            <Text style={styles.badgeEdgeText}>Borde</Text>
          </View>
        ) : (
          <View style={styles.badgeInZone}>
            <View style={styles.dotGreen} />
            <Text style={styles.badgeInZoneText}>En zona</Text>
          </View>
        )}
        <Text style={[styles.mono, styles.distLabel]}>{worker.dist}</Text>
      </View>
    </View>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0b1535' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1535' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7eb5ff' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2a4a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0e1e36' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#060d24' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1a6bff' }] },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WP.bg2 },

  userDotWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(26,107,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  userDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: WP.bright,
    borderWidth: 3, borderColor: 'white',
  },
  workerPin: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'white',
  },
  workerPinText: { fontWeight: '800', fontSize: 10, color: 'white' },

  mapControls: { position: 'absolute', right: 14, bottom: '47%', zIndex: 10 },
  mapCtrlBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(6,13,36,0.92)',
    borderWidth: 1, borderColor: WP.border,
    alignItems: 'center', justifyContent: 'center',
  },

  showSheetBtn: {
    position: 'absolute', bottom: 30, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: WP.blue,
    paddingHorizontal: 18, paddingVertical: 11,
    borderRadius: 22,
    shadowColor: WP.dark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 10,
    elevation: 8, zIndex: 20,
  },
  showSheetText: { fontWeight: '800', fontSize: 13, color: 'white' },

  topOverlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 },
  topOverlayInner: {
    paddingHorizontal: 20, paddingBottom: 14,
    backgroundColor: 'rgba(6,13,36,0.85)',
  },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: WP.card, borderWidth: 1, borderColor: WP.border,
    alignItems: 'center', justifyContent: 'center',
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: WP.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  searchText: { fontWeight: '500', fontSize: 13, color: WP.gray },

  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: WP.bg2,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    borderTopWidth: 1, borderColor: WP.border,
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 20,
    overflow: 'hidden',
  },
  handleArea: { paddingTop: 14 },
  sheetHandle: { width: 30, height: 3, borderRadius: 2, backgroundColor: WP.border, alignSelf: 'center', marginBottom: 13 },
  sheetHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  sheetHeader: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 11 },
  sheetTitle: { fontWeight: '800', fontSize: 14, color: WP.white },
  sheetSub: { fontWeight: '500', fontSize: 11, color: WP.gray, marginTop: 1 },
  hideBtn: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: WP.card, borderWidth: 1, borderColor: WP.border,
    alignItems: 'center', justifyContent: 'center',
    marginTop: -2,
  },
  divider: { height: 1, backgroundColor: WP.border, marginBottom: 11 },
  lbl: { fontWeight: '800', fontSize: 10, letterSpacing: 0.1, textTransform: 'uppercase', color: WP.muted },

  workerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 9,
    padding: 8, paddingHorizontal: 11,
    backgroundColor: WP.card, borderWidth: 1, borderColor: WP.border,
    borderRadius: 10, marginBottom: 5,
  },
  workerAvatar: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  workerInitials: { fontWeight: '800', fontSize: 10, color: 'white' },
  workerName: { fontWeight: '800', fontSize: 12, color: WP.white },
  workerSuffix: { fontWeight: '500', fontSize: 10, color: WP.gray },
  workerLine: { fontWeight: '500', fontSize: 10, color: WP.gray },

  badgeInZone: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
    backgroundColor: 'rgba(0,200,150,0.12)', borderWidth: 1, borderColor: 'rgba(0,200,150,0.28)',
  },
  badgeInZoneText: { fontWeight: '800', fontSize: 9, color: WP.green },
  dotGreen: { width: 6, height: 6, borderRadius: 3, backgroundColor: WP.green },
  distLabel: { fontSize: 9, color: WP.muted, marginTop: 2 },
  mono: { fontFamily: 'monospace' },
  badgeEdge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
    backgroundColor: 'rgba(255,184,0,0.10)', borderWidth: 1, borderColor: 'rgba(255,184,0,0.25)',
  },
  badgeEdgeText: { fontWeight: '800', fontSize: 9, color: WP.yellow },
  dotYellow: { width: 6, height: 6, borderRadius: 3, backgroundColor: WP.yellow },
});
