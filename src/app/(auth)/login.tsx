import { Link } from 'expo-router';
import { useRef, type ComponentRef } from 'react';
import { StyleSheet, View, type TextInput } from 'react-native';

import { Logo } from '@/components/Logo';
import { PerfilSelector } from '@/components/PerfilSelector';
import { AppText, Banner, Button, Screen, TextField } from '@/components/ui';
import { useLoginForm } from '@/hooks/useLoginForm';
import { colors, spacing } from '@/theme';

export default function LoginScreen() {
  const senhaRef = useRef<ComponentRef<typeof TextInput>>(null);
  const {
    perfil,
    setPerfil,
    email,
    senha,
    erros,
    erroGeral,
    avisoSessao,
    enviando,
    alterarEmail,
    alterarSenha,
    enviar,
  } = useLoginForm();

  return (
    <Screen>
      <View style={styles.topo}>
        <Logo tamanho={64} />
        <AppText variant="subtitle" color={colors.primary}>
          Descarte certo vira ponto.
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          Aprenda a separar, descubra onde levar e ajude as cooperativas da sua cidade.
        </AppText>
      </View>

      <View style={styles.bloco}>
        <AppText variant="label" color={colors.textMuted}>
          ENTRAR COMO
        </AppText>
        <PerfilSelector valor={perfil} onChange={setPerfil} />
      </View>

      {avisoSessao && <Banner tipo="aviso" mensagem={avisoSessao} />}
      {erroGeral && <Banner tipo="erro" mensagem={erroGeral} />}

      <TextField
        label="E-mail"
        icon="mail-outline"
        placeholder="voce@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        value={email}
        onChangeText={alterarEmail}
        onSubmitEditing={() => senhaRef.current?.focus()}
        error={erros.email}
      />
      <TextField
        ref={senhaRef}
        label="Senha"
        icon="lock-closed-outline"
        placeholder="Sua senha"
        password
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        value={senha}
        onChangeText={alterarSenha}
        onSubmitEditing={enviar}
        error={erros.senha}
      />

      <Button title="Entrar" onPress={enviar} loading={enviando} />

      {perfil === 'CIDADAO' ? (
        <View style={styles.linha}>
          <AppText variant="caption" color={colors.textMuted}>
            Ainda não tem conta?
          </AppText>
          <Link href="/cadastro" asChild>
            <AppText variant="captionStrong" color={colors.primary} style={styles.link}>
              Criar conta
            </AppText>
          </Link>
        </View>
      ) : (
        <Banner
          tipo="info"
          mensagem="Cooperativa parceira? Use o acesso enviado pela equipe EcoPlay."
        />
      )}

      <Link href="/sobre" asChild>
        <AppText variant="caption" color={colors.textMuted} align="center" style={styles.link}>
          Sobre o App
        </AppText>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topo: {
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  bloco: {
    gap: spacing.sm,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  link: {
    paddingVertical: spacing.md,
  },
});
