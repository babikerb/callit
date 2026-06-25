import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { avatarPngUrl } from '@/constants/avatars';
import { useProfileStore } from '@/stores/profile';
import { palette, sections } from '@/theme/tokens';

/**
 * Callit's three sections in the iOS-26 floating liquid-glass tab bar.
 * The Profile tab icon is the user's selected avatar (updates reactively).
 * width/height on the source pins the render size so it matches the SF icons.
 */
export default function AppTabs() {
  const avatarId = useProfileStore((s) => s.profile?.avatarId);

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
        {avatarId ? (
          <NativeTabs.Trigger.Icon
            src={{ uri: avatarPngUrl(avatarId), width: 30, height: 30, scale: 3 }}
            renderingMode="original"
          />
        ) : (
          <NativeTabs.Trigger.Icon sf={sections.profile.sf} />
        )}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
