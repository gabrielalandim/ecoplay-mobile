import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { useUsuarioLogado } from '@/contexts/AuthContext';
import { useCatalogo } from '@/contexts/CatalogoContext';
import { mensagemDeErro } from '@/services/api';
import { pontoDescarteService } from '@/services/pontoDescarteService';
import { colors, spacing } from '@/theme';
import type { TipoPonto } from '@/types/api';
import { validarObrigatorio } from '@/utils/validation';

interface Campos {
  nome: string;
  tipo: TipoPonto;
  endereco: string;
  bairro: string;
  horario: string;
  materiais: number[];
}

type Erros = Partial<Record<'nome' | 'endereco' | 'bairro' | 'materiais', string | null>>;

const VAZIO: Campos = {
  nome: '',
  tipo: 'COOPERATIVA',
  endereco: '',
  bairro: '',
  horario: '',
  materiais: [],
};

/** Cadastro e edição de ponto de descarte (POST/PUT /api/pontos-descarte). */
export default function PontoFormScreen() {
  const router = useRouter();
  const usuario = useUsuarioLogado();
  const { materiais, recarregar: recarregarCatalogo } = useCatalogo();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const pontoId = id ? Number(id) : null;

  const [campos, setCampos] = useState<Campos>(VAZIO);
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(!!pontoId);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!pontoId) return;
    let ativo = true;
    pontoDescarteService
      .buscarPorId(pontoId)
      .then((ponto) => {
        if (!ativo) return;
        setCampos({
          nome: ponto.nome,
          tipo: ponto.tipo,
          endereco: ponto.endereco,
          bairro: ponto.bairro,
          horario: ponto.horario ?? '',
          materiais: ponto.materiaisAceitosIds,
        });
      })
      .catch((e) => ativo && setErroGeral(mensagemDeErro(e)))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [pontoId]);

  function alterar<K extends keyof Campos>(campo: K, valor: Campos[K]) {
    setCampos((c) => ({ ...c, [campo]: valor }));
    if (campo in erros) setErros((e) => ({ ...e, [campo]: null }));
  }

  function alternarMaterial(materialId: number) {
    alterar(
      'materiais',
      campos.materiais.includes(materialId)
        ? campos.materiais.filter((m) => m !== materialId)
        : [...campos.materiais, materialId],
    );
  }

  async function handleSalvar() {
    const novosErros: Erros = {
      nome: validarObrigatorio(campos.nome, 'o nome do ponto'),
      endereco: validarObrigatorio(campos.endereco, 'o endereço'),
      bairro: validarObrigatorio(campos.bairro, 'o bairro'),
      materiais: campos.materiais.length === 0 ? 'Selecione ao menos um material aceito.' : null,
    };
    setErros(novosErros);
    setErroGeral(null);
    if (Object.values(novosErros).some(Boolean)) return;

    const dados = {
      nome: campos.nome.trim(),
      tipo: campos.tipo,
      endereco: campos.endereco.trim(),
      bairro: campos.bairro.trim(),
      horario: campos.horario.trim() || undefined,
      cooperativaId: usuario.id,
      materiaisAceitosIds: campos.materiais,
    };

    setSalvando(true);
    try {
      if (pontoId) await pontoDescarteService.atualizar(pontoId, dados);
      else await pontoDescarteService.cadastrar(dados);
      await recarregarCatalogo();
      router.back();
    } catch (e) {
      setErroGeral(mensagemDeErro(e, 'Não foi possível salvar o ponto.'));
    } finally {
      setSalvando(false);
    }
  }

  const titulo = pontoId ? 'Editar ponto' : 'Novo ponto';

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
          title={pontoId ? 'Salvar alterações' : 'Cadastrar ponto'}
          icon="checkmark"
          loading={salvando}
          onPress={handleSalvar}
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
