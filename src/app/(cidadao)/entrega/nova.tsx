import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { useUsuarioLogado } from '@/contexts/AuthContext';
import { useCatalogo } from '@/contexts/CatalogoContext';
import { mensagemDeErro } from '@/services/api';
import { entregaService } from '@/services/entregaService';
import { colors, fonts, radius, spacing, TOUCH_MIN } from '@/theme';
import { formatarDataCurta, formatarPeso, hojeIso } from '@/utils/format';
import { parsePeso } from '@/utils/validation';

export default function NovaEntregaScreen() {
  const router = useRouter();
  const usuario = useUsuarioLogado();
  const params = useLocalSearchParams<{ pontoId?: string; materialId?: string }>();
  const { pontos, materialPorId, carregando, erro: erroCatalogo, recarregar } = useCatalogo();

  const [pontoId, setPontoId] = useState<number | null>(
    params.pontoId ? Number(params.pontoId) : null,
  );
  const [data, setData] = useState<string | null>(hojeIso());
  /** materialId -> peso digitado (texto) */
  const [pesos, setPesos] = useState<Record<number, string>>(
    params.materialId ? { [Number(params.materialId)]: '' } : {},
  );
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const ponto = pontos.find((p) => p.id === pontoId);
  const materiaisDoPonto = useMemo(
    () =>
      (ponto?.materiaisAceitosIds ?? [])
        .map((id) => materialPorId(id))
        .filter((m): m is NonNullable<typeof m> => !!m),
    [ponto, materialPorId],
  );

  const selecionados = Object.keys(pesos)
    .map(Number)
    .filter((id) => materiaisDoPonto.some((m) => m.id === id));
  const pesoTotal = selecionados.reduce((total, id) => total + (parsePeso(pesos[id]) ?? 0), 0);

  function alternarMaterial(id: number) {
    setErro(null);
    setPesos((atual) => {
      const copia = { ...atual };
      if (id in copia) delete copia[id];
      else copia[id] = '';
      return copia;
    });
  }

  async function handleAgendar() {
    setErro(null);
    if (!pontoId) return setErro('Escolha o ponto de descarte.');
    if (!data) return setErro('Escolha a data da entrega.');
    if (selecionados.length === 0) return setErro('Selecione pelo menos um material.');

    const itens = selecionados.map((id) => ({ materialId: id, pesoKg: parsePeso(pesos[id]) }));
    const semPeso = itens.find((i) => i.pesoKg === null);
    if (semPeso) {
      const nome = materialPorId(semPeso.materialId)?.nome ?? 'o material';
      return setErro(`Informe um peso válido para ${nome.toLowerCase()} (ex.: 1,5).`);
    }

    setEnviando(true);
    try {
      const entrega = await entregaService.agendar(usuario.id, {
        pontoId,
        dataPrevista: data,
        itens: itens.map((i) => ({ materialId: i.materialId, pesoKg: i.pesoKg as number })),
      });
      router.replace(`/entrega/${entrega.id}?criada=1`);
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível agendar a entrega.'));
    } finally {
      setEnviando(false);
    }
  }

  if (carregando && pontos.length === 0) {
    return (
      <Screen title="Agendar entrega" back>
        <LoadingState />
      </Screen>
    );
  }
  if (erroCatalogo && pontos.length === 0) {
    return (
      <Screen title="Agendar entrega" back>
        <ErrorState mensagem={erroCatalogo} onRetry={recarregar} />
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
            onPress={handleAgendar}
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
                onPress={() => {
                  setPontoId(p.id);
                  setErro(null);
                }}
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
                      onChangeText={(texto) =>
                        setPesos((atual) => ({ ...atual, [material.id]: texto }))
                      }
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
