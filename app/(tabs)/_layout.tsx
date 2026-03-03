import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WP } from '@/constants/design-tokens';

type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<string, { options: { tabBarIcon?: (p: { focused: boolean }) => React.ReactNode; title?: string } }>;
  navigation: { emit: (e: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean }; navigate: (name: string) => void };
};

const TAB_CONFIG: Record<string, { icon: React.ComponentProps<typeof MaterialIcons>['name']; label: string }> = {
  explore:  { icon: 'qr-code-scanner', label: 'ESCANEAR' },
  user:     { icon: 'person',          label: 'PERFIL'   },
  info:     { icon: 'history',         label: 'HISTORIAL' },
};

function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'transparent', paddingBottom: Math.max(insets.bottom, 8), paddingHorizontal: 16, paddingTop: 8 }}>
      <View style={styles.bar}>
        {state.routes
          .filter((route) => route.name in TAB_CONFIG)
          .map((route) => {
          const index = state.routes.indexOf(route);
          const focused = state.index === index;
          const cfg = TAB_CONFIG[route.name];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              activeOpacity={0.75}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
            >
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <MaterialIcons
                  name={cfg.icon}
                  size={26}
                  color={focused ? WP.bright : WP.muted}
                />
              </View>
              <Text style={[styles.label, focused && styles.labelActive]}>
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: WP.bg2,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: WP.border,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  iconWrap: {
    width: 52,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(26,107,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(26,107,255,0.30)',
    borderRadius: 19,
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: WP.muted,
  },
  labelActive: {
    color: WP.bright,
  },
});

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...(props as unknown as TabBarProps)} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0 },
      }}>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="user" />
      <Tabs.Screen name="info" />
    </Tabs>
  );
}
