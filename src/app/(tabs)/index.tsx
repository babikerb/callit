import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { CategoryTile } from '@/components/ui/category-tile';
import { Screen } from '@/components/ui/screen';
import { CATEGORIES } from '@/constants/categories';
import { getProfile } from '@/services/identity';
import { colors, spacing, type } from '@/theme/tokens';

export default function HomeScreen() {
  const onJoin = async () => {
    const profile = await getProfile();
    router.push(profile ? '/join' : { pathname: '/setup', params: { redirect: 'join' } });
  };

  return (
    <Screen section="home" headline="What are we deciding?" subtitle="Pick a category to start a Call.">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        {CATEGORIES.map((category) => (
          <CategoryTile
            key={category.key}
            category={category}
            onPress={() => router.push({ pathname: '/create', params: { category: category.key } })}
          />
        ))}
      </View>

      <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
        <Text style={[type.label, { color: colors.textMuted, textTransform: 'uppercase' }]}>
          Got a code from a friend?
        </Text>
        <Button label="Join a Call" variant="glass" onPress={onJoin} />
      </View>
    </Screen>
  );
}
