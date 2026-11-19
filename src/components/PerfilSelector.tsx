import { SegmentedControl } from './ui';
import type { Role } from '@/types/api';

interface PerfilSelectorProps {
  valor: Role;
  onChange: (perfil: Role) => void;
}

/** Seleção do perfil de acesso: Cidadão ou Cooperativa. */
export function PerfilSelector({ valor, onChange }: PerfilSelectorProps) {
  return (
    <SegmentedControl<Role>
      accessibilityLabel="Selecione seu perfil"
      valor={valor}
      onChange={onChange}
      opcoes={[
        { valor: 'CIDADAO', label: 'Cidadão', icone: 'person-outline' },
        { valor: 'COOPERATIVA', label: 'Cooperativa', icone: 'people-outline' },
      ]}
    />
  );
}
