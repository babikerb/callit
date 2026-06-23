import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, sections, spacing, type, type SectionKey } from '@/theme/tokens';

type ScreenProps = {
  section: SectionKey;
  /** Big headline under the section name. */
  headline: string;
  subtitle?: string;
  children?: React.ReactNode;
};

/**
 * Consistent screen scaffold: one dark base everywhere, a small accent-colored
 * section label, a bold headline, and a scroll area (no scrollbars). Pages
 * differ by content + accent — not by background color.
 */
export function Screen({ section, headline, subtitle, children }: ScreenProps) {
  const s = sections[section];
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 140, gap: spacing.lg }}>
          <View style={{ gap: spacing.xs }}>
            <Text style={[type.label, { color: s.accent, textTransform: 'uppercase' }]}>{s.label}</Text>
            <Text style={[type.display, { color: colors.text }]}>{headline}</Text>
            {subtitle ? <Text style={[type.body, { color: colors.textMuted }]}>{subtitle}</Text> : null}
          </View>
          {children}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export default Screen;
