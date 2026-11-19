import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { SeletorData } from '@/components/entregas/SeletorData';
import {
  AppText,
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '@/components/ui';
import { CATEGORIAS, TIPOS_PONTO } from '@/constants/domain';
import { useNovaEntrega } from '@/hooks/useNovaEntrega';
import { colors, fonts, radius, spacing, TOUCH_MIN } from '@/theme';
import { formatarDataCurta, formatarPeso } from '@/utils/format';

export default function NovaEntregaScreen() {
  const params = useLocalSearchParams<{ pontoId?: string; materialId?: string }>();
  const {
    pontos,
    carregandoCatalogo,
    erroCatalogo,
    recarregarCatalogo,
    pontoId,
    ponto,
    data,
    setData,
    pesos,
    materiaisDoPonto,
    selecionados,
    pesoTotal,
    erro,
    enviando,
    escolherPonto,
    alternarMaterial,
    alterarPeso,
    agendar,
  } = useNovaEntrega(params);

  if (carregandoCatalogo && pontos.length === 0) {
    return (
      <Screen title="Agendar entrega" back>
        <LoadingState />
      </Screen>
    );
  }
  if (erroCatalogo && pontos.length === 0) {
    return (
      <Screen title="Agendar entrega" back>
        <ErrorState mensagem={erroCatalogo} onRetry={recarregarCatalogo} />
      </Screen>
    );
  }

  return (
    <Screen
      title="Agendar entrega"
      subtitle="Escolha onde, quando e o que você vai levar."
      back
      footer={
        <View style={styles.rodape}>
          {selecionados.length > 0 && data && (
            <AppText variant="caption" color={colors.textMuted} align="center">
              {selecionados.length} {selecionados.length === 1 ? 'material' : 'materiais'} ·{' '}
              {formatarPeso(pesoTotal)} · {formatarDataCurta(data)}
            </AppText>
          )}
          <Button
            title="Confirmar agendamento"
            icon="checkmark"
            onPress={agendar}
            loading={enviando}
          />
        </View>
      }
    >
      {erro && <Banner tipo="erro" mensagem={erro} />}

      <AppText variant="subtitle">1. Ponto de descarte</AppText>
      {pontos.length === 0 ? (
        <EmptyState icone="map-outline" titulo="Nenhum ponto disponível" />
      ) : (
        <View style={styles.opcoes}>
          {pontos.map((p) => {
            const selecionado = p.id === pontoId;
            return (
              <Pressable
                key={p.id}
                onPress={() => escolherPonto(p.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: selecionado }}
                accessibilityLabel={`${p.nome}, ${p.bairro}`}
                style={[styles.opcaoPonto, selecionado && styles.opcaoSelecionada]}
              >
                <Ionicons
                  name={TIPOS_PONTO[p.tipo].icone}
                  size={22}
                  color={selecionado ? colors.primary : colors.textMuted}
                />
                <View style={styles.flex}>
                  <AppText variant="bodyStrong">{p.nome}</AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    {p.bairro}
                    {p.horario ? ` · ${p.horario}` : ''}
                  </AppText>
                </View>
                <Ionicons
                  name={selecionado ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={selecionado ? colors.primary : colors.border}
                />
              </Pressable>
            );
          })}
        </View>
      )}

      <AppText variant="subtitle">2. Data prevista</AppText>
      <SeletorData valor={data} onChange={setData} />

      <AppText variant="subtitle">3. Materiais e peso aproximado</AppText>
      {!ponto ? (
        <Card>
          <AppText variant="body" color={colors.textMuted}>
            Escolha um ponto para ver os materiais que ele aceita.
          </AppText>
        </Card>
      ) : materiaisDoPonto.length === 0 ? (
        <Card>
          <AppText variant="body" color={colors.textMuted}>
            Este ponto ainda não informou os materiais aceitos.
          </AppText>
        </Card>
      ) : (
        <View style={styles.opcoes}>
          {materiaisDoPonto.map((material) => {
            const cat = CATEGORIAS[material.categoria];
            const ativo = material.id in pesos;
            return (
              <View key={material.id} style={[styles.material, ativo && styles.opcaoSelecionada]}>
                <Pressable
                  onPress={() => alternarMaterial(material.id)}
                  style={styles.materialTopo}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: ativo }}
                  accessibilityLabel={material.nome}
                >
                  <View style={[styles.bolinha, { backgroundColor: cat.cor }]}>
                    <Ionicons name={cat.icone} size={16} color={cat.corTexto} />
                  </View>
                  <AppText variant="bodyStrong" style={styles.flex}>
                    {material.nome}
                  </AppText>
                  <Ionicons
                    name={ativo ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={ativo ? colors.primary : colors.border}
                  />
                </Pressable>
                {ativo && (
                  <View style={styles.peso}>
                    <TextInput
                      value={pesos[material.id]}
                      onChangeText={(texto) => alterarPeso(material.id, texto)}
                      placeholder="0,0"
                      placeholderTextColor="#7C8A82"
                      keyboardType="decimal-pad"
                      style={styles.inputPeso}
                      accessibilityLabel={`Peso de ${material.nome} em quilos`}
                    />
                    <AppText variant="bodyStrong" color={colors.textMuted}>
                      kg
                    </AppText>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  rodape: {
    gap: spacing.sm,
  },
  opcoes: {
    gap: spacing.sm,
  },
  opcaoPonto: {
    minHeight: TOUCH_MIN + 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  opcaoSelecionada: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  flex: {
    flex: 1,
  },
  material: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  materialTopo: {
    minHeight: TOUCH_MIN + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  bolinha: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  inputPeso: {
    flex: 1,
    minWidth: 0,
    minHeight: TOUCH_MIN,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
    color: colors.text,
  },
});
