import React, { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "../theme/colors";
import { Header } from "../components/Header";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import { CivicIssue } from "../types";
import { fetchIssuesApi } from "../services/api";

export const StaffScreen: React.FC = () => {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      setIssues(await fetchIssuesApi());
    } catch (err: any) {
      setError(err.message || "Could not load the staff queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Staff Work Queue" subtitle="Assigned civic reports" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadIssues} tintColor={Colors.primary} />}
      >
        {error && <Text style={styles.error}>{error}</Text>}
        {!loading && !error && issues.length === 0 && <Text style={styles.empty}>No reports are currently assigned.</Text>}
        {issues.map((issue) => (
          <View key={issue.id} style={styles.issueCard}>
            <View style={styles.badges}>
              <PriorityBadge priority={issue.ml_priority} size="small" />
              <StatusBadge status={issue.status} />
            </View>
            <Text style={styles.title} numberOfLines={2}>{issue.title}</Text>
            <Text style={styles.description} numberOfLines={3}>{issue.description}</Text>
            <Text style={styles.department} numberOfLines={1}>{issue.assigned_department || "UNASSIGNED"}</Text>
          </View>
        ))}
        {loading && issues.length === 0 && <ActivityIndicator color={Colors.primary} />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 32 },
  error: { color: Colors.critical, fontSize: 14, marginBottom: 16 },
  empty: { color: Colors.textSecondary, fontSize: 15, textAlign: "center", marginTop: 40 },
  issueCard: { backgroundColor: Colors.card, borderColor: Colors.border, borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  badges: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  title: { color: Colors.textPrimary, fontSize: 16, fontWeight: "800", marginBottom: 6 },
  description: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 12 },
  department: { color: Colors.secondary, fontSize: 11, fontWeight: "800" },
});
