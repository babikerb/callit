import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AVATARS, SECRET_AVATARS } from '@/constants/avatars';
import { getUnlockedAvatars, redeemCode, type Profile } from '@/services/identity';
import { NAME_MAX, validateName } from '@/services/profanity';
import { colors, palette, radius, spacing, type } from '@/theme/tokens';

type IdentityFormProps = {
  initial: Profile;
  submitLabel: string;
  busy?: boolean;
  onSubmit: (profile: Profile) => void;
};

/** Name field (moderated) + avatar picker with a redeem-code unlock. */
export function IdentityForm({ initial, submitLabel, busy, onSubmit }: IdentityFormProps) {
  const [name, setName] = useState(initial.name);
  const [avatarId, setAvatarId] = useState(initial.avatarId);
  const [touched, setTouched] = useState(false);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [redeemMsg, setRedeemMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    getUnlockedAvatars().then(setUnlocked);
  }, []);

  const avatars = useMemo(
    () => [...AVATARS, ...SECRET_AVATARS.filter((a) => unlocked.includes(a.id))],
    [unlocked],
  );

  const error = validateName(name);
  const showError = touched && !!error;

  const onRedeem = async () => {
    const id = await redeemCode(code);
    if (id) {
      setUnlocked((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setAvatarId(id);
      setRedeemMsg({ ok: true, text: 'Unlocked! Avatar selected.' });
      setCode('');
    } else {
      setRedeemMsg({ ok: false, text: 'Invalid code' });
    }
  };

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
          style={[type.body, inputStyle(showError)]}
        />
        {showError ? <Text style={[type.label, { color: palette.pink }]}>{error}</Text> : null}
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={[type.label, { color: colors.textMuted, textTransform: 'uppercase' }]}>Pick an avatar</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          {avatars.map((a) => {
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

      <View style={{ gap: spacing.sm }}>
        <Text style={[type.label, { color: colors.textMuted, textTransform: 'uppercase' }]}>Redeem a code</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TextInput
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            placeholder="Enter code"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            style={[type.body, inputStyle(false), { flex: 1 }]}
          />
          <Pressable
            onPress={onRedeem}
            disabled={!code}
            style={{
              paddingHorizontal: spacing.lg,
              justifyContent: 'center',
              borderRadius: radius.md,
              backgroundColor: colors.surfaceStrong,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: code ? 1 : 0.5,
            }}>
            <Text style={[type.body, { color: colors.text }]}>Redeem</Text>
          </Pressable>
        </View>
        {redeemMsg ? (
          <Text style={[type.label, { color: redeemMsg.ok ? palette.teal : palette.pink }]}>{redeemMsg.text}</Text>
        ) : null}
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

function inputStyle(error: boolean) {
  return {
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: error ? palette.pink : colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  };
}

export default IdentityForm;
