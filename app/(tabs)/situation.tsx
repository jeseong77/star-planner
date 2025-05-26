import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ProblemItem from '../../components/ProblemItem';
import AddProblemBottomSheet from '@/components/AddProblemBottomSheet'; // Ensure this component is updated to use the new `addProblem` store action
import { useAppStore } from '@/store/appStore';
import { useAppTheme, type AppTheme } from '../../contexts/AppThemeProvider';
import type { Problem, Task } from '../../types';

export default function SituationScreen() { // Renamed component for clarity, ensure file name matches if it was 'Situation.tsx'
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => getStyles(theme, insets.bottom), [theme, insets.bottom]);

  // --- Zustand State and Actions ---
  const situation = useAppStore(state => state.situation);
  const storeProblems = useAppStore(state => state.problems);
  const storeTasks = useAppStore(state => state.tasks);
  const hydrateFromDB = useAppStore(state => state.hydrateFromDB);
  const setSituationDescription = useAppStore(state => state.setSituationDescription);
  // Corrected loading state: situation is initialized to null in the store
  const isLoadingStore = useAppStore(state => state.situation === null);
  const addProblem = useAppStore(state => state.addProblem); // Get the addProblem action

  // --- Local Component State ---
  const [tempDescription, setTempDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [expandedProblemIds, setExpandedProblemIds] = useState<string[]>([]);
  const isAddProblemSheetOpen = useSharedValue(false);
  const [hasHydrationBeenCalled, setHasHydrationBeenCalled] = useState(false);


  // --- Effects ---
  // Call hydration once on mount
  useEffect(() => {
    if (!hasHydrationBeenCalled) {
      hydrateFromDB();
      setHasHydrationBeenCalled(true);
    }
  }, [hydrateFromDB, hasHydrationBeenCalled]);

  // Update tempDescription when situation changes or editing stops
  useEffect(() => {
    const currentDescription = situation?.description || '';
    if (situation && !isLoadingStore) { // Ensure situation is loaded
      if (tempDescription !== currentDescription && !isEditingDescription) {
        setTempDescription(currentDescription);
      }
    } else if (!isLoadingStore && tempDescription !== '') {
      // If situation becomes null (e.g. error state, though unlikely here) and not loading, clear temp
      // setTempDescription('');
    }
  }, [situation, isLoadingStore, isEditingDescription]); // Removed tempDescription from deps to avoid loop

  // --- Event Handlers ---
  const handlePresentAddProblemSheet = useCallback(() => {
    isAddProblemSheetOpen.value = true;
  }, [isAddProblemSheetOpen]);

  const handleCloseAddProblemSheet = useCallback(() => {
    isAddProblemSheetOpen.value = false;
  }, [isAddProblemSheetOpen]);

  const handleToggleProblemExpand = (problemId: string) => {
    setExpandedProblemIds(prev =>
      prev.includes(problemId) ? prev.filter(id => id !== problemId) : [...prev, problemId]
    );
  };

  const handleSaveDescription = async () => {
    if (!situation) return; // Should not happen if UI is enabled
    try {
      await setSituationDescription(tempDescription.slice(0, 500));
      setIsEditingDescription(false);
    } catch (error) {
      console.error("Failed to save description:", error);
    }
  };

  const handleCancelEditDescription = () => {
    setTempDescription(situation?.description || '');
    setIsEditingDescription(false);
  };

  // --- Data Derivation ---
  // Problems to render now come directly from storeProblems, as all problems belong to the single situation.
  const problemsToRender: Problem[] = useMemo(() => {
    if (isLoadingStore || !storeProblems) return []; // Wait for loading and ensure storeProblems exists
    return Object.values(storeProblems).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Convert record to array, optionally sort
  }, [isLoadingStore, storeProblems]);

  const getTasksForProblem = useCallback((problemId: string): Task[] => {
    const problem = storeProblems[problemId];
    if (!problem || !storeTasks) return [];

    // problem.taskIds is still expected to be populated in the store by hydrateFromDB or relevant actions
    return (problem.taskIds || [])
      .map(taskId => storeTasks[taskId])
      .filter((t): t is Task => t !== undefined && t !== null);
  }, [storeProblems, storeTasks]);


  // --- Render Logic ---
  if (isLoadingStore && !hasHydrationBeenCalled) { // Show loading initially until hydration is called
    return (
      <View style={[styles.screenContainer, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 10, color: theme.onBackground }}>Loading situation...</Text>
      </View>
    );
  }

  // Screen for initial situation setup if description is missing
  // This part assumes that a situation object exists after loading, even if description is empty
  if (!situation?.description && !isEditingDescription && !isLoadingStore) {
    return (
      <View style={[styles.screenContainer, styles.centered]}>
        <Text style={[styles.descriptionText, { marginBottom: 20, textAlign: 'center' }]}>
          Welcome to STAR Planner!{'\n'}Let's define your current situation.
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton, { width: '90%', marginBottom: 20 }]}
          onPress={() => {
            setTempDescription(situation?.description || ''); // Initialize with current or empty
            setIsEditingDescription(true);
          }}>
          <Text style={styles.saveButtonText}>Set Situation Description</Text>
        </TouchableOpacity>
        {/* Input fields for description shown when isEditingDescription is true, handled below */}
      </View>
    );
  }


  return (
    <View style={styles.screenContainer}>
      <Stack.Screen
        options={{
          title: 'Situation', // Or a dynamic title
          headerShown: true,
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.onSurface,
          headerTitleStyle: { color: theme.onSurface, fontWeight: '600' },
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Description</Text>
            {!isEditingDescription && situation && ( // Ensure situation object exists
              <TouchableOpacity style={styles.editButton} onPress={() => {
                setTempDescription(situation?.description || '');
                setIsEditingDescription(true);
              }}>
                <Ionicons name="pencil-outline" size={18} color={theme.primary} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          {isEditingDescription ? (
            <View>
              <TextInput
                style={styles.textInput}
                value={tempDescription}
                onChangeText={setTempDescription}
                multiline
                maxLength={500}
                autoFocus
                placeholderTextColor={theme.onSurfaceVariant}
                selectionColor={theme.primary}
                placeholder="What is your current situation? What are your overarching goals?"
              />
              <Text style={styles.charCount}>{tempDescription.length}/500</Text>
              <View style={styles.editActionsContainer}>
                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancelEditDescription}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSaveDescription}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.descriptionText}>
              {situation?.description || "No description set. Tap 'Edit' to add one."}
            </Text>
          )}
        </View>

        {(situation?.description || isEditingDescription) && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Problems</Text>
              {situation ? (
                <TouchableOpacity style={styles.addProblemButton} onPress={handlePresentAddProblemSheet}>
                  <Ionicons name="add-circle-outline" size={22} color={theme.primary} />
                  <Text style={styles.addProblemButtonText}>Add Problem</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {problemsToRender.length === 0 && situation?.description ? (
              <Text style={styles.emptyStateText}>No problems defined yet. Tap "Add Problem" to get started.</Text>
            ) : null}
            {problemsToRender.map(problem => {
              if (!problem) return null;
              const relevantTasks = getTasksForProblem(problem.id);
              return (
                <ProblemItem
                  key={problem.id}
                  problem={problem}
                  tasks={relevantTasks}
                  isExpanded={expandedProblemIds.includes(problem.id)}
                  onToggleExpand={() => handleToggleProblemExpand(problem.id)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      <AddProblemBottomSheet
        isOpen={isAddProblemSheetOpen}
        onClose={handleCloseAddProblemSheet}
      // This component will need to be updated to use:
      // const addProblemAction = useAppStore(state => state.addProblem);
      // and then call addProblemAction("New Problem Name")
      />
    </View>
  );
}

const getStyles = (theme: AppTheme, bottomInset: number) => StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: bottomInset + 16, // For scrollable content to not be hidden by bottom bars/nav
  },
  sectionContainer: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: theme.surface,
    marginTop: 12,
    borderRadius: Platform.OS === 'ios' ? 12 : 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600', // Semibold
    color: theme.onSurface,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    // backgroundColor: theme.surfaceContainerLowest, // Subtle background for interactable elements
    // borderRadius: 16,
  },
  editButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: theme.primary,
    fontWeight: '500', // Medium
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.onSurfaceVariant,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.onSurface,
    backgroundColor: theme.surfaceContainerLow,
    borderColor: theme.outline,
    borderWidth: 1,
    borderRadius: 8,
    paddingTop: 12, // Ensure padding is consistent
    paddingBottom: 12,
    paddingHorizontal: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: theme.onSurfaceVariant,
    textAlign: 'right',
    marginTop: 4,
    paddingRight: 4,
  },
  editActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16, // Increased margin
    gap: 10, // Standardized gap
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16, // Adjusted padding
    borderRadius: 20, // Fully rounded pill shape
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    // No background, text color is primary
  },
  cancelButtonText: {
    color: theme.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: theme.primary,
  },
  saveButtonText: {
    color: theme.onPrimary,
    fontWeight: '500',
    fontSize: 14, // Consistent font size for button text
  },
  addProblemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addProblemButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: theme.primary,
    fontWeight: '500',
  },
  emptyStateText: {
    fontSize: 15, // Slightly adjusted
    color: theme.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: 24, // Adjusted padding
    lineHeight: 22,
  },
  emptyStateTextSmall: {
    fontSize: 14,
    color: theme.onSurfaceVariant,
    fontStyle: 'italic',
    opacity: 0.8, // Make it less prominent
  },
});