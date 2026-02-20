/**
 * Expo config. Loads EXPO_PUBLIC_* from .env
 */
module.exports = {
  expo: {
    name: "Khanqah Mujaddidiya",
    slug: "khanqah-mujaddidiya",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "khanqah",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#1a3c34",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.khanqah.mujaddidiya",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1a3c34",
      },
      package: "com.khanqah.mujaddidiya",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#1a3c34",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
};
