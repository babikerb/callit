import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AVATARS } from '@/constants/avatars';
import { type Profile } from '@/services/identity';
import { NAME_MAX, validateName } from '@/services/profanity';
import { colors, palette, radius, spacing, type } from '@/theme/tokens';

type IdentityFormProps = {
  initial: Profile;
  submitLabel: string;
  busy?: boolean;
  onSubmit: (profile: Profile) => void;
};

/** Name field (moderated) + Kahoot-style avatar picker. */
export function IdentityForm({ initial, submitLabel, busy, onSubmit }: IdentityFormProps) {
  const [name, setName] = useState(initial.name);
  const [avatarId, setAvatarId] = useState(initial.avatarId);
  const [touched, setTouched] = useState(false);

  const error = validateName(name);
  const showError = touched && !!error;

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.sm }}>
        <Text style={[type.label, { color: colors.textMuted, textTransform: 'uppercase' }]}>Your name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          onBlur={() => setTouched(true)}
          placeholder="Type a name"
          placeholderTextColor={colors.textMuted}
          maxLength={NAME_MAX}
          autoCapitalize="words"
          style={[
            type.body,
            {
              color: colors.text,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: showError ? palette.pink : colors.border,
              borderRadius: radius.md,
              paddingHorizontal: spacing.md,
              paddingVertical: 14,
            },
          ]}
        />
        {showError ? <Text style={[type.label, { color: palette.pink }]}>{error}</Text> : null}
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={[type.label, { color: colors.textMuted, textTransform: 'uppercase' }]}>Pick an avatar</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          {AVATARS.map((a) => {
            const selected = a.id === avatarId;
            return (
              <Pressable
                key={a.id}
                onPress={() => setAvatarId(a.id)}
                style={{
                  borderRadius: radius.pill,
                  padding: 3,
                  borderWidth: 3,
                  borderColor: selected ? colors.text : 'transparent',
                }}>
                <Avatar id={a.id} size={52} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button
        label={submitLabel}
        color={palette.pink}
        disabled={busy || !!error}
        style={{ opacity: busy || error ? 0.5 : 1 }}
        onPress={() => {
          setTouched(true);
          if (!error) onSubmit({ name: name.trim(), avatarId });
        }}
      />
    </View>
  );
}

export default IdentityForm;
