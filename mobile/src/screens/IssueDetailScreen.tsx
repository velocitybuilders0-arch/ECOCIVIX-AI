import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import { Header } from "../components/Header";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import { CivicIssue, IssueStatus } from "../types";
import { fetchIssuesApi } from "../services/api";

interface IssueDetailScreenProps {
  issueId: string;
  onBack: () => void;
}

const LIFECYCLE_STEPS: { status: IssueStatus; label: string; desc: string }[] = [
  { status: "OPEN", label: "Report Submitted", desc: "AI analyzed and logged to municipal registry." },
  { status: "ACKNOWLEDGED", label: "Acknowledged by Ops", desc: "Assigned to department response dispatcher." },
  { status: "IN_PROGRESS", label: "Crew Dispatched", desc: "Field technician team dispatched on-site." },
  { status: "RESOLVED", label: "Resolved & Closed", desc: "Repairs completed and validated." },
];

export const IssueDetailScreen: React.FC<IssueDetailScreenProps> = ({ issueId, onBack }) => {
  const [issue, setIssue] = useState<CivicIssue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await fetchIssuesApi();
        const found = list.find((i) => i.id === issueId);
        setIssue(found || list[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [issueId]);

  if (loading || !issue) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Report Detail" showBack onBack={onBack} />
        <View style={styles.centerContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const getStepStatus = (stepStatus: IssueStatus) => {
    const order: IssueStatus[] = ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    const currentIdx = order.indexOf(issue.status);
    const stepIdx = order.indexOf(stepStatus);

    if (stepIdx < currentIdx) return "completed";
    if (stepIdx === currentIdx) return "active";
    return "pending";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={`Report #${issue.id.slice(0, 8)}`}
        subtitle="Live Civic Audit Trail"
        showBack
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Badges */}
        <View style={styles.topRow}>
          <PriorityBadge priority={issue.ml_priority} size="medium" />
          <StatusBadge status={issue.status} />
        </View>

        {/* Issue Title & Description */}
        <Text style={styles.title}>{issue.title}</Text>
        <Text style={styles.description}>{issue.description}</Text>

        {/* Location & Department Card */}
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Ionicons name="business" size={16} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.metaLabel}>Assigned Unit:</Text>
            <Text style={styles.metaValue}>
              {issue.assigned_department || issue.ai_analysis?.department || "MUNICIPAL DISPATCH"}
            </Text>
          </View>

          <View style={[styles.metaRow, { marginTop: 10 }]}>
            <Ionicons name="location" size={16} color={Colors.secondary} style={{ marginRight: 8 }} />
            <Text style={styles.metaLabel}>Location:</Text>
            <Text style={styles.metaValue}>{issue.location_context || "Coordinates Logged"}</Text>
          </View>
        </View>

        {/* Official Admin / Dispatch Note */}
        {issue.admin_note && (
          <View style={styles.adminNoteCard}>
            <View style={styles.adminHeader}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.adminTitle}>Official Municipal Update</Text>
            </View>
            <Text style={styles.adminNoteText}>{issue.admin_note}</Text>
          </View>
        )}

        {/* Resolution Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Resolution Progression</Text>

          {LIFECYCLE_STEPS.map((step, idx) => {
            const state = getStepStatus(step.status);
            const isLast = idx === LIFECYCLE_STEPS.length - 1;

            return (
              <View key={step.status} style={styles.timelineStep}>
                <View style={styles.stepLeft}>
                  <View
                    style={[
                      styles.stepCircle,
                      state === "completed" && styles.stepCircleDone,
                      state === "active" && styles.stepCircleActive,
                    ]}
                  >
                    {state === "completed" ? (
                      <Ionicons name="checkmark" size={12} color={Colors.textInverse} />
                    ) : state === "active" ? (
                      <View style={styles.activeInnerDot} />
                    ) : (
                      <View style={styles.pendingDot} />
                    )}
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.stepLine,
                        state === "completed" && styles.stepLineDone,
                      ]}
                    />
                  )}
                </View>

                <View style={styles.stepRight}>
                  <Text
                    style={[
                      styles.stepLabel,
                      state === "active" && styles.stepLabelActive,
                      state === "completed" && styles.stepLabelDone,
                    ]}
                  >
                    {step.label}
                  </Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* AI Confidence Audit */}
        <View style={styles.aiAuditCard}>
          <View style={styles.auditHeader}>
            <Ionicons name="hardware-chip-outline" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.auditTitle}>AI Classifier Audit</Text>
          </View>
          <Text style={styles.auditText}>
            Model: {issue.ml_model_version} • ML Confidence: {Math.round(issue.ml_confidence * 100)}%
          </Text>
          {issue.ai_analysis?.safetyReason && (
            <Text style={styles.auditDetail}>Hazard: {issue.ai_analysis.safetyReason}</Text>
          )}
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
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    lineHeight: 26,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 18,
  },
  metaCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "600",
    marginRight: 6,
  },
  metaValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: "700",
    flex: 1,
  },
  adminNoteCard: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  adminHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  adminTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.primaryLight,
  },
  adminNoteText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 19,
    fontWeight: "500",
  },
  timelineCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 18,
  },
  timelineStep: {
    flexDirection: "row",
    minHeight: 60,
  },
  stepLeft: {
    alignItems: "center",
    marginRight: 14,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepCircleActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.card,
  },
  activeInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textMuted,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.surface,
    marginVertical: 4,
  },
  stepLineDone: {
    backgroundColor: Colors.primary,
  },
  stepRight: {
    flex: 1,
    paddingBottom: 16,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textMuted,
    marginBottom: 2,
  },
  stepLabelActive: {
    color: Colors.primary,
  },
  stepLabelDone: {
    color: Colors.textPrimary,
  },
  stepDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  aiAuditCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  auditHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  auditTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  auditText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  auditDetail: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
});
