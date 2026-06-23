import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { palette, sections } from '@/theme/tokens';

/**
 * Callit's three sections in the iOS-26 floating liquid-glass tab bar (the
 * system default). Clean and native; selected items tint to the brand purple.
 */
export default function AppTabs() {
  return (
    <NativeTabs tintColor={palette.purple}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{sections.home.label}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={sections.home.sf} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="create">
        <NativeTabs.Trigger.Label>{sections.create.label}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={sections.create.sf} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>{sections.profile.label}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={sections.profile.sf} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
