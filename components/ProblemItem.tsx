// ProblemItem.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAppTheme, type AppTheme } from '@/contexts/AppThemeProvider';
import type { Problem, Task } from '@/types'; // Import Task type
import { TaskCard } from './TaskItem'; // Import TaskCard (assuming TaskItem.tsx exports it)

interface ProblemItemProps {
    problem: Problem;
    tasks: Task[]; // Changed from MockTask[] to Task[]
    isExpanded: boolean;
    onToggleExpand: () => void;
}

const getProblemItemStyles = (theme: AppTheme) => StyleSheet.create({
    problemCard: {
        backgroundColor: theme.surfaceContainerHigh,
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
    },
    problemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    problemInfo: {
        // This View wraps the Text elements for better layout control if needed
        // If only text, it might not be strictly necessary, but good for structure
        flex: 1, // Allow text content to take available space before chevron
    },
    problemName: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.onSurface,
    },
    problemTaskCount: {
        fontSize: 14,
        color: theme.onSurfaceVariant,
        marginTop: 2, // Add a little space between name and task count
    },
    tasksListContainer: {
        marginTop: 16, // Increased margin for better separation
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.outlineVariant,
    },
    // Styles for individual task items within ProblemItem are now handled by TaskCard itself
});

const ProblemItem: React.FC<ProblemItemProps> = ({ problem, tasks, isExpanded, onToggleExpand }) => {
    const theme = useAppTheme();
    const styles = useMemo(() => getProblemItemStyles(theme), [theme]);

    return (
        <View style={styles.problemCard}>
            <TouchableOpacity style={styles.problemHeader} onPress={onToggleExpand}>
                <View style={styles.problemInfo}>
                    {/* Removed an inner View as problemInfo can handle flex for the text block */}
                    <Text style={styles.problemName}>{problem.name}</Text>
                    <Text style={styles.problemTaskCount}>{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</Text>
                </View>
                <Ionicons name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"} size={24} color={theme.onSurfaceVariant} />
            </TouchableOpacity>
            {isExpanded && (
                <View style={styles.tasksListContainer}>
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </View>
            )}
        </View>
    );
};

export default ProblemItem;