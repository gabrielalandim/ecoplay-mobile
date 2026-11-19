import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PerfilSelector } from '@/components/PerfilSelector';
import { AppText, Banner, Button, Card, Screen, TextField } from '@/components/ui';
import { useCadastroForm } from '@/hooks/useCadastroForm';
import { colors, spacing } from '@/theme';

export default function CadastroScreen() {
  const router = useRouter();
  const { perfil, setPerfil, campos, erros, erroGeral, enviando, alterar, enviar } =
    useCadastroForm();

  return (
    <Screen title="Criar conta" subtitle="Leva menos de um minuto." back>
      <View style={styles.bloco}>
        <AppText variant="label" color={colors.textMuted}>
          QUERO ME CADASTRAR COMO
        </AppText>
        <PerfilSelector valor={perfil} onChange={setPerfil} />
      </View>

      {perfil === 'COOPERATIVA' ? (
        <Card style={styles.cardCooperativa}>
          <AppText variant="subtitle">Cooperativas são cadastradas pela equipe</AppText>
          <AppText variant="body" color={colors.textMuted}>
            Para garantir que só cooperativas reais recebam entregas, o acesso é criado pela equipe
            EcoPlay depois de validar os dados da organização. Você receberá um e-mail com login e
            senha.
          </AppText>
          <Button title="Já tenho acesso" variant="outline" onPress={() => router.back()} />
        </Card>
      ) : (
        <>
          {erroGeral && <Banner tipo="erro" mensagem={erroGeral} />}
          <TextField
            label="Nome completo"
            icon="person-outline"
            placeholder="Como devemos te chamar?"
            autoComplete="name"
            value={campos.nome}
            onChangeText={(v) => alterar('nome', v)}
            error={erros.nome}
          />
          <TextField
            label="E-mail"
            icon="mail-outline"
            placeholder="voce@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={campos.email}
            onChangeText={(v) => alterar('email', v)}
            error={erros.email}
          />
          <TextField
            label="Bairro (opcional)"
            icon="location-outline"
            placeholder="Ex.: Centro"
            value={campos.bairro}
            onChangeText={(v) => alterar('bairro', v)}
            hint="Usamos para sugerir pontos de descarte perto de você."
          />
          <TextField
            label="Senha"
            icon="lock-closed-outline"
            placeholder="Mínimo de 8 caracteres"
            password
            autoComplete="new-password"
            value={campos.senha}
            onChangeText={(v) => alterar('senha', v)}
            error={erros.senha}
          />
          <TextField
            label="Confirmar senha"
            icon="lock-closed-outline"
            placeholder="Repita a senha"
            password
            autoComplete="new-password"
            value={campos.confirmacao}
            onChangeText={(v) => alterar('confirmacao', v)}
            onSubmitEditing={enviar}
            error={erros.confirmacao}
          />
          <Button title="Criar minha conta" onPress={enviar} loading={enviando} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bloco: {
    gap: spacing.sm,
  },
  cardCooperativa: {
    gap: spacing.md,
  },
});
