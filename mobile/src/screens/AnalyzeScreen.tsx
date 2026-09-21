import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import { Header } from "../components/Header";
import { PriorityBadge } from "../components/Badge";
import { DualAIAnalysisResult } from "../types";
import { submitIssueApi } from "../services/api";

interface AnalyzeScreenProps {
  analysis: DualAIAnalysisResult;
  formData: { title: string; description: string; location: string; imageUri?: string };
  onBack: () => void;
  onSubmitSuccess: (newIssueId: string) => void;
}

export const AnalyzeScreen: React.FC<AnalyzeScreenProps> = ({
  analysis,
  formData,
  onBack,
  onSubmitSuccess,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const issue = await submitIssueApi({
        title: formData.title,
        description: formData.description,
        locationContext: formData.location,
        imageUrl: formData.imageUri,
        mlPriority: analysis.priority,
        mlConfidence: analysis.confidence,
        mlModelVersion: analysis.modelVersion,
        aiAnalysis: analysis.aiAnalysis,
      });

      Alert.alert(
        "Issue Submitted!",
        `Your report #${issue.id.slice(0, 8)} has been routed with ${analysis.priority} priority.`,
        [{ text: "View Details", onPress: () => onSubmitSuccess(issue.id) }]
      );
    } catch (err: any) {
      Alert.alert("Submission Error", err.message || "Failed to persist issue.");
    } finally {
      setSubmitting(false);
    }
  };

  const confidencePct = Math.round(analysis.confidence * 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="AI Triage Review"
        subtitle="Dual Model Intelligence Validation"
        showBack
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {analysis.isFallback && (
          <View style={styles.fallbackBanner}>
            <Ionicons name="warning-outline" size={18} color={Colors.medium} style={{ marginRight: 8 }} />
            <Text style={styles.fallbackBannerText}>
              Offline demo mode — priority simulated locally. Trained model not contacted.
            </Text>
          </View>
        )}

        {/* ML Priority Gauge Card */}
        <View style={styles.mlGaugeCard}>
          <View style={styles.badgeRow}>
            <View style={styles.modelTag}>
              <Ionicons name="hardware-chip-outline" size={13} color={Colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.modelTagText}>{analysis.modelVersion}</Text>
            </View>
            <PriorityBadge priority={analysis.priority} size="large" />
          </View>

          <Text style={styles.mlCardTitle}>Assigned Priority: {analysis.priority}</Text>
          <Text style={styles.confidenceScore}>Model Confidence: {confidencePct}%</Text>

          {/* Probability Progress Bars */}
          <View style={styles.probabilitiesWrapper}>
            <Text style={styles.probHeading}>Class Probability Distribution</Text>

            {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((lvl) => {
              const score = analysis.labelScores?.[lvl] ?? 0;
              const pct = Math.round(score * 100);
              const isSelected = lvl === analysis.priority;

              return (
                <View key={lvl} style={styles.probRow}>
                  <View style={styles.probLabelRow}>
                    <Text style={[styles.probLabel, isSelected && styles.probLabelActive]}>{lvl}</Text>
                    <Text style={[styles.probVal, isSelected && styles.probValActive]}>{pct}%</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${pct}%`,
                          backgroundColor: isSelected ? Colors.primary : Colors.surfaceLight,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Gemini LLM Reasoning & Context */}
        {analysis.aiAnalysis && (
          <View style={styles.llmCard}>
            <View style={styles.llmHeader}>
              <Ionicons name="sparkles" size={18} color={Colors.secondary} style={{ marginRight: 6 }} />
              <Text style={styles.llmTitle}>Contextual Risk Assessment</Text>
            </View>

            {/* Department */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Recommended Routing:</Text>
              <Text style={styles.infoValue}>
                {analysis.aiAnalysis.department || "PUBLIC_WORKS"}
              </Text>
            </View>

            {/* Safety Risk */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Public Safety Hazard:</Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color:
                      analysis.aiAnalysis.safetyRisk === "CRITICAL"
                        ? Colors.critical
                        : analysis.aiAnalysis.safetyRisk === "HIGH"
                        ? Colors.high
                        : Colors.textPrimary,
                  },
                ]}
              >
                {analysis.aiAnalysis.safetyRisk || "LOW"} RISK
              </Text>
            </View>
            {analysis.aiAnalysis.safetyReason && (
              <Text style={styles.reasonText}>{analysis.aiAnalysis.safetyReason}</Text>
            )}

            {/* Environmental Impact */}
            <View style={[styles.infoRow, { marginTop: 12 }]}>
              <Text style={styles.infoLabel}>Environmental Impact:</Text>
              <Text style={styles.infoValue}>{analysis.aiAnalysis.environmentalImpact || "LOW"}</Text>
            </View>
            {analysis.aiAnalysis.environmentalReason && (
              <Text style={styles.reasonText}>{analysis.aiAnalysis.environmentalReason}</Text>
            )}

            {/* Suggested Action */}
            {analysis.aiAnalysis.suggestedAction && (
              <View style={styles.actionBox}>
                <Ionicons name="flash-outline" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.actionText}>{analysis.aiAnalysis.suggestedAction}</Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.textInverse} size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.submitButtonText}>Confirm & Dispatch Report</Text>
                <Ionicons name="checkmark-done" size={20} color={Colors.textInverse} style={{ marginLeft: 8 }} />
              </View>
            )}
          </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  fallbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    borderWidth: 1,
    borderColor: Colors.medium,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  fallbackBannerText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  mlGaugeCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modelTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modelTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },
  mlCardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  confidenceScore: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
    marginBottom: 16,
  },
  probabilitiesWrapper: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 14,
  },
  probHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  probRow: {
    marginBottom: 8,
  },
  probLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  probLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  probLabelActive: {
    color: Colors.primary,
    fontWeight: "800",
  },
  probVal: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  probValActive: {
    color: Colors.primary,
    fontWeight: "800",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  llmCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  llmHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  llmTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.primary,
  },
  reasonText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
    marginTop: 4,
  },
  actionBox: {
    flexDirection: "row",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    alignItems: "center",
  },
  actionText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primaryLight,
    fontWeight: "600",
    lineHeight: 18,
  },
  ctaRow: {
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textInverse,
    letterSpacing: 0.3,
  },
});
