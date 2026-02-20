import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../src/services/supabase";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/(app)/dashboard");
      } else {
        router.replace("/(auth)/login");
      }
    });
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1a3c34" }}>
      <ActivityIndicator size="large" color="#c9a227" />
      <Text style={{ color: "#fff", marginTop: 16 }}>Loading...</Text>
    </View>
  );
}
