import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";

interface OnboardingScreenProps {
  onStart: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onStart }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Brand Hero */}
        <View style={styles.heroSection}>
          <View style={styles.badgeWrapper}>
            <View style={styles.pulseDot} />
            <Text style={styles.badgeText}>ECOCIVIX AI 1.0 • TEAM VELOCITY</Text>
          </View>

          <Text style={styles.appName}>
            ECOCIVIX <Text style={styles.accentText}>AI</Text>
          </Text>
          <Text style={styles.tagline}>
            Safer. Smarter. More Sustainable Communities.
          </Text>
          <Text style={styles.description}>
            AI-powered civic issue reporting with trained DistilBERT priority classification,
            environmental hazard detection, and automated municipality triage.
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresSection}>
          <View style={styles.featureCard}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
              <Ionicons name="hardware-chip-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Fine-Tuned ML Classifier</Text>
              <Text style={styles.featureDesc}>
                DistilBERT neural model trained to classify issues into Low, Medium, High, & Critical priorities.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(6, 182, 212, 0.15)" }]}>
              <Ionicons name="leaf-outline" size={24} color={Colors.secondary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Eco & Safety Risk Intel</Text>
              <Text style={styles.featureDesc}>
                Multimodal reasoning maps environmental hazards and safety urgency to municipal departments.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(99, 102, 241, 0.15)" }]}>
              <Ionicons name="git-network-outline" size={24} color={Colors.accent} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Live Municipal Ops Center</Text>
              <Text style={styles.featureDesc}>
                Real-time issue tracking from submission to field dispatch and resolution with full audit trail.
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={onStart} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Launch Civic Portal</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.textInverse} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
          <Text style={styles.subNote}>Powered by Google DeepMind ML + Supabase PostgreSQL</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "flex-start",
    marginBottom: 32,
  },
  badgeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  appName: {
    fontSize: 38,
    fontWeight: "900",
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginBottom: 8,
  },
  accentText: {
    color: Colors.primary,
  },
  tagline: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.secondary,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  featuresSection: {
    marginBottom: 36,
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "flex-start",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  ctaSection: {
    alignItems: "center",
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textInverse,
    letterSpacing: 0.3,
  },
  subNote: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 14,
    textAlign: "center",
  },
});
