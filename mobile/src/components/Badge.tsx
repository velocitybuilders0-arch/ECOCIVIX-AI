import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PriorityColors, StatusColors } from "../theme/colors";
import { PriorityLevel, IssueStatus } from "../types";

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: "small" | "medium" | "large";
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = "medium" }) => {
  const config = PriorityColors[priority] || PriorityColors.MEDIUM;
  const isSmall = size === "small";
  const isLarge = size === "large";

  return (
    <View
      style={[
        styles.badgeContainer,
        { backgroundColor: config.bg, borderColor: config.border },
        isSmall && styles.badgeSmall,
        isLarge && styles.badgeLarge,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text
        style={[
          styles.badgeText,
          { color: config.text },
          isSmall && styles.textSmall,
          isLarge && styles.textLarge,
        ]}
      >
        {priority}
      </Text>
    </View>
  );
};

interface StatusBadgeProps {
  status: IssueStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = StatusColors[status] || StatusColors.OPEN;
  const formatted = status.replace(/_/g, " ");

  return (
    <View style={[styles.statusContainer, { backgroundColor: config.bg }]}>
      <Text style={[styles.statusText, { color: config.text }]}>{formatted}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 9,
  },
  textLarge: {
    fontSize: 13,
  },
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
});
