// ProblemItem.tsx
import { Ionicons } from '@expo/vector-icons'; // Still needed for chevron icons
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAppTheme, type AppTheme } from '@/contexts/AppThemeProvider';
import type { Problem } from '@/types'; // Use the base Problem type
import TaskItem, { type MockTask } from './TaskItem';

interface ProblemItemProps {
    problem: Problem;
    tasks: MockTask[];
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
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.outlineVariant,
    },
});

const ProblemItem: React.FC<ProblemItemProps> = ({ problem, tasks, isExpanded, onToggleExpand }) => {
    const theme = useAppTheme();
    const styles = useMemo(() => getProblemItemStyles(theme), [theme]);

    return (
        <View style={styles.problemCard}>
            <TouchableOpacity style={styles.problemHeader} onPress={onToggleExpand}>
                <View style={styles.problemInfo}>
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

export default ProblemItem;