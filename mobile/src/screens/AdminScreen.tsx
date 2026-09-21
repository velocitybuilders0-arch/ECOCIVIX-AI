import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import { Header } from "../components/Header";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import { CivicIssue, IssueStatus, ScreenType } from "../types";
import { fetchIssuesApi, updateIssueStatusApi } from "../services/api";

interface AdminScreenProps {
  onNavigate: (screen: ScreenType, issueId?: string) => void;
}

const STATUS_OPTIONS: IssueStatus[] = ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const DEPARTMENTS = [
  "PUBLIC_WORKS",
  "WATER_SANITATION",
  "ELECTRICAL_ENERGY",
  "ENVIRONMENTAL_HEALTH",
  "DISASTER_RESPONSE",
  "PARKS_RECREATION",
];

export const AdminScreen: React.FC<AdminScreenProps> = ({ onNavigate }) => {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState<IssueStatus>("IN_PROGRESS");
  const [adminNote, setAdminNote] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
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
    loadData();
  }, []);

  const handleOpenStatusModal = (issue: CivicIssue) => {
    setSelectedIssue(issue);
    setNewStatus(issue.status);
    setAdminNote(issue.admin_note || "");
    setSelectedDept(issue.assigned_department || issue.ai_analysis?.department || "PUBLIC_WORKS");
    setModalVisible(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedIssue) return;
    setUpdating(true);
    try {
      const updated = await updateIssueStatusApi(
        selectedIssue.id,
        newStatus,
        adminNote,
        selectedDept
      );

      setIssues((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setModalVisible(false);
      Alert.alert("Status Updated", `Report #${updated.id.slice(0, 8)} transitioned to ${newStatus}.`);
    } catch (err: any) {
      Alert.alert("Update Failed", err.message || "Could not update status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Municipal Ops Command"
        subtitle="City Dispatch & Workflow Management"
        rightActionIcon="refresh-outline"
        onRightAction={loadData}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={styles.opsBanner}>
          <View style={styles.bannerRow}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.bannerTitle}>City Operator Portal</Text>
          </View>
          <Text style={styles.bannerSub}>
            Triage, acknowledge, and assign municipal crews to AI-prioritized hazard reports.
          </Text>
        </View>

        {/* Triage List */}
        <Text style={styles.sectionHeading}>Priority Action Queue ({issues.length})</Text>

        {issues.map((issue) => (
          <View key={issue.id} style={styles.issueCard}>
            <View style={styles.cardHeader}>
              <PriorityBadge priority={issue.ml_priority} size="small" />
              <StatusBadge status={issue.status} />
            </View>

            <Text style={styles.issueTitle}>{issue.title}</Text>
            <Text style={styles.issueDesc} numberOfLines={2}>
              {issue.description}
            </Text>

            <View style={styles.metaRow}>
              <Text style={styles.deptTag}>
                Dept: {issue.assigned_department || issue.ai_analysis?.department || "Unassigned"}
              </Text>
              <Text style={styles.confidenceTag}>
                ML: {Math.round(issue.ml_confidence * 100)}%
              </Text>
            </View>

            {issue.admin_note && (
              <View style={styles.noteBox}>
                <Text style={styles.noteText} numberOfLines={1}>
                  Note: {issue.admin_note}
                </Text>
              </View>
            )}

            <View style={styles.actionButtonRow}>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => onNavigate("DETAIL", issue.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.detailButtonText}>View Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.updateButton}
                onPress={() => handleOpenStatusModal(issue)}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={15} color={Colors.textInverse} style={{ marginRight: 4 }} />
                <Text style={styles.updateButtonText}>Update Status</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Status Update Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Workflow Status</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedIssue && (
              <Text style={styles.modalIssueTitle} numberOfLines={1}>
                #{selectedIssue.id.slice(0, 8)} — {selectedIssue.title}
              </Text>
            )}

            {/* Status Selector */}
            <Text style={styles.fieldLabel}>Workflow Status:</Text>
            <View style={styles.statusChipsGrid}>
              {STATUS_OPTIONS.map((st) => {
                const isSelected = newStatus === st;
                return (
                  <TouchableOpacity
                    key={st}
                    style={[styles.statusChip, isSelected && styles.statusChipActive]}
                    onPress={() => setNewStatus(st)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.statusChipText, isSelected && styles.statusChipTextActive]}>
                      {st.replace(/_/g, " ")}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Department Selector */}
            <Text style={styles.fieldLabel}>Assign Department:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deptScroll}>
              {DEPARTMENTS.map((dept) => {
                const isSelected = selectedDept === dept;
                return (
                  <TouchableOpacity
                    key={dept}
                    style={[styles.deptChip, isSelected && styles.deptChipActive]}
                    onPress={() => setSelectedDept(dept)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.deptChipText, isSelected && styles.deptChipTextActive]}>
                      {dept}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Dispatcher Note */}
            <Text style={styles.fieldLabel}>Official Dispatch Note:</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="e.g. Crew assigned, valve shutoff in progress..."
              placeholderTextColor={Colors.textMuted}
              value={adminNote}
              onChangeText={setAdminNote}
              multiline
              numberOfLines={3}
            />

            {/* Modal Actions */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, updating && styles.buttonDisabled]}
                onPress={handleSaveStatus}
                disabled={updating}
                activeOpacity={0.85}
              >
                {updating ? (
                  <ActivityIndicator color={Colors.textInverse} size="small" />
                ) : (
                  <Text style={styles.saveText}>Save Progression</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  opsBanner: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  bannerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  issueCard: {
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
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  issueDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  deptTag: {
    fontSize: 11,
    color: Colors.primaryLight,
    fontWeight: "700",
  },
  confidenceTag: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: "600",
  },
  noteBox: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  noteText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: "italic",
  },
  actionButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  detailButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  detailButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  updateButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.textInverse,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  modalIssueTitle: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: "600",
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 6,
  },
  statusChipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  statusChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  statusChipTextActive: {
    color: Colors.textInverse,
    fontWeight: "800",
  },
  deptScroll: {
    flexDirection: "row",
    marginBottom: 14,
  },
  deptChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deptChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  deptChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  deptChipTextActive: {
    color: Colors.textInverse,
    fontWeight: "800",
  },
  modalTextInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    color: Colors.textPrimary,
    fontSize: 13,
    height: 70,
    textAlignVertical: "top",
    marginBottom: 18,
  },
  modalActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textInverse,
  },
});
