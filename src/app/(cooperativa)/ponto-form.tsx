import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  Banner,
  Button,
  Chip,
  LoadingState,
  Screen,
  SegmentedControl,
  TextField,
} from '@/components/ui';
import { CATEGORIAS, TIPOS_PONTO } from '@/constants/domain';
import { useCatalogo } from '@/contexts/CatalogoContext';
import { usePontoForm } from '@/hooks/usePontoForm';
import { colors, spacing } from '@/theme';
import type { TipoPonto } from '@/types/api';

/** Cadastro e edição de ponto de descarte. */
export default function PontoFormScreen() {
  const { materiais } = useCatalogo();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const {
    editando,
    campos,
    erros,
    erroGeral,
    carregando,
    salvando,
    alterar,
    alternarMaterial,
    salvar,
  } = usePontoForm(id ? Number(id) : null);

  const titulo = editando ? 'Editar ponto' : 'Novo ponto';

  if (carregando) {
    return (
      <Screen title={titulo} back>
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen
      title={titulo}
      subtitle="Essas informações aparecem para os cidadãos."
      back
      footer={
        <Button
          title={editando ? 'Salvar alterações' : 'Cadastrar ponto'}
          icon="checkmark"
          loading={salvando}
          onPress={salvar}
        />
      }
    >
      {erroGeral && <Banner tipo="erro" mensagem={erroGeral} />}

      <TextField
        label="Nome do ponto"
        icon="business-outline"
        placeholder="Ex.: Cooperativa Recicla Centro"
        value={campos.nome}
        onChangeText={(v) => alterar('nome', v)}
        error={erros.nome}
      />

      <View style={styles.bloco}>
        <AppText variant="label" color={colors.textMuted}>
          TIPO
        </AppText>
        <SegmentedControl<TipoPonto>
          valor={campos.tipo}
          onChange={(v) => alterar('tipo', v)}
          opcoes={(Object.keys(TIPOS_PONTO) as TipoPonto[]).map((t) => ({
            valor: t,
            label: TIPOS_PONTO[t].label,
          }))}
        />
      </View>

      <TextField
        label="Endereço"
        icon="location-outline"
        placeholder="Rua, número"
        value={campos.endereco}
        onChangeText={(v) => alterar('endereco', v)}
        error={erros.endereco}
      />
      <TextField
        label="Bairro"
        icon="map-outline"
        placeholder="Ex.: Centro"
        value={campos.bairro}
        onChangeText={(v) => alterar('bairro', v)}
        error={erros.bairro}
      />
      <TextField
        label="Horário de funcionamento"
        icon="time-outline"
        placeholder="Ex.: seg–sáb, 8h–17h"
        value={campos.horario}
        onChangeText={(v) => alterar('horario', v)}
      />

      <View style={styles.bloco}>
        <AppText variant="label" color={colors.textMuted}>
          MATERIAIS ACEITOS
        </AppText>
        <View style={styles.materiais}>
          {materiais.map((m) => (
            <Chip
              key={m.id}
              label={m.nome}
              selected={campos.materiais.includes(m.id)}
              color={CATEGORIAS[m.categoria].cor}
              textColor={CATEGORIAS[m.categoria].corTexto}
              icon={campos.materiais.includes(m.id) ? 'checkmark' : undefined}
              onPress={() => alternarMaterial(m.id)}
            />
          ))}
        </View>
        {erros.materiais && <Banner tipo="erro" mensagem={erros.materiais} />}
        {materiais.length === 0 && (
          <Banner tipo="aviso" mensagem="Nenhum material cadastrado na API ainda." />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bloco: {
    gap: spacing.sm,
  },
  materiais: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
