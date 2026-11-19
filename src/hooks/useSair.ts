import { useAuth } from '@/contexts/AuthContext';
import { pedirConfirmacao } from '@/utils/dialog';

/** Logout com confirmação: limpa o token do SecureStore e bloqueia as rotas protegidas. */
export function useSair() {
  const { sair } = useAuth();
  return async () => {
    const confirmado = await pedirConfirmacao({
      titulo: 'Sair da conta?',
      mensagem: 'Você precisará entrar novamente para usar o EcoPlay.',
      textoConfirmar: 'Sair',
      destrutivo: true,
    });
    if (confirmado) await sair();
  };
}
