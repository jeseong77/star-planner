import React, { useMemo, useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Platform,
    KeyboardAvoidingView,
    Dimensions, // To get screen height for max sheet height
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useDerivedValue,
    withDelay,
    withTiming,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';

import { useAppStore } from '../store/appStore'; // Adjust path as needed
import type { Problem } from '../types'; // Adjust path as needed
import { useAppTheme, type AppTheme } from '../contexts/AppThemeProvider'; // Adjust path as needed

const screenHeight = Dimensions.get('window').height;

// Props for the bottom sheet
interface AddProblemBottomSheetProps {
    isOpen: Animated.SharedValue<boolean>; // Controlled by parent
    onClose: () => void; // Parent function to set isOpen.value = false
    animationDuration?: number;
}

// A simple UUID generator using expo-crypto
const generateUUID = (): string => {
    return Crypto.randomUUID();
};

const AddProblemBottomSheet: React.FC<AddProblemBottomSheetProps> = ({
    isOpen,
    onClose,
    animationDuration = 300, // Default duration from Gorhom, reference used 500
}) => {
    const theme = useAppTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    const sheetInternalHeight = useSharedValue(0); // Actual height of the sheet content

    // Progress: 0 when fully open (translateY = 0), 1 when fully closed (translateY = sheetHeight)
    const progress = useDerivedValue(() => {
        return withTiming(isOpen.value ? 0 : 1, { duration: animationDuration });
    }, [isOpen, animationDuration]);

    const animatedSheetStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            progress.value,
            [0, 1], // Input range (0: open, 1: closed)
            [0, sheetInternalHeight.value || screenHeight * 0.5], // Output range for translateY
            Extrapolation.CLAMP
        );
        return {
            transform: [{ translateY }],
            // Control visibility to prevent interaction when off-screen
            opacity: isOpen.value || progress.value < 1 ? 1 : 0,
        };
    });

    const animatedBackdropStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(progress.value, [0, 1], [1, 0], Extrapolation.CLAMP), // Fades in when open, out when closed
            // zIndex handling: only active when open or opening
            // pointerEvents are more reliable for disabling interaction
            pointerEvents: isOpen.value ? 'auto' : 'none',
        };
    });

    const [problemName, setProblemName] = useState('');
    const [error, setError] = useState('');

    const addProblemToSituation = useAppStore((state) => state.addProblemToSituation);

    const handleInternalClose = useCallback(() => {
        // Clear form state before calling parent's onClose
        setProblemName('');
        setError('');
        onClose(); // This function should set isOpen.value = false in the parent
    }, [onClose]);

    const handleAddProblem = useCallback(async () => {
        if (!problemName.trim()) {
            setError('Problem name cannot be empty.');
            return;
        }
        setError('');

        const newProblem: Problem = {
            id: generateUUID(),
            name: problemName.trim(),
            isResolved: false,
            createdAt: new Date().toISOString(),
            taskIds: [],
            // iconName: 'help-circle-outline', // Example: provide a default or add an icon picker
        };

        try {
            await addProblemToSituation(newProblem);
            handleInternalClose(); // Close and clear form
        } catch (e) {
            console.error("Failed to add problem:", e);
            setError('Failed to save problem. Please try again.');
        }
    }, [problemName, addProblemToSituation, handleInternalClose]);

    // Render nothing if sheet height is not measured yet, to prevent flicker
    // or ensure the initial transform pushes it off-screen correctly.
    // The opacity check in animatedSheetStyle also helps.

    return (
        <>
            {/* Backdrop */}
            <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill} // Make backdrop touchable
                    onPress={handleInternalClose}
                    activeOpacity={1} // To ensure the backdrop itself doesn't have visual feedback
                />
            </Animated.View>

            {/* Sheet Content */}
            <Animated.View
                style={[styles.sheetContainer, animatedSheetStyle, { backgroundColor: theme.surfaceContainerLow }]}
                onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    // Update sheet height only if it has changed significantly,
                    // or if it's the initial measurement.
                    if (Math.abs(sheetInternalHeight.value - height) > 1 || sheetInternalHeight.value === 0) {
                        sheetInternalHeight.value = height;
                    }
                }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardAvoidingView}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0} // Adjust if needed
                >
                    <View style={styles.contentContainer}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.title}>Add New Problem</Text>
                            <TouchableOpacity onPress={handleInternalClose} style={styles.closeButton}>
                                <Ionicons name="close-circle-outline" size={28} color={theme.onSurfaceVariant} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter problem name (e.g., Improve Health)"
                            value={problemName}
                            onChangeText={(text) => {
                                setProblemName(text);
                                if (error) setError(''); // Clear error on type
                            }}
                            placeholderTextColor={theme.onSurfaceVariant}
                            selectionColor={theme.primary}
                            autoFocus={false} // AutoFocus can sometimes be tricky with custom bottom sheets
                        />
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <TouchableOpacity style={styles.saveButton} onPress={handleAddProblem}>
                            <Ionicons name="add-circle-outline" size={20} color={theme.onPrimary} style={styles.saveButtonIcon} />
                            <Text style={styles.saveButtonText}>Add Problem</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Animated.View>
        </>
    );
};

const getStyles = (theme: AppTheme) => StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent backdrop
        zIndex: 1, // Ensure backdrop is above other screen content but below sheet
    },
    sheetContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        zIndex: 2, // Sheet is above backdrop
        // Height will be determined by content, up to a maxHeight
        maxHeight: screenHeight * 0.9, // Example: Max 90% of screen height
        overflow: 'hidden', // Ensure content respects border radius
    },
    keyboardAvoidingView: {
        width: '100%',
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Extra padding for home indicator or just spacing
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.onSurface,
    },
    closeButton: {
        padding: 5,
    },
    input: {
        fontSize: 16,
        padding: Platform.OS === 'ios' ? 15 : 12,
        backgroundColor: theme.surfaceContainer,
        borderRadius: 8,
        color: theme.onSurface,
        borderWidth: 1,
        borderColor: theme.outline,
        marginBottom: 10,
    },
    errorText: {
        color: theme.error,
        fontSize: 14,
        marginBottom: 15,
        textAlign: 'left', // Changed from center
    },
    saveButton: {
        backgroundColor: theme.primary,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    saveButtonIcon: {
        marginRight: 8,
    },
    saveButtonText: {
        color: theme.onPrimary,
        fontSize: 16,
        fontWeight: '500',
    },
});

export default AddProblemBottomSheet;