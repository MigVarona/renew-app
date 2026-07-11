import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Renew } from '@/constants/renew-theme';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={Renew.paper}
      indicatorColor={Renew.mist}
      labelStyle={{ selected: { color: Renew.sage } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
