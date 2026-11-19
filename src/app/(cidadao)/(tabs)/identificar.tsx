import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

import { GuiaPreparo } from '@/components/materiais/GuiaPreparo';
import { SeletorMaterial } from '@/components/materiais/SeletorMaterial';
import { AppText, Banner, Button, Card, CategoriaBadge, Screen } from '@/components/ui';
import { CATEGORIAS, CONFIANCA_MINIMA } from '@/constants/domain';
import { useIdentificacao } from '@/hooks/useIdentificacao';
import { colors, radius, spacing } from '@/theme';
import type { Material } from '@/types/api';
import { formatarPercentual } from '@/utils/format';

export default function IdentificarScreen() {
  const router = useRouter();
  const ident = useIdentificacao();
  const [correcao, setCorrecao] = useState<Material | null>(null);

  const material = ident.materialFinal;
  const classificacao = ident.resultado?.classificacao;
  const baixaConfianca = !!classificacao && classificacao.confianca < CONFIANCA_MINIMA;

  function irParaPontos() {
    router.push(material ? `/pontos?materialId=${material.id}` : '/pontos');
  }

  return (
    <Screen
      title={ident.etapa === 'corrigindo' ? 'Qual é o material?' : 'Identificar resíduo'}
      subtitle={
        ident.etapa === 'inicio' ? 'A IA reconhece o material e ensina como descartar.' : undefined
      }
    >
      {ident.modoSimulado && ident.etapa === 'inicio' && (
        <Banner
          tipo="info"
          mensagem="Modo demonstração: a classificação é simulada até o serviço de IA ser integrado ao backend."
        />
      )}
      {ident.erro && <Banner tipo="erro" mensagem={ident.erro} />}
      {ident.aviso && <Banner tipo="aviso" mensagem={ident.aviso} />}

      {ident.resultado && ident.etapa !== 'inicio' && (
        <Image
          source={{ uri: ident.resultado.imagemUri }}
          style={styles.foto}
          accessibilityLabel="Foto do resíduo"
        />
      )}

      {ident.etapa === 'inicio' && (
        <>
          <Card style={styles.cardCamera}>
            <View style={styles.iconeGrande}>
              <Ionicons name="scan-outline" size={44} color={colors.primary} />
            </View>
            <AppText variant="subtitle" align="center">
              Fotografe o resíduo
            </AppText>
            <AppText variant="caption" color={colors.textMuted} align="center">
              Use boa luz e deixe só um objeto na foto para um resultado mais preciso.
            </AppText>
            <Button
              title="Tirar foto"
              icon="camera"
              onPress={() => ident.escolherImagem('camera')}
              style={styles.largura}
            />
            <Button
              title="Escolher da galeria"
              icon="images-outline"
              variant="outline"
              onPress={() => ident.escolherImagem('galeria')}
              style={styles.largura}
            />
          </Card>
          <Button
            title="Ver todos os materiais"
            icon="file-tray-stacked-outline"
            variant="ghost"
            onPress={() => router.push('/materiais')}
          />
        </>
      )}

      {ident.etapa === 'analisando' && (
        <Card style={styles.analisando}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText variant="bodyStrong">Analisando a imagem...</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            Isso leva só alguns segundos.
          </AppText>
        </Card>
      )}

      {ident.etapa === 'resultado' && material && classificacao && (
        <>
          <Card style={styles.card}>
            {baixaConfianca ? (
              <>
                <AppText variant="label" color={colors.warning}>
                  NÃO TENHO CERTEZA
                </AppText>
                <AppText variant="title">É {material.nome.toLowerCase()}?</AppText>
              </>
            ) : (
              <AppText variant="title">{material.nome}</AppText>
            )}
            <View style={styles.linha}>
              <CategoriaBadge categoria={material.categoria} />
              <AppText variant="captionStrong" color={colors.textMuted}>
                Confiança {formatarPercentual(classificacao.confianca)}
              </AppText>
            </View>
            {!material.reciclavel && (
              <Banner tipo="aviso" mensagem="Este material não é reciclável." />
            )}
          </Card>

          <Card style={styles.card}>
            <AppText variant="subtitle">Como preparar</AppText>
            <GuiaPreparo categoria={material.categoria} comoPreparar={material.comoPreparar} />
          </Card>

          <Button
            title={
              baixaConfianca
                ? `Sim, é ${CATEGORIAS[material.categoria].label.toLowerCase()}`
                : 'Confirmar identificação'
            }
            icon="checkmark"
            onPress={ident.confirmar}
            loading={ident.salvando}
          />
          <Button
            title="Não é isso? Corrigir"
            icon="create-outline"
            variant="outline"
            onPress={ident.abrirCorrecao}
          />
        </>
      )}

      {ident.etapa === 'corrigindo' && (
        <>
          <AppText variant="body" color={colors.textMuted}>
            Sua correção ajuda a IA a acertar da próxima vez.
          </AppText>
          <SeletorMaterial
            materiais={ident.materiais}
            selecionadoId={correcao?.id}
            onSelecionar={setCorrecao}
          />
          <Button
            title="Salvar correção"
            icon="checkmark"
            disabled={!correcao}
            loading={ident.salvando}
            onPress={() => correcao && ident.corrigir(correcao)}
          />
          <Button title="Cancelar" variant="ghost" onPress={ident.voltarAoResultado} />
        </>
      )}

      {ident.etapa === 'concluido' && material && (
        <>
          <Card style={[styles.card, styles.sucesso]}>
            <Ionicons name="checkmark-circle" size={40} color={colors.primary} />
            <AppText variant="subtitle">Boa! Agora é {material.nome.toLowerCase()}.</AppText>
            <AppText variant="body" color={colors.textMuted}>
              Separe e leve a um ponto que aceite{' '}
              {CATEGORIAS[material.categoria].label.toLowerCase()}.
            </AppText>
            <GuiaPreparo categoria={material.categoria} comoPreparar={material.comoPreparar} />
          </Card>
          <Button title="Onde levar" icon="location-outline" onPress={irParaPontos} />
          <Button
            title="Agendar entrega"
            icon="calendar-outline"
            variant="secondary"
            onPress={() => router.push(`/entrega/nova?materialId=${material.id}`)}
          />
          <Button
            title="Identificar outro resíduo"
            icon="camera-outline"
            variant="ghost"
            onPress={() => {
              setCorrecao(null);
              ident.reiniciar();
            }}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardCamera: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  iconeGrande: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largura: {
    alignSelf: 'stretch',
  },
  foto: {
    width: '100%',
    aspectRatio: 1.4,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
  },
  analisando: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  card: {
    gap: spacing.md,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  sucesso: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
  },
});
