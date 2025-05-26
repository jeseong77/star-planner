// components/TaskItem.tsx
import React, { useMemo, useCallback } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Problem, Task } from '@/types'; // Ensure Task is imported
import { useAppTheme, type AppTheme } from '../contexts/AppThemeProvider';

// MockTask interface removed

// --- TaskCard (내부 컴포넌트) ---
interface TaskCardProps {
    task: Task; // Changed from MockTask to Task
}

const taskCardStyles = (theme: AppTheme) =>
    StyleSheet.create({
        taskCard: {
            backgroundColor: theme.surfaceContainer,
            borderRadius: 12,
            paddingVertical: 15,
            paddingHorizontal: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.outlineVariant,
        },
        taskInfo: {
            flex: 1,
        },
        taskTitle: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.onSurface,
            // marginBottom: 3, // Removed as dueDateText is gone
        },
        // taskDueDate style removed
        chevronContainer: {
            paddingLeft: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    const theme = useAppTheme();
    const styles = useMemo(() => taskCardStyles(theme), [theme]);

    const handleNavigateToActions = () => {
        router.push({
            pathname: '/actions', // actions 스크린 경로 확인 및 수정 필요
            params: { taskId: task.id, problemId: task.problemId },
        });
    };

    return (
        <TouchableOpacity style={styles.taskCard} onPress={handleNavigateToActions}>
            <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{task.name}</Text>
                {/* <Text style={styles.taskDueDate}>{task.dueDateText}</Text> removed */}
            </View>
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
// --- End TaskCard ---


// --- TaskItems (메인 컴포넌트) ---
interface TaskItemsProps {
    tasks: Task[]; // Changed from MockTask[] to Task[]
    selectedProblem: Problem | undefined;
}

const getTaskListStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flex: 1, // 리스트가 확장될 수 있도록 flex: 1 추가
        },
        tasksHeader: {
            fontSize: 18,
            fontWeight: '600',
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
            textAlign: 'center',
            marginTop: 50,
            fontSize: 16,
            color: theme.onSurfaceVariant,
        },
    });

export const TaskItems: React.FC<TaskItemsProps> = ({ tasks, selectedProblem }) => {
    const theme = useAppTheme();
    const styles = useMemo(() => getTaskListStyles(theme), [theme]);

    const renderTaskCard = useCallback(
        ({ item }: { item: Task }) => <TaskCard task={item} />, // Changed item type to Task
        []
    );

    return (
        <View style={styles.container}>
            {selectedProblem && (
                <Text style={styles.tasksHeader}>
                    Tasks for {selectedProblem.name}
                </Text>
            )}
            <FlatList
                data={tasks}
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
        </View>
    );
};