import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import { Header } from "../components/Header";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import { CivicIssue, IssueStatus, ScreenType } from "../types";
import { fetchIssuesApi } from "../services/api";

interface MyIssuesScreenProps {
  onNavigate: (screen: ScreenType, issueId?: string) => void;
}

const FILTER_TABS: { label: string; value: IssueStatus | "ALL" }[] = [
  { label: "All Issues", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
];

export const MyIssuesScreen: React.FC<MyIssuesScreenProps> = ({ onNavigate }) => {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<IssueStatus | "ALL">("ALL");

  const loadIssues = async () => {
    setLoading(true);
    try {
      const data = await fetchIssuesApi();
      setIssues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const filteredIssues = issues.filter((issue) => {
    const matchesFilter = activeFilter === "ALL" || issue.status === activeFilter;
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.assigned_department && issue.assigned_department.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Civic Reports Tracker"
        subtitle={`${filteredIssues.length} issues tracked`}
        rightActionIcon="add-outline"
        onRightAction={() => onNavigate("REPORT")}
      />

      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, keywords, or department..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(tab.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Issue Cards Feed */}
        <ScrollView
          contentContainerStyle={styles.issuesList}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadIssues} tintColor={Colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {filteredIssues.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="documents-outline" size={48} color={Colors.textMuted} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>No Reports Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? "No reports match your search query." : "You have not submitted any civic reports yet."}
              </Text>
            </View>
          ) : (
            filteredIssues.map((issue) => (
              <TouchableOpacity
                key={issue.id}
                style={styles.card}
                onPress={() => onNavigate("DETAIL", issue.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <PriorityBadge priority={issue.ml_priority} size="small" />
                  <StatusBadge status={issue.status} />
                </View>

                <Text style={styles.cardTitle}>{issue.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {issue.description}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.locRow}>
                    <Ionicons name="location-outline" size={12} color={Colors.textMuted} style={{ marginRight: 4 }} />
                    <Text style={styles.locText} numberOfLines={1}>
                      {issue.location_context || "Civic Zone"}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(issue.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 14,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 13,
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterChip: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.textInverse,
    fontWeight: "800",
  },
  issuesList: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 6,
    lineHeight: 20,
  },
  cardDesc: {
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
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  locText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  dateText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
