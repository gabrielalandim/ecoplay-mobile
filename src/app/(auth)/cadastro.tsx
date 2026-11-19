import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PerfilSelector } from '@/components/PerfilSelector';
import { AppText, Banner, Button, Card, Screen, TextField } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { mensagemDeErro } from '@/services/api';
import { colors, spacing } from '@/theme';
import type { Role } from '@/types/api';
import {
  validarConfirmacaoSenha,
  validarEmail,
  validarObrigatorio,
  validarSenhaCadastro,
} from '@/utils/validation';

interface Campos {
  nome: string;
  email: string;
  bairro: string;
  senha: string;
  confirmacao: string;
}

type Erros = Partial<Record<keyof Campos, string | null>>;

export default function CadastroScreen() {
  const router = useRouter();
  const { cadastrar } = useAuth();

  const [perfil, setPerfil] = useState<Role>('CIDADAO');
  const [campos, setCampos] = useState<Campos>({
    nome: '',
    email: '',
    bairro: '',
    senha: '',
    confirmacao: '',
  });
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function alterar(campo: keyof Campos, valor: string) {
    setCampos((c) => ({ ...c, [campo]: valor }));
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: null }));
  }

  async function handleCadastrar() {
    const novosErros: Erros = {
      nome: validarObrigatorio(campos.nome, 'seu nome'),
      email: validarEmail(campos.email),
      senha: validarSenhaCadastro(campos.senha),
      confirmacao: validarConfirmacaoSenha(campos.senha, campos.confirmacao),
    };
    setErros(novosErros);
    setErroGeral(null);
    if (Object.values(novosErros).some(Boolean)) return;

    setEnviando(true);
    try {
      await cadastrar({
        nome: campos.nome,
        email: campos.email,
        senha: campos.senha,
        bairro: campos.bairro,
        role: 'CIDADAO',
      });
      router.replace('/');
    } catch (e) {
      setErroGeral(mensagemDeErro(e, 'Não foi possível criar sua conta.'));
    } finally {
      setEnviando(false);
    }
  }

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
            onSubmitEditing={handleCadastrar}
            error={erros.confirmacao}
          />
          <Button title="Criar minha conta" onPress={handleCadastrar} loading={enviando} />
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
