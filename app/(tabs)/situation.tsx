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
import TaskItem from '../../components/TaskItem';
import type { MockTask } from '../../components/TaskItem';

import AddProblemBottomSheet from '@/components/AddProblemBottomSheet';
import { useAppStore } from '@/store/appStore';
import { useAppTheme, type AppTheme } from '../../contexts/AppThemeProvider';
import type { Problem, Task } from '../../types';

export default function Situation() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => getStyles(theme, insets.bottom), [theme, insets.bottom]);

  const situation = useAppStore(state => state.situation);
  const storeProblems = useAppStore(state => state.problems);
  const storeTasks = useAppStore(state => state.tasks);
  const hydrateFromDB = useAppStore(state => state.hydrateFromDB);
  const setSituationDescription = useAppStore(state => state.setSituationDescription);
  const isLoadingStore = useAppStore(state => state.situation === undefined);

  const [tempDescription, setTempDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [expandedProblemIds, setExpandedProblemIds] = useState<string[]>([]);
  const isAddProblemSheetOpen = useSharedValue(false);

  const handlePresentAddProblemSheet = useCallback(() => {
    isAddProblemSheetOpen.value = true;
  }, [isAddProblemSheetOpen]);

  const handleCloseAddProblemSheet = useCallback(() => {
    isAddProblemSheetOpen.value = false;
  }, [isAddProblemSheetOpen]);

  useEffect(() => {
    hydrateFromDB();
  }, [hydrateFromDB]);

  useEffect(() => {
    const currentDescription = situation?.description || '';
    if (situation) {
      if (tempDescription !== currentDescription && !isEditingDescription) {
        setTempDescription(currentDescription);
      }
    } else if (!isLoadingStore && tempDescription !== '') {
      setTempDescription('');
    }
  }, [situation, isLoadingStore, isEditingDescription]);

  const handleToggleProblemExpand = (problemId: string) => {
    setExpandedProblemIds(prev =>
      prev.includes(problemId) ? prev.filter(id => id !== problemId) : [...prev, problemId]
    );
  };

  const handleSaveDescription = async () => {
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

  const problemsToRender: Problem[] = useMemo(() => {
    if (!situation || !storeProblems) return [];
    return situation.problemIds
      .map(id => storeProblems[id]) // This may return (Problem | undefined)[]
      // MODIFICATION: Use an explicit type guard
      .filter((p): p is Problem => p !== undefined && p !== null);
  }, [situation, storeProblems]);

  const getTasksForProblem = useCallback((problemId: string): MockTask[] => {
    const problem = storeProblems[problemId];
    if (!problem || !storeTasks) return [];

    return problem.taskIds
      .map(taskId => storeTasks[taskId]) // This may return (Task | undefined)[]
      // MODIFICATION: Use an explicit type guard
      .filter((t): t is Task => t !== undefined && t !== null)
      .map(t => { // t is now correctly typed as Task
        const taskForDisplay: MockTask = {
          ...t,
          iconName: (t as any).iconName || 'list-outline',
        };
        return taskForDisplay;
      });
  }, [storeProblems, storeTasks]);

  if (isLoadingStore) {
    return (
      <View style={[styles.screenContainer, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 10, color: theme.onBackground }}>Loading situation...</Text>
      </View>
    );
  }

  if (!situation) {
    return (
      <View style={[styles.screenContainer, styles.centered]}>
        <Text style={[styles.descriptionText, { marginBottom: 20, textAlign: 'center' }]}>
          Welcome to STAR Planner!{'\n'}Let's define your current situation.
        </Text>
        {!isEditingDescription && (
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton, { width: '90%', marginBottom: 20 }]}
            onPress={() => {
              setTempDescription('');
              setIsEditingDescription(true);
            }}>
            <Text style={styles.saveButtonText}>Set Situation Description</Text>
          </TouchableOpacity>
        )}
        {isEditingDescription && (
          <View style={{ width: '90%', marginTop: 0 }}>
            <Text style={[styles.sectionTitle, { marginBottom: 10, textAlign: 'center' }]}>Describe Your Situation</Text>
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
              <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => {
                setIsEditingDescription(false);
                setTempDescription('');
              }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSaveDescription}>
                <Text style={styles.saveButtonText}>Save Description</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <Text style={[styles.descriptionText, { fontSize: 14, opacity: 0.7, textAlign: 'center' }]}>
          After describing your situation, you can add specific problems you want to address.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen
        options={{
          title: 'Situation',
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
            {!isEditingDescription && (
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
                placeholder="Describe your current situation and overall goals..."
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

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Problems</Text>
            {situation?.description ? (
              <TouchableOpacity style={styles.addProblemButton} onPress={handlePresentAddProblemSheet}>
                <Ionicons name="add-circle-outline" size={22} color={theme.primary} />
                <Text style={styles.addProblemButtonText}>Add Problem</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.emptyStateTextSmall}>Set a description first to add problems.</Text>
            )}
          </View>
          {problemsToRender.length === 0 && situation?.description ? (
            <Text style={styles.emptyStateText}>No problems defined yet. Tap "Add Problem" to get started.</Text>
          ) : null}
          {problemsToRender.map(problem => {
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
      </ScrollView>

      <AddProblemBottomSheet
        isOpen={isAddProblemSheetOpen}
        onClose={handleCloseAddProblemSheet}
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
    paddingBottom: bottomInset + 16,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: theme.surface,
    marginTop: 12,
    marginHorizontal: 10,
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
    fontWeight: '600',
    color: theme.onSurface,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: theme.primary,
    fontWeight: '500',
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
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: theme.onSurfaceVariant,
    textAlign: 'right',
    marginTop: 4,
  },
  editActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  cancelButton: {},
  cancelButtonText: {
    color: theme.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: theme.onPrimary,
    fontWeight: '500',
    fontSize: 16,
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
    fontSize: 16,
    color: theme.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyStateTextSmall: {
    fontSize: 14,
    color: theme.onSurfaceVariant,
    fontStyle: 'italic',
  },
});