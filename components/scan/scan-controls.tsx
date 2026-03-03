import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { DesignTokens } from '@/constants/design-tokens';

interface ScanControlsProps {
  torchEnabled: boolean;
  onToggleTorch: () => void;
  onFlipCamera: () => void;
}

export function ScanControls({ torchEnabled, onToggleTorch, onFlipCamera }: ScanControlsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.controlBtn} onPress={onToggleTorch} activeOpacity={0.7}>
        <Ionicons
          name={torchEnabled ? 'flash' : 'flash-outline'}
          size={20}
          color={DesignTokens.colors.white}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.controlBtn} onPress={onFlipCamera} activeOpacity={0.7}>
        <Ionicons name="camera-reverse-outline" size={20} color={DesignTokens.colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 14,
  },
  controlBtn: {
    width: 46,
    height: 46,
    backgroundColor: DesignTokens.colors.scannerControlBg,
    borderWidth: 1,
    borderColor: DesignTokens.colors.scannerControlBorder,
    borderRadius: DesignTokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
