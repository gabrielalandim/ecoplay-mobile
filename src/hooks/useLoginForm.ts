import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { mensagemDeErro } from '@/services/api';
import type { Role } from '@/types/api';
import { validarEmail, validarSenhaLogin } from '@/utils/validation';

interface ErrosLogin {
  email?: string | null;
  senha?: string | null;
}

/** Estado e regras do formulário de login: validação, envio e redirecionamento. */
export function useLoginForm() {
  const router = useRouter();
  const { entrar, avisoSessao, limparAviso } = useAuth();

  const [perfil, setPerfil] = useState<Role>('CIDADAO');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<ErrosLogin>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function alterarEmail(texto: string) {
    setEmail(texto);
    if (erros.email) setErros((e) => ({ ...e, email: null }));
  }

  function alterarSenha(texto: string) {
    setSenha(texto);
    if (erros.senha) setErros((e) => ({ ...e, senha: null }));
  }

  async function enviar() {
    const novosErros = { email: validarEmail(email), senha: validarSenhaLogin(senha) };
    setErros(novosErros);
    setErroGeral(null);
    if (novosErros.email || novosErros.senha) return;

    setEnviando(true);
    limparAviso();
    try {
      await entrar(email, senha, perfil);
      router.replace('/');
    } catch (e) {
      setErroGeral(mensagemDeErro(e, 'E-mail ou senha inválidos.'));
    } finally {
      setEnviando(false);
    }
  }

  return {
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
  };
}
