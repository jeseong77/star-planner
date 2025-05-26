// ProblemItem.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert, // Import Alert
    Platform,
} from 'react-native';
// Gesture Handler and Reanimated
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS, // To run JS functions from worklets (for Alert)
} from 'react-native-reanimated';

import { useAppTheme, type AppTheme } from '@/contexts/AppThemeProvider';
import { useAppStore } from '@/store/appStore';
import type { Problem, Task } from '@/types';
import { TaskCard } from './TaskItem';

interface ProblemItemProps {
    problem: Problem;
    tasks: Task[];
    isExpanded: boolean;
    onToggleExpand: () => void;
}

// --- Constants for Swipe Action ---
const TRASH_ICON_ONLY_SIZE = 24; // Size of the Ionicons trash icon itself
const CIRCULAR_BUTTON_PADDING = 10; // Padding around icon to make the circular button touch area larger
const CIRCULAR_BUTTON_DIAMETER = TRASH_ICON_ONLY_SIZE + CIRCULAR_BUTTON_PADDING * 2; // e.g., 24 + 20 = 44
const REVEAL_WIDTH = CIRCULAR_BUTTON_DIAMETER * 1.5; // Revealed area width: 44 * 1.5 = 66
const SWIPE_THRESHOLD = REVEAL_WIDTH / 2.5; // How far to swipe to snap open

const getProblemItemStyles = (theme: AppTheme) => StyleSheet.create({
    // Outermost container for managing swipe and potential marginBottom
    swipeableItemContainer: {
        marginBottom: 12,
        borderRadius: 12, // Match problemCard's borderRadius for seamless look
    },
    actionsContainer: { // Holds the delete button, positioned absolutely on the right
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: REVEAL_WIDTH,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center the button in the revealed area
    },
    deleteButton: {
        width: CIRCULAR_BUTTON_DIAMETER,
        height: CIRCULAR_BUTTON_DIAMETER,
        borderRadius: CIRCULAR_BUTTON_DIAMETER / 2,
        backgroundColor: theme.error, // Or theme.error itself
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonIcon: {
        color: theme.onError, // Icon color on error background
    },
    // This is the main content card that moves
    problemCardDraggable: {
        backgroundColor: theme.surfaceContainerHigh,
        borderRadius: 12,
        zIndex: 1, // Ensure draggable item is above actions container
    },
    // Styles for the content normally inside problemCard
    problemCardContent: {
        padding: 16,
    },
    problemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    problemInfo: {
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
        marginTop: 2,
    },
    tasksListContainer: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.outlineVariant,
    },
    addTaskButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        marginTop: 16,
        backgroundColor: theme.primaryContainer,
        borderRadius: 8,
    },
    addTaskButtonText: {
        color: theme.onPrimaryContainer,
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    addTaskInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 8,
        paddingHorizontal: 8,
        backgroundColor: theme.surfaceContainerHighest,
        borderRadius: 8,
    },
    taskTextInput: {
        flex: 1,
        fontSize: 16,
        color: theme.onSurface,
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    saveTaskButton: {
        padding: 8,
        marginLeft: 8,
    },
    noTasksText: {
        textAlign: 'center',
        color: theme.onSurfaceVariant,
        fontSize: 14,
        paddingVertical: 10,
        fontStyle: 'italic',
    }
});

