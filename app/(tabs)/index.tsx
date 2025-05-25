// app/(tabs)/index.tsx (or home.tsx)
import React, { useState, useMemo, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Problem, Task } from "@/types"; // Ensure AppTheme is exported from your types or context
import { useAppTheme, type AppTheme } from "../../contexts/AppThemeProvider"; // Adjust path as needed

// --- Mock Data (assuming it's the same as before) ---
const MOCK_PROBLEMS: Problem[] = [
  {
    id: "p1",
    name: "Procrastination",
    isResolved: false,
    createdAt: new Date().toISOString(),
    taskIds: ["t1", "t2", "t3", "t4", "t5"],
  },
  {
    id: "p2",
    name: "Lack of Focus",
    isResolved: false,
    createdAt: new Date().toISOString(),
    taskIds: ["t6", "t7"],
  },
  {
    id: "p3",
    name: "Time Management",
    isResolved: false,
    createdAt: new Date().toISOString(),
    taskIds: [],
  },
  {
    id: "p4",
    name: "Stress",
    isResolved: false,
    createdAt: new Date().toISOString(),
    taskIds: ["t8"],
  },
];

interface MockTask extends Task {
  dueDateText: string;
}

const MOCK_TASKS: MockTask[] = [
  {
    id: "t1",
    problemId: "p1",
    name: "Prioritize tasks",
    isCompleted: false,
    createdAt: new Date().toISOString(),
    actionIds: [],
    routineActions: [],
    dueDateText: "Due Today",
  },
  {
    id: "t2",
    problemId: "p1",
    name: "Break down large tasks",
    isCompleted: false,
    createdAt: new Date().toISOString(),
    actionIds: [],
    routineActions: [],
    dueDateText: "Due Tomorrow",
  },
  {
    id: "t3",
    problemId: "p1",
    name: "Use time-blocking",
    isCompleted: false,
    createdAt: new Date().toISOString(),
    actionIds: [],
    routineActions: [],
    dueDateText: "Due in 2 days",
  },
  {
    id: "t4",
    problemId: "p1",
    name: "Eliminate distractions",
    isCompleted: false,
    createdAt: new Date().toISOString(),
    actionIds: [],
    routineActions: [],
    dueDateText: "Due in 3 days",
  },
  {
    id: "t5",
    problemId: "p1",
    name: "Review and adjust",
    isCompleted: false,
    createdAt: new Date().toISOString(),
    actionIds: [],
    routineActions: [],
    dueDateText: "Due in 4 days",
  },
  {
    id: "t6",
    problemId: "p2",
    name: "Meditate for 10 minutes",
    isCompleted: false,
    createdAt: new Date().toISOString(),
    actionIds: [],
    routineActions: [],
    dueDateText: "Daily",
  },
  {
    id: "t7",
    problemId: "p2",
    name: "Pomodoro Technique",
    isCompleted: false,
    createdAt: new Date().toISOString(),
    actionIds: [],
    routineActions: [],
    dueDateText: "For focus work",
  },
  {
    id: "t8",
    problemId: "p4",
    name: "Deep breathing exercises",
    isCompleted: false,
    createdAt: new Date().toISOString(),
    actionIds: [],
    routineActions: [],
    dueDateText: "When stressed",
  },
];
// --- End Mock Data ---

const ProblemChip = ({
  problem,
  onPress,
  isSelected,
}: {
  problem: Problem;
  onPress: () => void;
  isSelected: boolean;
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => chipStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isSelected ? styles.chipSelected : styles.chipDefault,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.chipText,
          isSelected ? styles.chipTextSelected : styles.chipTextDefault,
        ]}
      >
        {problem.name}
      </Text>
    </TouchableOpacity>
  );
};

