import { Alert, Platform } from 'react-native';

interface OpcoesConfirmacao {
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  destrutivo?: boolean;
}

/** Diálogo de confirmação nativo (Alert) com fallback para o navegador. */
export function pedirConfirmacao({
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  destrutivo = false,
}: OpcoesConfirmacao): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(globalThis.confirm?.(`${titulo}\n\n${mensagem}`) ?? false);
  }
  return new Promise((resolve) => {
    Alert.alert(
      titulo,
      mensagem,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        {
          text: textoConfirmar,
          style: destrutivo ? 'destructive' : 'default',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
