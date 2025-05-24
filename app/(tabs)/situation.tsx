import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// Import useSafeAreaInsets and EdgeInsets type
import { useSafeAreaInsets, type EdgeInsets } from 'react-native-safe-area-context';

import { useAppTheme, type AppTheme } from '../../contexts/AppThemeProvider'; // Adjust path
import type { Problem, Task } from '../../types'; // Adjust path

// --- Mock Data & Extended Types (as before) ---
interface MockProblem extends Problem {
  iconName: keyof typeof Ionicons.glyphMap;
}
interface MockTask extends Task {
  iconName: keyof typeof Ionicons.glyphMap;
  dueDateText: string;
}

const MOCK_SITUATION_DESCRIPTION = "I'm currently overweight and want to improve my health. My goal is to lose 20 pounds in the next 3 months through a combination of diet and exercise. I need a structured plan to track my progress and stay motivated.";
const MOCK_PROBLEMS_DATA: MockProblem[] = [
  { id: 'p1', name: 'Obesity', isResolved: false, createdAt: new Date().toISOString(), taskIds: ['t1', 't2', 't3', 't4'], iconName: 'barbell-outline' },
  { id: 'p2', name: 'Professional Skills', isResolved: false, createdAt: new Date().toISOString(), taskIds: ['t5', 't6'], iconName: 'school-outline' },
  { id: 'p3', name: 'Financial Debt', isResolved: false, createdAt: new Date().toISOString(), taskIds: ['t7'], iconName: 'cash-outline' },
];
const MOCK_TASKS_DATA: MockTask[] = [
  { id: 't1', problemId: 'p1', name: 'Follow a balanced diet plan', isCompleted: false, createdAt: new Date().toISOString(), actionIds: [], routineActions: [], iconName: 'restaurant-outline', dueDateText: 'Due: In 2 days' },
  { id: 't2', problemId: 'p1', name: 'Exercise 30 mins daily', isCompleted: false, createdAt: new Date().toISOString(), actionIds: [], routineActions: [], iconName: 'walk-outline', dueDateText: 'Due: Tomorrow' },
  { id: 't3', problemId: 'p1', name: 'Track weight weekly', isCompleted: false, createdAt: new Date().toISOString(), actionIds: [], routineActions: [], iconName: 'scale-outline', dueDateText: 'Due: In 5 days' },
  { id: 't4', problemId: 'p1', name: 'Drink 8 glasses of water', isCompleted: true, createdAt: new Date().toISOString(), actionIds: [], routineActions: [], iconName: 'water-outline', dueDateText: 'Due: Today' },
  { id: 't5', problemId: 'p2', name: 'Complete online course', isCompleted: false, createdAt: new Date().toISOString(), actionIds: [], routineActions: [], iconName: 'laptop-outline', dueDateText: 'Due: In 3 weeks' },
  { id: 't6', problemId: 'p2', name: 'Network with professionals', isCompleted: false, createdAt: new Date().toISOString(), actionIds: [], routineActions: [], iconName: 'people-outline', dueDateText: 'Ongoing' },
  { id: 't7', problemId: 'p3', name: 'Create a budget plan', isCompleted: false, createdAt: new Date().toISOString(), actionIds: [], routineActions: [], iconName: 'document-text-outline', dueDateText: 'Due: Next Monday' },
];

// --- TaskItem and ProblemItem components (remain the same as before, they use theme passed or via hook) ---
const TaskItem = ({ task, theme }: { task: MockTask, theme: AppTheme }) => {
  const styles = useMemo(() => getTaskItemStyles(theme), [theme]);
  const handlePress = () => {
    router.push({ pathname: '/actions', params: { taskId: task.id, problemId: task.problemId } });
  };
  return (
    <TouchableOpacity style={styles.taskItemContainer} onPress={handlePress}>
      <Ionicons name={task.iconName} size={22} color={theme.primary} style={styles.taskIcon} />
      <View style={styles.taskTextContainer}>
        <Text style={styles.taskName}>{task.name}</Text>
        <Text style={styles.taskDueDate}>{task.dueDateText}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={22} color={theme.onSurfaceVariant} />
    </TouchableOpacity>
  );
};

const ProblemItem = ({ problem, tasks, isExpanded, onToggleExpand }: {
  problem: MockProblem,
  tasks: MockTask[],
  isExpanded: boolean,
  onToggleExpand: () => void,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => getProblemItemStyles(theme), [theme]);

  return (
    <View style={styles.problemCard}>
      <TouchableOpacity style={styles.problemHeader} onPress={onToggleExpand}>
        <View style={styles.problemInfo}>
          <Ionicons name={problem.iconName} size={24} color={theme.primary} style={styles.problemIcon} />
          <View>
            <Text style={styles.problemName}>{problem.name}</Text>
            <Text style={styles.problemTaskCount}>{tasks.length} tasks</Text>
          </View>
        </View>
        <Ionicons name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"} size={24} color={theme.onSurfaceVariant} />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.tasksListContainer}>
          {tasks.map(task => <TaskItem key={task.id} task={task} theme={theme} />)}
        </View>
      )}
    </View>
  );
};


