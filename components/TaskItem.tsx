// TaskItem.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import type { AppTheme } from '@/contexts/AppThemeProvider'; // Adjusted path based on your example
import type { Task } from '@/types'; // Adjusted path based on your example

// Extended Task Type: iconName is kept, dueDateText is removed.
export interface MockTask extends Task {
    iconName: keyof typeof Ionicons.glyphMap;
    // dueDateText: string; // Removed as tasks do not have due dates
}

interface TaskItemProps {
    task: MockTask;
    theme: AppTheme;
}

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
    // taskDueDate style is no longer needed as dueDateText is removed.
    // taskDueDate: {
    //   fontSize: 12,
    //   color: theme.onSurfaceVariant,
    //   marginTop: 2,
    // },
});

const TaskItem: React.FC<TaskItemProps> = ({ task, theme }) => {
    const styles = useMemo(() => getTaskItemStyles(theme), [theme]);

    const handlePress = () => {
        // Ensure problemId is available on the task object if needed for navigation
        router.push({ pathname: '/actions', params: { taskId: task.id, problemId: task.problemId } });
    };

    return (
        <TouchableOpacity style={styles.taskItemContainer} onPress={handlePress}>
            <Ionicons name={task.iconName} size={22} color={theme.primary} style={styles.taskIcon} />
            <View style={styles.taskTextContainer}>
                <Text style={styles.taskName}>{task.name}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={22} color={theme.onSurfaceVariant} />
        </TouchableOpacity>
    );
};

export default TaskItem;