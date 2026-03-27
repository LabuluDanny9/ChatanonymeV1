import type { CapacitorConfig } from '@capacitor/cli';

const liveUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.chatanonyme.app',
  appName: 'ChatAnonyme',
  webDir: 'build',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: '#2563eb',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
  ...(liveUrl
    ? {
        // Mode "live wrapper": l'app mobile charge directement la version Vercel.
        // Cela garantit que la version mobile reflète exactement la version en ligne.
        server: {
          url: liveUrl,
          cleartext: false,
        },
      }
    : {}),
};

export default config;
