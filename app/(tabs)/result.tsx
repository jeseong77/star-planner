import React, { useMemo, useState, useCallback } from "react"; // Added useState, useCallback
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Stack, router } from "expo-router";
import {
  useSafeAreaInsets,
  type EdgeInsets,
} from "react-native-safe-area-context"; // Import EdgeInsets
import { Ionicons } from "@expo/vector-icons"; // For potential icons in ResultItem or button

import { useAppTheme, type AppTheme } from "../../contexts/AppThemeProvider"; // Adjust path
import type { Result } from "../../types"; // Assuming Result type is in types.ts

// --- Mock Data ---
const MOCK_RESULTS: Result[] = [
  {
    id: "res1",
    problemId: "p1",
    description: "Successfully completed a 30-minute workout session.",
    dateAchieved: new Date(Date.now() - 86400000 * 1).toISOString(), // Yesterday
    sourceType: "TASK_COMPLETION",
    createdAt: new Date().toISOString(),
  },
  {
    id: "res2",
    problemId: "p1",
    description: "Avoided sugary snacks for a whole day!",
    dateAchieved: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    sourceType: "MANUAL_LOG",
    notes: "Felt a strong craving but resisted by drinking water.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "res3",
    problemId: "p2",
    description: "Finished Chapter 1 of the new programming book.",
    dateAchieved: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    sourceType: "MANUAL_LOG",
    createdAt: new Date().toISOString(),
  },
  {
    id: "res4",
    problemId: "p1",
    description: "Lost 0.5kg this week.",
    dateAchieved: new Date().toISOString(), // Today
    sourceType: "PROBLEM_MILESTONE",
    createdAt: new Date().toISOString(),
  },
];
// --- End Mock Data ---

// --- ResultItem Component ---
interface ResultItemProps {
  result: Result;
  theme: AppTheme; // Pass theme for styling
}

const ResultItem = ({ result, theme }: ResultItemProps) => {
  const styles = useMemo(() => getResultItemStyles(theme), [theme]);
  const formattedDate = new Date(result.dateAchieved).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <View style={styles.resultItemCard}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultDate}>{formattedDate}</Text>
        {result.sourceType && (
          <View style={styles.sourceTypeChip}>
            <Text style={styles.sourceTypeText}>
              {result.sourceType.replace("_", " ")}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.resultDescription}>{result.description}</Text>
      {result.notes && (
        <Text style={styles.resultNotes}>Notes: {result.notes}</Text>
      )}
    </View>
  );
};

export default function ResultScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => getScreenStyles(theme, insets), [theme, insets]);

  const [resultsData, setResultsData] = useState<Result[]>(MOCK_RESULTS);

  const handleLogResult = () => {
    console.log("Log Result button pressed");
    // TODO: Navigate to a modal or screen for logging a new result
    // router.push('/logResultModal'); // Example
  };

  const renderItem = useCallback(
    ({ item }: { item: Result }) => <ResultItem result={item} theme={theme} />,
    [theme]
  );

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen
        options={{
          title: "Results",
          headerShown: true,
          headerStyle: { backgroundColor: theme.surfaceContainerLow }, // Slightly different from screen bg
          headerTintColor: theme.onSurface,
          headerTitleStyle: { color: theme.onSurface, fontWeight: "600" },
        }}
      />
      <FlatList
        data={resultsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No results logged yet.</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.logResultButton}
        onPress={handleLogResult}
      >
        <Ionicons
          name="add-circle-outline"
          size={22}
          color={theme.onPrimaryContainer}
          style={styles.buttonIcon}
        />
        <Text style={styles.logResultButtonText}>Log New Result</Text>
      </TouchableOpacity>
    </View>
  );
}

const getScreenStyles = (theme: AppTheme, insets: EdgeInsets) =>
  StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    list: {
      flex: 1, // Takes up available space above the button
    },
    listContentContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 16, // Padding for the end of the list itself
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 50,
    },
    emptyText: {
      fontSize: 16,
      color: theme.onSurfaceVariant,
    },
    logResultButton: {
      backgroundColor: theme.primaryContainer,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginHorizontal: 16,
      borderRadius: 28, // For FAB like feel
      marginBottom: 16, // Respect safe area + extra margin
      marginTop: 8, // Space above button if list is short
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    buttonIcon: {
      marginRight: 8,
    },
    logResultButtonText: {
      color: theme.onPrimaryContainer,
      fontSize: 16,
      fontWeight: "600", // Medium weight
    },
  });

const getResultItemStyles = (theme: AppTheme) =>
  StyleSheet.create({
    resultItemCard: {
      backgroundColor: theme.surfaceContainer, // Standard container for items
      borderRadius: 12, // MD3 Medium shape
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.outlineVariant,
    },
    resultHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    resultDate: {
      fontSize: 12, // MD3 Label Small or Medium
      color: theme.onSurfaceVariant,
      fontWeight: "500",
    },
    sourceTypeChip: {
      backgroundColor: theme.secondaryContainer,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 16, // Pill shape
    },
    sourceTypeText: {
      fontSize: 11, // MD3 Label Small
      color: theme.onSecondaryContainer,
      fontWeight: "500",
      textTransform: "uppercase",
    },
    resultDescription: {
      fontSize: 16, // MD3 Body Large
      color: theme.onSurface,
      lineHeight: 24,
      marginBottom: 6,
    },
    resultNotes: {
      fontSize: 14, // MD3 Body Medium
      color: theme.onSurfaceVariant,
      fontStyle: "italic",
    },
  });