// Updated TaskCard
const TaskCard = ({ task }: { task: MockTask }) => {
  const theme = useAppTheme();
  // No more isChecked state needed here if the card itself is just a button
  const styles = useMemo(() => taskCardStyles(theme), [theme]); // Removed isChecked from dependencies

  const handleNavigateToActions = () => {
    router.push({
      pathname: "/actions",
      params: { taskId: task.id, problemId: task.problemId },
    });
  };

  return (
    // The entire card is a TouchableOpacity for navigation
    <TouchableOpacity style={styles.taskCard} onPress={handleNavigateToActions}>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{task.name}</Text>
        <Text style={styles.taskDueDate}>{task.dueDateText}</Text>
      </View>
      {/* Replace checkbox with a chevron icon */}
      <View style={styles.chevronContainer}>
        <Ionicons
          name="chevron-forward-outline"
          size={24}
          color={theme.onSurfaceVariant}
        />
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => getScreenStyles(theme), [theme]);

  const [problems, setProblems] = useState<Problem[]>(MOCK_PROBLEMS);
  const [tasks, setTasks] = useState<MockTask[]>(MOCK_TASKS);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(
    MOCK_PROBLEMS.length > 0 ? MOCK_PROBLEMS[0].id : null
  );

  const filteredTasks = useMemo(() => {
    if (!selectedProblemId) return [];
    return tasks.filter((task) => task.problemId === selectedProblemId);
  }, [selectedProblemId, tasks]);

  const renderProblemChip = useCallback(
    ({ item }: { item: Problem }) => (
      <ProblemChip
        problem={item}
        onPress={() => setSelectedProblemId(item.id)}
        isSelected={item.id === selectedProblemId}
      />
    ),
    [selectedProblemId]
  );

  const renderTaskCard = useCallback(
    ({ item }: { item: MockTask }) => <TaskCard task={item} />,
    []
  );

  const handleAddProblem = () => {
    console.log("Add Problem button pressed");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Problems</Text>
        <TouchableOpacity onPress={handleAddProblem}>
          <Ionicons name="add-circle-outline" size={30} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.chipsContainer}>
        <FlatList
          data={problems}
          renderItem={renderProblemChip}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsListContent}
        />
      </View>

      {selectedProblemId &&
        problems.find((p) => p.id === selectedProblemId) && (
          <Text style={styles.tasksHeader}>
            Tasks for {problems.find((p) => p.id === selectedProblemId)?.name}
          </Text>
        )}

      <FlatList
        data={filteredTasks}
        renderItem={renderTaskCard}
        keyExtractor={(item) => item.id}
        style={styles.taskList}
        contentContainerStyle={styles.taskListContent}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>
            No tasks for this problem yet.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

// --- Styles ---
const getScreenStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
      backgroundColor: theme.surface,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.onSurface,
    },
    chipsContainer: {
      paddingVertical: 10,
      paddingLeft: 10,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.outlineVariant,
    },
    chipsListContent: {
      paddingRight: 10,
    },
    tasksHeader: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.onSurfaceVariant,
      paddingHorizontal: 20,
      marginTop: 20,
      marginBottom: 10,
    },
    taskList: {
      flex: 1,
    },
    taskListContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    emptyListText: {
      textAlign: "center",
      marginTop: 50,
      fontSize: 16,
      color: theme.onSurfaceVariant,
    },
  });

const chipStyles = (theme: AppTheme) =>
  StyleSheet.create({
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginHorizontal: 6,
      borderWidth: 1,
    },
    chipDefault: {
      backgroundColor: theme.surfaceContainerHigh,
      borderColor: theme.outlineVariant,
    },
    chipSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    chipText: {
      fontSize: 14,
      fontWeight: "500",
    },
    chipTextDefault: {
      color: theme.onSurfaceVariant,
    },
    chipTextSelected: {
      color: theme.onPrimary,
    },
  });

// Updated taskCardStyles
const taskCardStyles = (theme: AppTheme) =>
  StyleSheet.create({
    taskCard: {
      backgroundColor: theme.surfaceContainer,
      borderRadius: 12,
      paddingVertical: 15,
      paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.outlineVariant,
    },
    taskInfo: {
      flex: 1, // Allows text to take up available space
    },
    taskTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.onSurface,
      marginBottom: 3,
    },
    taskDueDate: {
      fontSize: 13,
      color: theme.onSurfaceVariant,
    },
    chevronContainer: {
      // Renamed from checkboxContainer for clarity
      paddingLeft: 16, // Space between text and chevron
      justifyContent: "center", // Align chevron vertically if needed
      alignItems: "center",
    },
    // Removed checkbox and checkboxChecked styles
  });
