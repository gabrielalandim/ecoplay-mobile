import { Tabs } from 'expo-router/js-tabs';

import { tabBarOptions, tabIcon } from '@/components/navigation/tabBarOptions';

export default function CidadaoTabsLayout() {
  return (
    <Tabs screenOptions={tabBarOptions}>
      <Tabs.Screen
        name="inicio"
        options={{ title: 'Início', tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="identificar"
        options={{ title: 'Identificar', tabBarIcon: tabIcon('camera', 'camera-outline') }}
      />
      <Tabs.Screen
        name="entregas"
        options={{ title: 'Entregas', tabBarIcon: tabIcon('cube', 'cube-outline') }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: tabIcon('person', 'person-outline') }}
      />
    </Tabs>
  );
}
