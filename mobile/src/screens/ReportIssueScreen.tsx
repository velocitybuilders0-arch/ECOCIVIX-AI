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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "../theme/colors";
import { Header } from "../components/Header";
import { DualAIAnalysisResult } from "../types";
import { analyzeIssueApi } from "../services/api";

interface ReportIssueScreenProps {
  onBack: () => void;
  onAnalysisReady: (
    analysis: DualAIAnalysisResult,
    formData: { title: string; description: string; location: string; imageUri?: string }
  ) => void;
}

export const ReportIssueScreen: React.FC<ReportIssueScreenProps> = ({
  onBack,
  onAnalysisReady,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Sector 14 Civic Zone (Auto GPS)");
  const [analyzing, setAnalyzing] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const selectPhoto = async (source: "camera" | "library") => {
    const permission = source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", `Allow ${source === "camera" ? "camera" : "photo library"} access to attach evidence.`);
      return;
    }

    const result = source === "camera"
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });

    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handlePhotoPress = () => {
    Alert.alert("Attach visual evidence", "Choose an image source", [
      { text: "Camera", onPress: () => selectPhoto("camera") },
      { text: "Photo library", onPress: () => selectPhoto("library") },
      ...(photoUri ? [{ text: "Remove photo", style: "destructive" as const, onPress: () => setPhotoUri(null) }] : []),
      { text: "Cancel", style: "cancel" as const },
    ]);
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
      const continueToAnalysis = () => onAnalysisReady(result, { title, description, location, imageUri: photoUri ?? undefined });
      if (result.isFallback) {
        Alert.alert(
          "Offline Demo Mode",
          "The backend is unreachable. Using local simulation for priority. Submit anyway?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Submit Anyway", onPress: continueToAnalysis }
          ]
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

        {/* Photo Attachment */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Visual Evidence / Photo</Text>
          <TouchableOpacity
            style={[styles.photoCard, photoUri && styles.photoCardActive]}
            onPress={handlePhotoPress}
            activeOpacity={0.8}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : (
              <Ionicons name="camera-outline" size={24} color={Colors.textMuted} />
            )}
            <Text style={[styles.photoText, photoUri && styles.photoTextActive]}>
              {photoUri ? "Photo attached - tap to change" : "Take a photo or choose from library"}
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
  photoPreview: {
    width: 52,
    height: 52,
    borderRadius: 8,
    marginRight: 12,
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
