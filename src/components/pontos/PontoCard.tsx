import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components/ui';
import { CATEGORIAS, TIPOS_PONTO } from '@/constants/domain';
import { useCatalogo } from '@/contexts/CatalogoContext';
import { colors, radius, spacing } from '@/theme';
import type { PontoDescarte } from '@/types/api';

interface PontoCardProps {
  ponto: PontoDescarte;
  /** Ações exibidas no rodapé do card (botões). */
  acoes?: ReactNode;
  destaqueMaterialId?: number | null;
}

/** Abre o app de mapas do aparelho com o endereço do ponto. */
export function abrirNoMapa(ponto: PontoDescarte) {
  const endereco = encodeURIComponent(`${ponto.endereco}, ${ponto.bairro}`);
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?q=${endereco}`
      : `https://www.google.com/maps/search/?api=1&query=${endereco}`;
  Linking.openURL(url).catch(() => undefined);
}

export function PontoCard({ ponto, acoes, destaqueMaterialId }: PontoCardProps) {
  const { materialPorId } = useCatalogo();
  const tipo = TIPOS_PONTO[ponto.tipo];
  const aceitos = ponto.materiaisAceitosIds
    .map((id) => materialPorId(id))
    .filter((m): m is NonNullable<typeof m> => !!m);

  return (
    <Card style={styles.card}>
      <View style={styles.topo}>
        <View style={styles.icone}>
          <Ionicons name={tipo.icone} size={22} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <AppText variant="bodyStrong">{ponto.nome}</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {tipo.label} · {ponto.bairro}
          </AppText>
        </View>
      </View>

      <View style={styles.info}>
        <Ionicons name="location-outline" size={16} color={colors.textMuted} />
        <AppText variant="caption" style={styles.flex}>
          {ponto.endereco}
        </AppText>
      </View>
      <View style={styles.info}>
        <Ionicons name="time-outline" size={16} color={colors.textMuted} />
        <AppText variant="caption" style={styles.flex}>
          {ponto.horario || 'Horário não informado'}
        </AppText>
      </View>

      {aceitos.length > 0 && (
        <View style={styles.materiais}>
          {aceitos.map((material) => {
            const cat = CATEGORIAS[material.categoria];
            const destaque = material.id === destaqueMaterialId;
            return (
              <View
                key={material.id}
                style={[
                  styles.tag,
                  { borderColor: cat.cor },
                  destaque && { backgroundColor: cat.cor },
                ]}
              >
                <View
                  style={[styles.ponto, { backgroundColor: destaque ? cat.corTexto : cat.cor }]}
                />
                <AppText variant="caption" color={destaque ? cat.corTexto : colors.text}>
                  {material.nome}
                </AppText>
              </View>
            );
          })}
        </View>
      )}

      {acoes && <View style={styles.acoes}>{acoes}</View>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  icone: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  materiais: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  acoes: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
