import { Redirect } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';

/** Decide a tela inicial conforme a sessão e o perfil do usuário. */
export default function Index() {
  const { usuario } = useAuth();

  if (!usuario) return <Redirect href="/login" />;
  if (usuario.role === 'COOPERATIVA') return <Redirect href="/recebidas" />;
  return <Redirect href="/inicio" />;
}
