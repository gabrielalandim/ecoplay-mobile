import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { mensagemDeErro } from '@/services/api';
import type { Role } from '@/types/api';
import {
  validarConfirmacaoSenha,
  validarEmail,
  validarObrigatorio,
  validarSenhaCadastro,
} from '@/utils/validation';

export interface CamposCadastro {
  nome: string;
  email: string;
  bairro: string;
  senha: string;
  confirmacao: string;
}

type ErrosCadastro = Partial<Record<keyof CamposCadastro, string | null>>;

const CAMPOS_INICIAIS: CamposCadastro = {
  nome: '',
  email: '',
  bairro: '',
  senha: '',
  confirmacao: '',
};

/** Estado e regras do cadastro de cidadão: campos, validação e criação da conta. */
export function useCadastroForm() {
  const router = useRouter();
  const { cadastrar } = useAuth();

  const [perfil, setPerfil] = useState<Role>('CIDADAO');
  const [campos, setCampos] = useState<CamposCadastro>(CAMPOS_INICIAIS);
  const [erros, setErros] = useState<ErrosCadastro>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function alterar(campo: keyof CamposCadastro, valor: string) {
    setCampos((c) => ({ ...c, [campo]: valor }));
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: null }));
  }

  async function enviar() {
    const novosErros: ErrosCadastro = {
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

  return { perfil, setPerfil, campos, erros, erroGeral, enviando, alterar, enviar };
}
