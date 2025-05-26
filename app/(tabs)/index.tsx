// app/(tabs)/index.tsx
import React, { useState, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Problem, Task } from '@/types'; // Added Task import
import { useAppTheme, type AppTheme } from '../../contexts/AppThemeProvider';
import { ProblemCustomHeader } from '../../components/ProblemCustomHeader';
import { TaskItems } from '../../components/TaskItem'; // Removed MockTask import

// --- Mock Data ---
const MOCK_PROBLEMS: Problem[] = [
  { id: "p1", name: "Procrastination", isResolved: false, createdAt: new Date().toISOString(), taskIds: ["t1", "t2", "t3", "t4", "t5"], },
  { id: "p2", name: "Lack of Focus", isResolved: false, createdAt: new Date().toISOString(), taskIds: ["t6", "t7"], },
  { id: "p3", name: "Time Management", isResolved: false, createdAt: new Date().toISOString(), taskIds: [], },
  { id: "p4", name: "Stress", isResolved: false, createdAt: new Date().toISOString(), taskIds: ["t8"], },
];

const MOCK_TASKS: Task[] = [ // Changed to Task[]
  { id: "t1", problemId: "p1", name: "Prioritize tasks", isCompleted: false, createdAt: new Date().toISOString(), actionIds: [], routineActions: [] },
  { id: "t2", problemId: "p1", name: "Break down large tasks", isCompleted: false, createdAt: new Date().toISOString(), actionIds: [], routineActions: [] },
  { id: "t3", problemId: "p1", name: "Use time-blocking", isCompleted: false, createdAt: new Date().toISOString(), actionIds: [], routineActions: [] },
  { id: "t4", problemId: "p1", name: "Eliminate distractions", isCompleted: false, createdAt: new Date().toISOString(), actionIds: [], routineActions: [] },
  { id: "t5", problemId: "p1", name: "Review and adjust", isCompleted: false, createdAt: new Date().toISOString(), actionIds: [], routineActions: [] },
  { id: "t6", problemId: "p2", name: "Meditate for 10 minutes", isCompleted: false, createdAt: new Date().toISOString(), actionIds: [], routineActions: [] },
  { id: "t7", problemId: "p2", name: "Pomodoro Technique", isCompleted: false, createdAt: new Date().toISOString(), actionIds: [], routineActions: [] },
  { id: "t8", problemId: "p4", name: "Deep breathing exercises", isCompleted: false, createdAt: new Date().toISOString(), actionIds: [], routineActions: [] },
];
// --- End Mock Data ---


export default function HomeScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => getScreenStyles(theme), [theme]);

  const [problems, setProblems] = useState<Problem[]>(MOCK_PROBLEMS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS); // Changed to Task[]
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(
    MOCK_PROBLEMS.length > 0 ? MOCK_PROBLEMS[0].id : null
  );

  const filteredTasks = useMemo(() => {
    if (!selectedProblemId) return [];
    return tasks.filter((task) => task.problemId === selectedProblemId);
  }, [selectedProblemId, tasks]);

  const selectedProblem = useMemo(() => {
    return problems.find((p) => p.id === selectedProblemId);
  }, [selectedProblemId, problems]);

  const handleAddProblem = () => {
    console.log("Add Problem button pressed");
    // 여기에 문제 추가 로직 구현
  };

  const handleSelectProblem = (id: string) => {
    setSelectedProblemId(id);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <ProblemCustomHeader
        problems={problems}
        selectedProblemId={selectedProblemId}
        onSelectProblem={handleSelectProblem}
        onAddProblem={handleAddProblem}
      />

      <TaskItems
        tasks={filteredTasks}
        selectedProblem={selectedProblem}
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
  });