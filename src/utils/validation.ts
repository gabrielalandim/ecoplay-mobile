/** Validações de formulário alinhadas ao Bean Validation da API Java. */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarEmail(email: string): string | null {
  if (!email.trim()) return 'Informe seu e-mail.';
  if (!EMAIL_REGEX.test(email.trim())) return 'E-mail inválido.';
  return null;
}

export function validarSenhaLogin(senha: string): string | null {
  if (!senha) return 'Informe sua senha.';
  return null;
}

export function validarSenhaCadastro(senha: string): string | null {
  if (!senha) return 'Crie uma senha.';
  if (senha.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
  return null;
}

export function validarConfirmacaoSenha(senha: string, confirmacao: string): string | null {
  if (!confirmacao) return 'Confirme sua senha.';
  if (senha !== confirmacao) return 'As senhas não conferem.';
  return null;
}

export function validarObrigatorio(valor: string, campo: string): string | null {
  if (!valor.trim()) return `Informe ${campo}.`;
  return null;
}

/** Aceita "1,5" ou "1.5". Retorna o número ou null se inválido. */
export function parsePeso(valor: string): number | null {
  const numero = Number(valor.replace(',', '.'));
  if (!Number.isFinite(numero) || numero <= 0) return null;
  return Math.round(numero * 100) / 100;
}
