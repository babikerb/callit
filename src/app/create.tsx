import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { CategoryTile } from '@/components/ui/category-tile';
import { Screen } from '@/components/ui/screen';
import { CATEGORIES } from '@/constants/categories';
import { palette, spacing } from '@/theme/tokens';

export default function CreateScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const [selected, setSelected] = useState<string | undefined>(params.category);

  return (
    <Screen section="create" headline="Start a Call." subtitle="Choose a category, then rally the group.">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        {CATEGORIES.map((category) => (
          <CategoryTile
            key={category.key}
            category={category}
            selected={selected === category.key}
            onPress={() => setSelected(category.key)}
          />
        ))}
      </View>

      <Button label="Create Call" color={palette.orange} disabled={!selected} style={{ opacity: selected ? 1 : 0.4 }} />
    </Screen>
  );
}