export default function SituationScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets(); // Get all insets
  // Pass only the bottom inset to the style generating function, or the whole insets object
  const styles = useMemo(() => getScreenStyles(theme, insets.bottom), [theme, insets.bottom]);

  const [description, setDescription] = useState(MOCK_SITUATION_DESCRIPTION);
  const [tempDescription, setTempDescription] = useState(MOCK_SITUATION_DESCRIPTION);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const [problemsData, setProblemsData] = useState<MockProblem[]>(MOCK_PROBLEMS_DATA);
  const [tasksData, setTasksData] = useState<MockTask[]>(MOCK_TASKS_DATA);
  const [expandedProblemIds, setExpandedProblemIds] = useState<string[]>([]);

  const handleToggleProblemExpand = (problemId: string) => {
    setExpandedProblemIds(prev =>
      prev.includes(problemId) ? prev.filter(id => id !== problemId) : [...prev, problemId]
    );
  };

  const handleSaveDescription = () => {
    setDescription(tempDescription.slice(0, 500));
    setIsEditingDescription(false);
  };

  const handleCancelEditDescription = () => {
    setTempDescription(description);
    setIsEditingDescription(false);
  };

  const handleAddProblem = () => {
    console.log("Add Problem pressed");
  };

  const renderProblemItem = ({ item }: { item: MockProblem }) => {
    const relevantTasks = tasksData.filter(task => task.problemId === item.id);
    return (
      <ProblemItem
        problem={item}
        tasks={relevantTasks}
        isExpanded={expandedProblemIds.includes(item.id)}
        onToggleExpand={() => handleToggleProblemExpand(item.id)}
      />
    );
  };

  return (
    // Changed SafeAreaView to View for the main screen container
    <View style={styles.screenContainer}>
      <Stack.Screen
        options={{
          title: 'Situation',
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.onSurface,
          headerTitleStyle: {
            color: theme.onSurface,
            fontWeight: '600',
          },
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent} // Apply bottom padding here
        showsVerticalScrollIndicator={false}
      >
        {/* Description Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Description</Text>
            {!isEditingDescription && (
              <TouchableOpacity style={styles.editButton} onPress={() => { setTempDescription(description); setIsEditingDescription(true); }}>
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
            <Text style={styles.descriptionText}>{description}</Text>
          )}
        </View>

        {/* Problems Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Problems</Text>
            <TouchableOpacity style={styles.addProblemButton} onPress={handleAddProblem}>
              <Ionicons name="add-circle-outline" size={22} color={theme.primary} />
              <Text style={styles.addProblemButtonText}>Add Problem</Text>
            </TouchableOpacity>
          </View>
          {/* Using View to render problem items as FlatList inside ScrollView can cause performance issues
              and virtualization loss. For a small number of problems, mapping is okay.
              If problems list can be very long, consider a different structure or use SectionList.
              For this example, assuming problemsData isn't excessively long.
          */}
          {problemsData.map(problem => {
            const relevantTasks = tasksData.filter(task => task.problemId === problem.id);
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
    </View>
  );
}

// --- Styles ---
const getScreenStyles = (theme: AppTheme, bottomInset: number) => StyleSheet.create({ // Accept bottomInset
  screenContainer: { // Renamed from safeArea
    flex: 1,
    backgroundColor: theme.background,
    // The Stack navigator's header will handle the top safe area.
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: bottomInset + 16, // Add bottom inset plus some extra padding
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: theme.surface,
    marginTop: 8,
    borderRadius: Platform.OS === 'ios' ? 12 : 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20, // Adjusted from 22 for section titles
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
    paddingHorizontal: 24,
  },
  saveButtonText: {
    color: theme.onPrimary,
    fontWeight: '500',
    fontSize: 14,
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
});

const getProblemItemStyles = (theme: AppTheme) => StyleSheet.create({
  problemCard: {
    backgroundColor: theme.surfaceContainerHigh, // Slightly more elevated than section background
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    // borderWidth: 1, // Using surface color difference for elevation mainly
    // borderColor: theme.outlineVariant,
  },
  problemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  problemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  problemIcon: {
    marginRight: 12,
  },
  problemName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.onSurface,
  },
  problemTaskCount: {
    fontSize: 14,
    color: theme.onSurfaceVariant,
  },
  tasksListContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth, // Use hairlineWidth for subtle separators
    borderTopColor: theme.outlineVariant,
  },
});

const getTaskItemStyles = (theme: AppTheme) => StyleSheet.create({
  taskItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  taskIcon: {
    marginRight: 12,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    color: theme.onSurface,
  },
  taskDueDate: {
    fontSize: 12,
    color: theme.onSurfaceVariant,
    marginTop: 2,
  },
});