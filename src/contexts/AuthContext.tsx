import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { definirToken, registrarAoExpirarSessao } from '@/services/api';
import { authService, expiracaoDoToken } from '@/services/authService';
import { sessionStorage } from '@/services/storage';
import type { CadastroUsuarioRequest, Role, Usuario } from '@/types/api';

interface AuthContextValue {
  usuario: Usuario | null;
  carregandoSessao: boolean;
  /** Mensagem exibida na tela de login (ex.: sessão expirada). */
  avisoSessao: string | null;
  entrar: (email: string, senha: string, perfil: Role) => Promise<void>;
  cadastrar: (dados: CadastroUsuarioRequest) => Promise<void>;
  sair: (aviso?: string) => Promise<void>;
  limparAviso: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MENSAGEM_SESSAO_EXPIRADA = 'Sua sessão expirou. Entre novamente para continuar.';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [avisoSessao, setAvisoSessao] = useState<string | null>(null);
  const timerExpiracao = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limparTimer = () => {
    if (timerExpiracao.current) clearTimeout(timerExpiracao.current);
    timerExpiracao.current = null;
  };

  const sair = useCallback(async (aviso?: string) => {
    limparTimer();
    definirToken(null);
    await sessionStorage.limparSessao();
    setUsuario(null);
    setAvisoSessao(aviso ?? null);
  }, []);

  /** Agenda o logout automático para o momento em que o JWT expira. */
  const agendarExpiracao = useCallback(
    (token: string) => {
      limparTimer();
      const expiraEm = expiracaoDoToken(token);
      if (!expiraEm) return;
      const restante = expiraEm - Date.now();
      timerExpiracao.current = setTimeout(
        () => sair(MENSAGEM_SESSAO_EXPIRADA),
        Math.max(restante, 0),
      );
    },
    [sair],
  );

  const iniciarSessao = useCallback(
    async (token: string, dadosUsuario: Usuario) => {
      definirToken(token);
      await sessionStorage.salvarSessao(token, JSON.stringify(dadosUsuario));
      agendarExpiracao(token);
      setAvisoSessao(null);
      setUsuario(dadosUsuario);
    },
    [agendarExpiracao],
  );

  // Restaura a sessão salva no SecureStore ao abrir o app.
  useEffect(() => {
    async function restaurar() {
      try {
        const [token, usuarioJson] = await Promise.all([
          sessionStorage.lerToken(),
          sessionStorage.lerUsuario(),
        ]);
        if (!token || !usuarioJson) return;

        const expiraEm = expiracaoDoToken(token);
        if (!expiraEm || expiraEm <= Date.now()) {
          await sair(MENSAGEM_SESSAO_EXPIRADA);
          return;
        }
        definirToken(token);
        agendarExpiracao(token);
        setUsuario(JSON.parse(usuarioJson) as Usuario);
      } catch {
        await sair();
      } finally {
        setCarregandoSessao(false);
      }
    }
    restaurar();
    return limparTimer;
  }, [agendarExpiracao, sair]);

  // Qualquer 401 da API encerra a sessão.
  useEffect(() => {
    registrarAoExpirarSessao(() => sair(MENSAGEM_SESSAO_EXPIRADA));
    return () => registrarAoExpirarSessao(null);
  }, [sair]);

  const entrar = useCallback(
    async (email: string, senha: string, perfil: Role) => {
      const resposta = await authService.login({ email, senha });
      if (resposta.usuario.role !== perfil) {
        const perfilConta = resposta.usuario.role === 'COOPERATIVA' ? 'Cooperativa' : 'Cidadão';
        throw new Error(`Esta conta é de ${perfilConta}. Selecione o perfil correto para entrar.`);
      }
      await iniciarSessao(resposta.token, resposta.usuario);
    },
    [iniciarSessao],
  );

  /** Cadastra o cidadão e já faz o login com as mesmas credenciais. */
  const cadastrar = useCallback(
    async (dados: CadastroUsuarioRequest) => {
      await authService.cadastrar(dados);
      await entrar(dados.email, dados.senha, 'CIDADAO');
    },
    [entrar],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      carregandoSessao,
      avisoSessao,
      entrar,
      cadastrar,
      sair,
      limparAviso: () => setAvisoSessao(null),
    }),
    [usuario, carregandoSessao, avisoSessao, entrar, cadastrar, sair],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return contexto;
}

/** Atalho para telas protegidas, onde o usuário sempre existe. */
export function useUsuarioLogado(): Usuario {
  const { usuario } = useAuth();
  if (!usuario) throw new Error('Tela protegida acessada sem usuário logado.');
  return usuario;
}
