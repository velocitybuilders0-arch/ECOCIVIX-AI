import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Colors } from "./src/theme/colors";
import { DualAIAnalysisResult, ScreenType } from "./src/types";
import { NavBar } from "./src/components/NavBar";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { ReportIssueScreen } from "./src/screens/ReportIssueScreen";
import { AnalyzeScreen } from "./src/screens/AnalyzeScreen";
import { MyIssuesScreen } from "./src/screens/MyIssuesScreen";
import { IssueDetailScreen } from "./src/screens/IssueDetailScreen";
import { AdminScreen } from "./src/screens/AdminScreen";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("ONBOARDING");
  const [selectedIssueId, setSelectedIssueId] = useState<string>("demo-001");

  // Analysis workflow state
  const [currentAnalysis, setCurrentAnalysis] = useState<DualAIAnalysisResult | null>(null);
  const [currentFormData, setCurrentFormData] = useState<{
    title: string;
    description: string;
    location: string;
  }>({
    title: "",
    description: "",
    location: "",
  });

  const handleNavigate = (screen: ScreenType, issueId?: string) => {
    if (issueId) {
      setSelectedIssueId(issueId);
    }
    setCurrentScreen(screen);
  };

  const handleAnalysisReady = (
    analysis: DualAIAnalysisResult,
    formData: { title: string; description: string; location: string }
  ) => {
    setCurrentAnalysis(analysis);
    setCurrentFormData(formData);
    setCurrentScreen("ANALYZE");
  };

  const handleSubmitSuccess = (newIssueId: string) => {
    setSelectedIssueId(newIssueId);
    setCurrentScreen("DETAIL");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Screen Routing */}
      <View style={styles.screenContainer}>
        {currentScreen === "ONBOARDING" && (
          <OnboardingScreen onStart={() => setCurrentScreen("DASHBOARD")} />
        )}

        {currentScreen === "DASHBOARD" && (
          <DashboardScreen onNavigate={handleNavigate} />
        )}

        {currentScreen === "REPORT" && (
          <ReportIssueScreen
            onBack={() => setCurrentScreen("DASHBOARD")}
            onAnalysisReady={handleAnalysisReady}
          />
        )}

        {currentScreen === "ANALYZE" && currentAnalysis && (
          <AnalyzeScreen
            analysis={currentAnalysis}
            formData={currentFormData}
            onBack={() => setCurrentScreen("REPORT")}
            onSubmitSuccess={handleSubmitSuccess}
          />
        )}

        {currentScreen === "MY_ISSUES" && (
          <MyIssuesScreen onNavigate={handleNavigate} />
        )}

        {currentScreen === "DETAIL" && (
          <IssueDetailScreen
            issueId={selectedIssueId}
            onBack={() => setCurrentScreen("DASHBOARD")}
          />
        )}

        {currentScreen === "ADMIN" && (
          <AdminScreen onNavigate={handleNavigate} />
        )}
      </View>

      {/* Persistent Bottom Tab Bar */}
      <NavBar currentScreen={currentScreen} onNavigate={handleNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenContainer: {
    flex: 1,
  },
});
