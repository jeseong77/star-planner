// app/(tabs)/index.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, ActivityIndicator, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Problem, Task } from '@/types';
import { useAppTheme, type AppTheme } from '../../contexts/AppThemeProvider';
import { ProblemCustomHeader } from '../../components/ProblemCustomHeader';
import { TaskItems } from '../../components/TaskItem';
import { useAppStore } from '../../store/appStore'; // Ensure this path is correct

export default function HomeScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => getScreenStyles(theme), [theme]);

  // --- Zustand State and Actions ---
  // Select individual slices of state. This is crucial to prevent unnecessary re-renders.
  const storeProblems = useAppStore(state => state.problems);
  const storeTasks = useAppStore(state => state.tasks);
  // For actions or functions from the store, the reference is typically stable.
  const hydrateFromDB = useAppStore(state => state.hydrateFromDB);
  // Use a part of the state that indicates hydration is complete.
  // `situation` is initialized to `null` and populated by `hydrateFromDB`.
  // So, `situation !== null` can be a good indicator that hydration has occurred.
  const isDataLoaded = useAppStore(state => state.situation !== null);


  const [initializationAttempted, setInitializationAttempted] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);

  // --- Data Hydration ---
  useEffect(() => {
    // Only attempt to hydrate once
    if (!initializationAttempted) {
      hydrateFromDB().finally(() => {
        setInitializationAttempted(true);
      });
    }
  }, [hydrateFromDB, initializationAttempted]); // hydrateFromDB is stable

  // --- Derived Data ---
  // Memoize the conversion from Record to Array
  const problemsArray = useMemo(() => Object.values(storeProblems), [storeProblems]);
  const tasksArray = useMemo(() => Object.values(storeTasks), [storeTasks]);

  // --- Effect to Set Initial Selected Problem ---
  useEffect(() => {
    // Ensure data loading has been attempted and is considered complete,
    // and problems are available, and no problem is currently selected.
    if (initializationAttempted && isDataLoaded && problemsArray.length > 0 && selectedProblemId === null) {
      setSelectedProblemId(problemsArray[0].id);
    }
    // If, after loading, the problems array becomes empty (e.g., all problems deleted)
    // and a problem was previously selected, reset it.
    else if (initializationAttempted && isDataLoaded && problemsArray.length === 0 && selectedProblemId !== null) {
      setSelectedProblemId(null);
    }
  }, [initializationAttempted, isDataLoaded, problemsArray, selectedProblemId]);

  // --- Filtered Tasks & Selected Problem ---
  const filteredTasks = useMemo(() => {
    if (!selectedProblemId) return [];
    return tasksArray.filter((task) => task.problemId === selectedProblemId);
  }, [selectedProblemId, tasksArray]);

  const selectedProblem = useMemo(() => {
    if (!selectedProblemId) return undefined;
    return problemsArray.find((p) => p.id === selectedProblemId);
  }, [selectedProblemId, problemsArray]);

  // --- Event Handlers ---
  const handleAddProblem = async () => {
    console.log("Add Problem button pressed - to be implemented with store action");
    // Example:
    // const addProblemAction = useAppStore.getState().addProblemToSituation;
    // const newProblem: Problem = {
    //   id: Crypto.randomUUID(), // Use a robust ID generator like expo-crypto
    //   name: "Newly Added Problem",
    //   isResolved: false,
    //   createdAt: new Date().toISOString(),
    //   taskIds: [],
    // };
    // await addProblemAction(newProblem);
    // setSelectedProblemId(newProblem.id); // Optionally select the new problem
  };

  const handleSelectProblem = (id: string) => {
    setSelectedProblemId(id);
  };

  // --- Loading State ---
  // Show loading if initialization hasn't been attempted yet,
  // OR if it has been attempted but data isn't considered loaded yet AND there are no problems to display.
  // This prevents a flash of "no problems" if problems are loading.
  if (!initializationAttempted || (!isDataLoaded && problemsArray.length === 0)) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 10, color: theme.onBackground }}>Loading data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <ProblemCustomHeader
        problems={problemsArray}
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
    centered: { // Added for the loading indicator
      justifyContent: 'center',
      alignItems: 'center',
    },
  });