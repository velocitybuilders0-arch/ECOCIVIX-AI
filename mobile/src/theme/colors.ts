export const Colors = {
  // Backgrounds
  background: "#080C16",
  card: "#0F172A",
  cardHover: "#1E293B",
  surface: "#1E293B",
  surfaceLight: "#334155",

  // Brand Accents
  primary: "#10B981", // Emerald Green
  primaryDark: "#059669",
  primaryLight: "#34D399",
  secondary: "#06B6D4", // Cyan
  secondaryDark: "#0891B2",
  accent: "#6366F1", // Indigo

  // Priority Colors
  critical: "#EF4444", // Red
  high: "#F97316", // Orange
  medium: "#FBBF24", // Amber/Yellow
  low: "#34D399", // Emerald Light

  // Status Colors
  statusOpen: "#38BDF8", // Sky Blue
  statusAcknowledged: "#818CF8", // Indigo
  statusInProgress: "#FBBF24", // Amber
  statusResolved: "#10B981", // Emerald Green
  statusClosed: "#94A3B8", // Slate

  // Typography
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  textInverse: "#090D16",

  // Borders & Dividers
  border: "#1E293B",
  borderLight: "#334155",
  borderActive: "#10B981",

  // Overlays & Glass
  glassBackground: "rgba(15, 23, 42, 0.85)",
  glassBorder: "rgba(255, 255, 255, 0.08)",
  shadowColor: "#000000",
};

export const PriorityColors: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: {
    bg: "rgba(239, 68, 68, 0.15)",
    text: "#EF4444",
    border: "rgba(239, 68, 68, 0.4)",
  },
  HIGH: {
    bg: "rgba(249, 115, 22, 0.15)",
    text: "#F97316",
    border: "rgba(249, 115, 22, 0.4)",
  },
  MEDIUM: {
    bg: "rgba(251, 191, 36, 0.15)",
    text: "#FBBF24",
    border: "rgba(251, 191, 36, 0.4)",
  },
  LOW: {
    bg: "rgba(52, 211, 153, 0.15)",
    text: "#34D399",
    border: "rgba(52, 211, 153, 0.4)",
  },
};

export const StatusColors: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: "rgba(56, 189, 248, 0.15)", text: "#38BDF8" },
  ACKNOWLEDGED: { bg: "rgba(129, 140, 248, 0.15)", text: "#818CF8" },
  IN_PROGRESS: { bg: "rgba(251, 191, 36, 0.15)", text: "#FBBF24" },
  RESOLVED: { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981" },
  CLOSED: { bg: "rgba(148, 163, 184, 0.15)", text: "#94A3B8" },
};
