import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import { Header } from "../components/Header";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import { CivicIssue, ScreenType } from "../types";
import { fetchIssuesApi } from "../services/api";
import { TEST_MACRO_F1_LABEL } from "../constants/modelMetrics";

interface DashboardScreenProps {
  onNavigate: (screen: ScreenType, issueId?: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchIssuesApi();
      setIssues(data);
      setIsOfflineMode(false);
    } catch (err) {
      console.error(err);
      setIsOfflineMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const criticalCount = issues.filter((i) => i.ml_priority === "CRITICAL").length;
  const inProgressCount = issues.filter((i) => i.status === "IN_PROGRESS").length;
  const resolvedCount = issues.filter((i) => i.status === "RESOLVED").length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="ECOCIVIX AI"
        subtitle="Civic Operations Intelligence Hub"
        rightActionIcon="notifications-outline"
        onRightAction={() => {}}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ML Status Hero Card */}
        <View style={styles.mlHeroCard}>
          <View style={styles.mlHeader}>
            <View style={styles.mlBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.mlBadgeText}>DISTILBERT ML v1.0 ONLINE</Text>
            </View>
            <View style={styles.metricStatusRow}>
              {isOfflineMode && (
                <View style={styles.offlinePill}>
                  <Ionicons name="cloud-offline-outline" size={12} color={Colors.medium} style={{ marginRight: 4 }} />
                  <Text style={styles.offlinePillText}>OFFLINE DEMO</Text>
                </View>
              )}
              <Text style={styles.confidenceText}>{TEST_MACRO_F1_LABEL}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Smart Municipal Triage</Text>
          <Text style={styles.heroSub}>
            Real-time deep learning inference automatically determines emergency triage priority and municipal routing.
          </Text>

          <TouchableOpacity
            style={styles.reportCtaButton}
            onPress={() => onNavigate("REPORT")}
            activeOpacity={0.85}
          >
            <Ionicons name="flash" size={18} color={Colors.textInverse} style={{ marginRight: 8 }} />
            <Text style={styles.reportCtaText}>Report Civic Issue with AI</Text>
          </TouchableOpacity>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { borderColor: Colors.critical }]}>
            <Text style={[styles.metricNumber, { color: Colors.critical }]}>{criticalCount}</Text>
            <Text style={styles.metricLabel}>Critical Hazards</Text>
          </View>

          <View style={[styles.metricCard, { borderColor: Colors.statusInProgress }]}>
            <Text style={[styles.metricNumber, { color: Colors.statusInProgress }]}>{inProgressCount}</Text>
            <Text style={styles.metricLabel}>In Progress</Text>
          </View>

          <View style={[styles.metricCard, { borderColor: Colors.statusResolved }]}>
            <Text style={[styles.metricNumber, { color: Colors.statusResolved }]}>{resolvedCount}</Text>
            <Text style={styles.metricLabel}>Resolved</Text>
          </View>
        </View>

        {/* Live Feed Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Civic Dispatch Feed</Text>
          <TouchableOpacity onPress={() => onNavigate("MY_ISSUES")}>
            <Text style={styles.viewAllText}>View All ({issues.length})</Text>
          </TouchableOpacity>
        </View>

        {/* Issues List */}
        {issues.slice(0, 4).map((issue) => (
          <TouchableOpacity
            key={issue.id}
            style={styles.issueCard}
            onPress={() => onNavigate("DETAIL", issue.id)}
            activeOpacity={0.8}
          >
            <View style={styles.cardTopRow}>
              <PriorityBadge priority={issue.ml_priority} size="small" />
              <StatusBadge status={issue.status} />
            </View>

            <Text style={styles.issueTitle} numberOfLines={2}>
              {issue.title}
            </Text>

            <Text style={styles.issueDesc} numberOfLines={2}>
              {issue.description}
            </Text>

            <View style={styles.cardFooter}>
              <View style={styles.deptBadge}>
                <Ionicons name="business-outline" size={12} color={Colors.textMuted} style={{ marginRight: 4 }} />
                <Text style={styles.deptText}>
                  {issue.assigned_department || issue.ai_analysis?.department || "MUNICIPAL"}
                </Text>
              </View>
              <Text style={styles.dateText}>
                {new Date(issue.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
    paddingBottom: 24,
  },
  mlHeroCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  mlHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mlBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 6,
  },
  mlBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  metricStatusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.secondary,
  },
  offlinePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  offlinePillText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.medium,
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 18,
  },
  reportCtaButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  reportCtaText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textInverse,
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    borderWidth: 1,
    alignItems: "center",
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "600",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
  issueCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  issueTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 6,
    lineHeight: 20,
  },
  issueDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  deptBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  deptText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
