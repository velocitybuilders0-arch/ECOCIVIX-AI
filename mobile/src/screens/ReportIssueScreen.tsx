import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import { Header } from "../components/Header";
import { DualAIAnalysisResult } from "../types";
import { analyzeIssueApi } from "../services/api";

interface ReportIssueScreenProps {
  onBack: () => void;
  onAnalysisReady: (
    analysis: DualAIAnalysisResult,
    formData: { title: string; description: string; location: string }
  ) => void;
}

const PRESET_ISSUES = [
  {
    title: "Live electrical spark and dangling wire from transformer",
    description: "Transformer near bus stop is buzzing loudly with blue sparks, wire is within reach of sidewalk.",
    location: "Bus Stop 12, MG Road",
  },
  {
    title: "Major sewage overflow into public marketplace",
    description: "Manhole lid displaced, raw wastewater flooding pedestrian market stalls creating severe health risk.",
    location: "Central Market South Gate",
  },
  {
    title: "Huge pile of uncollected garbage and medical waste",
    description: "Discarded plastic packaging, rotten food waste and clinic refuse dumped on vacant plot for 5 days.",
    location: "Behind Sector 9 Community Center",
  },
  {
    title: "Dangerous pothole cave-in near school zone",
    description: "Deep cavity formed after rain, cars and school buses are bottoming out.",
    location: "School Lane Road Cross",
  },
];

export const ReportIssueScreen: React.FC<ReportIssueScreenProps> = ({
  onBack,
  onAnalysisReady,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Sector 14 Civic Zone (Auto GPS)");
  const [analyzing, setAnalyzing] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);

  const handleApplyPreset = (preset: typeof PRESET_ISSUES[0]) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setLocation(preset.location);
  };

  const handleRunAnalysis = async () => {
    if (title.trim().length < 3) {
      Alert.alert("Title Required", "Please enter a descriptive issue title (min 3 characters).");
      return;
    }
    if (description.trim().length < 5) {
      Alert.alert("Description Required", "Please describe the situation (min 5 characters).");
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeIssueApi(title, description, location);
      const continueToAnalysis = () => onAnalysisReady(result, { title, description, location });
      if (result.isFallback || result.aiAnalysis?.isFallback) {
        Alert.alert(
          "Offline demo mode",
          "Priority simulated locally. Trained model not contacted.",
          [{ text: "Continue", onPress: continueToAnalysis }]
        );
      } else {
        continueToAnalysis();
      }
    } catch (err: any) {
      Alert.alert("Analysis Error", err.message || "Could not analyze issue.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Report Issue" subtitle="Dual AI Pipeline Classifier" showBack onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Demo Fill Buttons */}
        <View style={styles.demoSection}>
          <Text style={styles.demoLabel}>Demo Quick Fill Scenarios:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
            {PRESET_ISSUES.map((preset, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.presetChip}
                onPress={() => handleApplyPreset(preset)}
                activeOpacity={0.7}
              >
                <Ionicons name="flash-outline" size={12} color={Colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.presetText} numberOfLines={1}>
                  {preset.title.split(" ")[0]} {preset.title.split(" ")[1]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Issue Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Issue Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Broken water pipeline flooding road"
            placeholderTextColor={Colors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={200}
          />
        </View>

        {/* Issue Description Input */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              Detailed Description <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.charCount}>{description.length}/2000</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Provide context on severity, duration, and immediate risks..."
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={2000}
            textAlignVertical="top"
          />
        </View>

        {/* Location & GPS */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location / Proximity</Text>
          <View style={styles.locationRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="e.g. Street name, landmark"
              placeholderTextColor={Colors.textMuted}
              value={location}
              onChangeText={setLocation}
            />
            <TouchableOpacity
              style={styles.gpsButton}
              onPress={() => setLocation("GPS Coordinates (28.4595° N, 77.0266° E)")}
              activeOpacity={0.7}
            >
              <Ionicons name="location" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo Attachment Simulation */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Visual Evidence / Photo</Text>
          <TouchableOpacity
            style={[styles.photoCard, hasPhoto && styles.photoCardActive]}
            onPress={() => setHasPhoto(!hasPhoto)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={hasPhoto ? "checkmark-circle" : "camera-outline"}
              size={24}
              color={hasPhoto ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.photoText, hasPhoto && styles.photoTextActive]}>
              {hasPhoto ? "Photo Attached (evidence.jpg)" : "Attach Photo / Camera Capture"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Analyze Button */}
        <TouchableOpacity
          style={[styles.analyzeButton, analyzing && styles.buttonDisabled]}
          onPress={handleRunAnalysis}
          disabled={analyzing}
          activeOpacity={0.85}
        >
          {analyzing ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={Colors.textInverse} size="small" style={{ marginRight: 8 }} />
              <Text style={styles.analyzeButtonText}>Running DistilBERT + Gemini AI...</Text>
            </View>
          ) : (
            <View style={styles.loadingRow}>
              <Ionicons name="analytics" size={20} color={Colors.textInverse} style={{ marginRight: 8 }} />
              <Text style={styles.analyzeButtonText}>Analyze Priority with AI</Text>
            </View>
          )}
        </TouchableOpacity>
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
  demoSection: {
    marginBottom: 20,
  },
  demoLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  presetScroll: {
    flexDirection: "row",
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
  },
  presetText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: Colors.critical,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  textArea: {
    height: 110,
    paddingTop: 14,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  gpsButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  photoCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 20,
  },
  photoCardActive: {
    borderColor: Colors.primary,
    borderStyle: "solid",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  photoText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "600",
    marginLeft: 8,
  },
  photoTextActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
  analyzeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  analyzeButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textInverse,
    letterSpacing: 0.3,
  },
});
