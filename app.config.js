/**
 * Configuração dinâmica do Expo.
 *
 * O hash do commit é injetado no build para a tela "Sobre o App".
 * Ordem de prioridade:
 *   1. EAS_BUILD_GIT_COMMIT_HASH (definida automaticamente nos builds do EAS)
 *   2. git rev-parse HEAD (build local)
 *   3. "desconhecido"
 */
const { execSync } = require('child_process');

function obterHashDoCommit() {
  if (process.env.EAS_BUILD_GIT_COMMIT_HASH) {
    return process.env.EAS_BUILD_GIT_COMMIT_HASH;
  }
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'desconhecido';
  }
}

const VERDE_PRIMARIO = '#1E7A4C';

module.exports = {
  expo: {
    name: 'EcoPlay',
    slug: 'ecoplay-mobile',
    owner: 'gabilandim',
    scheme: 'ecoplay',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'light',
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'br.com.fiap.ecoplay',
      infoPlist: {
        NSCameraUsageDescription: 'O EcoPlay usa a câmera para identificar o tipo de resíduo.',
        NSPhotoLibraryUsageDescription:
          'O EcoPlay acessa suas fotos para identificar o tipo de resíduo.',
      },
    },
    android: {
      package: 'br.com.fiap.ecoplay',
      versionCode: 1,
      adaptiveIcon: {
        backgroundColor: VERDE_PRIMARIO,
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      permissions: ['android.permission.CAMERA'],
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      'expo-font',
      [
        'expo-image-picker',
        {
          cameraPermission: 'O EcoPlay usa a câmera para identificar o tipo de resíduo.',
          photosPermission: 'O EcoPlay acessa suas fotos para identificar o tipo de resíduo.',
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 160,
          backgroundColor: VERDE_PRIMARIO,
        },
      ],
    ],
    extra: {
      commitHash: obterHashDoCommit(),
      buildDate: new Date().toISOString(),
      eas: {
        projectId: 'ade9143d-1780-413c-af56-81481ccc8a47',
      },
    },
  },
};