const ProblemItem: React.FC<ProblemItemProps> = ({ problem, tasks, isExpanded, onToggleExpand }) => {
    const theme = useAppTheme();
    const styles = useMemo(() => getProblemItemStyles(theme), [theme]);

    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [isSubmittingTask, setIsSubmittingTask] = useState(false);

    const addTaskToProblem = useAppStore(state => state.addTaskToProblem);
    const deleteProblemAction = useAppStore(state => state.deleteProblem);

    // Shared value for horizontal translation
    const translateX = useSharedValue(0);
    // Shared value to track if swipe is open (to prevent expand/collapse when swiped)
    const isSwipedOpen = useSharedValue(false);

    // --- Alert Logic ---
    const showDeleteConfirmation = () => {
        Alert.alert(
            "Confirm Deletion",
            `Are you sure you want to delete "${problem.name}"? All tasks tied to this problem will be removed.`,
            [
                {
                    text: "Cancel",
                    onPress: () => {
                        // Swipe back closed if user cancels
                        translateX.value = withTiming(0);
                        isSwipedOpen.value = false;
                    },
                    style: "cancel"
                },
                {
                    text: "Confirm",
                    onPress: async () => {
                        await deleteProblemAction(problem.id);
                        // Item will be removed by parent list re-render.
                        // translateX.value will reset if component unmounts or can be forced.
                    },
                    style: "destructive"
                }
            ],
            {
                cancelable: true, onDismiss: () => { // Also swipe back if dismissed by tapping outside
                    translateX.value = withTiming(0);
                    isSwipedOpen.value = false;
                }
            }
        );
    };

    const handleDeletePress = () => {
        runOnJS(showDeleteConfirmation)(); // Run Alert on JS thread
    };

    // --- Gesture Handler ---
    const panGesture = Gesture.Pan()
        .activeOffsetX([-5, 5]) // Minimum horizontal movement to activate pan
        .failOffsetY([-5, 5])   // Fail if vertical movement is too much
        .onUpdate((event) => {
            // Only allow swiping left (negative translationX)
            const newX = event.translationX;
            if (isSwipedOpen.value) { // If already open, allow dragging relative to open state
                translateX.value = Math.max(-REVEAL_WIDTH, Math.min(0, -REVEAL_WIDTH + newX));
            } else { // If closed, allow dragging from closed state
                translateX.value = Math.max(-REVEAL_WIDTH, Math.min(0, newX));
            }
        })
        .onEnd((event) => {
            if (event.translationX < -SWIPE_THRESHOLD || event.velocityX < -500) { // Check velocity too for quick flick
                translateX.value = withTiming(-REVEAL_WIDTH);
                isSwipedOpen.value = true;
            } else {
                translateX.value = withTiming(0);
                isSwipedOpen.value = false;
            }
        });

    // --- Animated Style for Draggable Card ---
    const draggableCardAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    // --- Press handler for the main card content ---
    const handleCardPress = () => {
        if (isSwipedOpen.value) {
            // If swiped open, tapping the item should close the swipe
            translateX.value = withTiming(0);
            isSwipedOpen.value = false;
        } else {
            // Otherwise, perform the normal expand/collapse
            onToggleExpand();
        }
    };


    const handlePressAddTaskButton = useCallback(() => {
        setIsAddingTask(true);
        setNewTaskName('');
    }, []);

    const handleSaveNewTask = useCallback(async () => {
        if (newTaskName.trim() === '') return;
        setIsSubmittingTask(true);
        try {
            const addedTask = await addTaskToProblem(problem.id, newTaskName.trim());
            if (addedTask) {
                setNewTaskName('');
                setIsAddingTask(false);
            } else {
                console.warn("Failed to add task, store action returned null");
            }
        } catch (error) {
            console.error("Error adding task:", error);
        } finally {
            setIsSubmittingTask(false);
        }
    }, [newTaskName, addTaskToProblem, problem.id]);

    const handleCancelAddTask = useCallback(() => {
        setIsAddingTask(false);
        setNewTaskName('');
    }, []);


    return (
        <View style={styles.swipeableItemContainer}>
            {/* Actions Container (positioned behind) */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity onPress={handleDeletePress} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={TRASH_ICON_ONLY_SIZE} style={styles.deleteButtonIcon} />
                </TouchableOpacity>
            </View>

            {/* Draggable Item */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.problemCardDraggable, draggableCardAnimatedStyle]}>
                    {/* All the original content of ProblemItem goes here */}
                    <View style={styles.problemCardContent}>
                        <TouchableOpacity style={styles.problemHeader} onPress={handleCardPress}>
                            <View style={styles.problemInfo}>
                                <Text style={styles.problemName}>{problem.name}</Text>
                                <Text style={styles.problemTaskCount}>{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</Text>
                            </View>
                            <Ionicons name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"} size={24} color={theme.onSurfaceVariant} />
                        </TouchableOpacity>

                        {isExpanded && (
                            <View style={styles.tasksListContainer}>
                                {isAddingTask && (
                                    <View style={styles.addTaskInputContainer}>
                                        <TextInput
                                            style={styles.taskTextInput}
                                            placeholder="Enter new task name..."
                                            placeholderTextColor={theme.onSurfaceVariant}
                                            value={newTaskName}
                                            onChangeText={setNewTaskName}
                                            autoFocus
                                            onSubmitEditing={handleSaveNewTask}
                                            selectionColor={theme.primary}
                                        />
                                        {isSubmittingTask ? (
                                            <ActivityIndicator size="small" color={theme.primary} style={{ marginHorizontal: 8 }} />
                                        ) : (
                                            <>
                                                <TouchableOpacity onPress={handleSaveNewTask} style={styles.saveTaskButton}>
                                                    <Ionicons name="checkmark-circle-outline" size={30} color={theme.primary} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={handleCancelAddTask} style={styles.saveTaskButton}>
                                                    <Ionicons name="close-circle-outline" size={30} color={theme.error} />
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                )}

                                {tasks.length === 0 && !isAddingTask && (
                                    <Text style={styles.noTasksText}>No tasks yet for this problem.</Text>
                                )}
                                {tasks.map(task => (
                                    <TaskCard key={task.id} task={task} />
                                ))}

                                {!isAddingTask && (
                                    <TouchableOpacity style={styles.addTaskButton} onPress={handlePressAddTaskButton}>
                                        <Ionicons name="add-circle-outline" size={22} color={theme.onPrimaryContainer} />
                                        <Text style={styles.addTaskButtonText}>Add Task to resolve this problem</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

export default ProblemItem;