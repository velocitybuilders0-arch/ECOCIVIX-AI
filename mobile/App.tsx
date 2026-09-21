import "react-native-url-polyfill/auto";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Colors } from "./src/theme/colors";
import { DualAIAnalysisResult, ScreenType } from "./src/types";
import { NavBar } from "./src/components/NavBar";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { ReportIssueScreen } from "./src/screens/ReportIssueScreen";
import { AnalyzeScreen } from "./src/screens/AnalyzeScreen";
import { MyIssuesScreen } from "./src/screens/MyIssuesScreen";
import { IssueDetailScreen } from "./src/screens/IssueDetailScreen";
import { AdminScreen } from "./src/screens/AdminScreen";
import { StaffScreen } from "./src/screens/StaffScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { getSession, getUserRole, supabase } from "./src/services/auth";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("LOGIN");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string>("");

  // Analysis workflow state
  const [currentAnalysis, setCurrentAnalysis] = useState<DualAIAnalysisResult | null>(null);
  const [currentFormData, setCurrentFormData] = useState<{
    title: string;
    description: string;
    location: string;
    imageUri?: string;
  }>({
    title: "",
    description: "",
    location: "",
  });

  useEffect(() => {
    getSession().then((session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        setCurrentScreen(getUserRole(session.user) === "citizen" ? "DASHBOARD" : getUserRole(session.user) === "staff" ? "STAFF" : "ADMIN");
      }
    });

    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (!session) setCurrentScreen("LOGIN");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const handleNavigate = (screen: ScreenType, issueId?: string) => {
    if (issueId) {
      setSelectedIssueId(issueId);
    }
    setCurrentScreen(screen);
  };

  const handleAnalysisReady = (
    analysis: DualAIAnalysisResult,
    formData: { title: string; description: string; location: string; imageUri?: string }
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
        {currentScreen === "LOGIN" && (
          <LoginScreen onAuthenticated={() => getSession().then((session) => {
            setCurrentUser(session?.user ?? null);
            const role = getUserRole(session?.user ?? null);
            setCurrentScreen(role === "citizen" ? "DASHBOARD" : role === "staff" ? "STAFF" : "ADMIN");
          })} />
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
        {currentScreen === "STAFF" && <StaffScreen />}
      </View>

      {/* Persistent Bottom Tab Bar */}
      <NavBar currentScreen={currentScreen} onNavigate={handleNavigate} role={getUserRole(currentUser)} />
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
