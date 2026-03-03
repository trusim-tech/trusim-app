import { CameraView, type BarcodeScanningResult } from 'expo-camera';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';

import { WP } from '@/constants/design-tokens';

const VIEWFINDER_SIZE = 200;
const CORNER_SIZE = 26;
const CORNER_WIDTH = 2.5;
const SCAN_LINE_PADDING = 8;

type CameraFacing = 'front' | 'back';

interface ScanViewfinderProps {
  facing: CameraFacing;
  torchEnabled: boolean;
  onBarcodeScanned: (result: BarcodeScanningResult) => void;
}

export function ScanViewfinder({ facing, torchEnabled, onBarcodeScanned }: ScanViewfinderProps) {
  const { width: screenWidth } = useWindowDimensions();
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ]),
    ).start();
  }, [scanAnim]);

  const scanLineTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCAN_LINE_PADDING, VIEWFINDER_SIZE - SCAN_LINE_PADDING - 3],
  });

  return (
    <View style={[styles.cameraContainer, { width: screenWidth, height: screenWidth }]}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        enableTorch={torchEnabled}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onBarcodeScanned}
      />

      {/* dot grid overlay */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* glow circle */}
        <View style={styles.glowCircle} />
      </View>

      {/* Scanner corners + scanline */}
      <View style={styles.viewfinder}>
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />
        <Animated.View
          style={[styles.scanLine, { transform: [{ translateY: scanLineTranslateY }] }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#050e22',
  },
  glowCircle: {
    position: 'absolute',
    top: '50%', left: '50%',
    marginTop: -120, marginLeft: -120,
    width: 240, height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(14,86,187,0.06)',
  },
  viewfinder: {
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_SIZE,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: WP.cyan,
    borderStyle: 'solid',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderBottomRightRadius: 4,
  },
  scanLine: {
    position: 'absolute',
    left: SCAN_LINE_PADDING,
    right: SCAN_LINE_PADDING,
    height: 1.5,
    backgroundColor: WP.cyan,
    borderRadius: 9999,
    top: 0,
    shadowColor: WP.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
});
