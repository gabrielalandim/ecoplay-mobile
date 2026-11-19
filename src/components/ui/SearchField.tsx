import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, fonts, radius, spacing, TOUCH_MIN } from '@/theme';

interface SearchFieldProps {
  valor: string;
  onChange: (texto: string) => void;
  placeholder: string;
}

export function SearchField({ valor, onChange, placeholder }: SearchFieldProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={colors.textMuted} />
      <TextInput
        value={valor}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#7C8A82"
        style={styles.input}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        autoCorrect={false}
      />
      {valor.length > 0 && (
        <Pressable
          onPress={() => onChange('')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
        >
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: TOUCH_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
});
