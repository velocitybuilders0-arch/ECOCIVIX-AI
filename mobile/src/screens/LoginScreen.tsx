import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import { signIn, signUp, isSupabaseConfigured } from "../services/auth";

interface LoginScreenProps {
  onAuthenticated: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      Alert.alert(
        "Configuration Error",
        "Supabase is not configured. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to mobile/.env and restart Expo.",
        [{ text: "OK" }]
      );
    }
  }, []);

  const handleSubmit = async () => {
    if (!email.trim() || password.length < 6 || (creatingAccount && (!fullName.trim() || password !== confirmPassword))) {
      Alert.alert(
        "Invalid details",
        creatingAccount
          ? "Enter your name, a valid email, a password with at least 6 characters, and matching passwords."
          : "Enter a valid email and a password with at least 6 characters."
      );
      return;
    }

    setSubmitting(true);
    const result = creatingAccount
      ? await signUp(email.trim(), password, fullName.trim())
      : await signIn(email.trim(), password);
    setSubmitting(false);

    if (result.error) {
      Alert.alert(creatingAccount ? "Account creation failed" : "Sign in failed", result.error.message);
      return;
    }

    if (creatingAccount && !result.data.session) {
      Alert.alert("Check your email", "Confirm your email address, then sign in.");
      setCreatingAccount(false);
      return;
    }

    onAuthenticated();
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.brandMark}>
            <Ionicons name="shield-checkmark" size={30} color={Colors.primary} />
          </View>
          <Text style={styles.title}>ECOCIVIX AI</Text>
            <Text style={styles.subtitle}>{creatingAccount ? "Create your citizen account to report and track issues." : "Sign in to report and track your civic issues."}</Text>

            {creatingAccount && (
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
              />
            )}
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {creatingAccount && (
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          )}

          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color={Colors.textInverse} /> : <Text style={styles.primaryButtonText}>{creatingAccount ? "Create account" : "Sign in"}</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCreatingAccount((value) => !value)} disabled={submitting}>
            <Text style={styles.switchText}>{creatingAccount ? "Already have an account? Sign in" : "New here? Create an account"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 32 },
  container: { width: "100%" },
  brandMark: { alignSelf: "center", backgroundColor: "rgba(16, 185, 129, 0.15)", borderRadius: 20, padding: 18, marginBottom: 18 },
  title: { textAlign: "center", color: Colors.textPrimary, fontSize: 30, fontWeight: "900", marginBottom: 8 },
  subtitle: { textAlign: "center", color: Colors.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 28 },
  input: { backgroundColor: Colors.card, borderColor: Colors.border, borderWidth: 1, borderRadius: 12, color: Colors.textPrimary, fontSize: 15, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 12 },
  primaryButton: { alignItems: "center", backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 15, marginTop: 8, marginBottom: 18 },
  primaryButtonText: { color: Colors.textInverse, fontSize: 16, fontWeight: "800" },
  switchText: { color: Colors.secondary, textAlign: "center", fontSize: 14, fontWeight: "700" },
});
