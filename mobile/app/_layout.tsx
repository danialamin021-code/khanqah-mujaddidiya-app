import { Stack } from "expo-router";
import { useEffect } from "react";
import { supabase } from "../src/services/supabase";
import { registerForPushNotifications } from "../src/services/push";

export default function RootLayout() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        registerForPushNotifications(session.user.id).catch(() => {});
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}
