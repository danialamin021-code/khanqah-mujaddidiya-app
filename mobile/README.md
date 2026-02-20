# Khanqah Mujaddidiya — Mobile App

React Native + Expo mobile app. Connects to Supabase for auth and data.

## Setup

1. Copy `.env.example` to `.env` and add:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

2. Generate placeholder assets (if missing): `node scripts/generate-placeholder-assets.js`

3. Install: `npm install`

3. Run: `npx expo start`

## Structure

- `app/` — Expo Router screens
- `src/services/` — Supabase client, push registration
- `src/screens/` — Screen components (to be extended)
- `src/navigation/` — Navigation config (to be extended)
- `src/components/` — Reusable components

## Build for Production

- Android: `eas build --platform android --profile production`
- iOS: `eas build --platform ios --profile production`

## App Store Readiness

- App icon: `assets/icon.png`
- Splash: `assets/splash-icon.png`
- Privacy policy URL (add to app.json)
- Terms of service (add to app.json)
- Version in app.json
