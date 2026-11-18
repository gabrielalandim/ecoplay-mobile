import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps, type ComponentRef, type Ref } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from './AppText';
import { colors, fonts, radius, spacing, TOUCH_MIN } from '@/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  icon?: ComponentProps<typeof Ionicons>['name'];
  /** Exibe o botão de mostrar/ocultar senha. */
  password?: boolean;
  hint?: string;
  ref?: Ref<ComponentRef<typeof TextInput>>;
}

export function TextField({
  label,
  error,
  icon,
  password = false,
  hint,
  style,
  ref,
  ...props
}: TextFieldProps) {
  const [focado, setFocado] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const corBorda = error ? colors.danger : focado ? colors.primary : colors.border;

  return (
    <View style={styles.container}>
      <AppText variant="label" color={colors.textMuted}>
        {label.toUpperCase()}
      </AppText>
      <View style={[styles.campo, { borderColor: corBorda }, focado && styles.campoFocado]}>
        {icon && <Ionicons name={icon} size={20} color={colors.textMuted} />}
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor="#7C8A82"
          secureTextEntry={password && !senhaVisivel}
          accessibilityLabel={label}
          onFocus={(e) => {
            setFocado(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {password && (
          <Pressable
            onPress={() => setSenhaVisivel((v) => !v)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Ionicons
              name={senhaVisivel ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>
      {error ? (
        <View style={styles.linhaErro} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle" size={16} color={colors.danger} />
          <AppText variant="caption" color={colors.danger}>
            {error}
          </AppText>
        </View>
      ) : hint ? (
        <AppText variant="caption" color={colors.textMuted}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs + 2,
  },
  campo: {
    minHeight: TOUCH_MIN + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1.5,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  campoFocado: {
    backgroundColor: '#FBFDF9',
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  linhaErro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
