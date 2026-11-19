import { Tabs } from 'expo-router/js-tabs';

import { tabBarOptions, tabIcon } from '@/components/navigation/tabBarOptions';
import { colors } from '@/theme';

export default function CooperativaTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        ...tabBarOptions,
        tabBarActiveTintColor: colors.primaryDark,
      }}
    >
      <Tabs.Screen
        name="recebidas"
        options={{
          title: 'Entregas',
          tabBarIcon: tabIcon('file-tray-full', 'file-tray-full-outline'),
        }}
      />
      <Tabs.Screen
        name="meus-pontos"
        options={{ title: 'Meus pontos', tabBarIcon: tabIcon('location', 'location-outline') }}
      />
      <Tabs.Screen
        name="conta"
        options={{ title: 'Conta', tabBarIcon: tabIcon('business', 'business-outline') }}
      />
    </Tabs>
  );
}
