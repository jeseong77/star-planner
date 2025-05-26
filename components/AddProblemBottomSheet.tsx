import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Dimensions,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Easing,
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import { useAppTheme, type AppTheme } from '../contexts/AppThemeProvider';
import { useAppStore } from '../store/appStore';
import type { Problem } from '../types';

const screenHeight = Dimensions.get('window').height;

interface AddProblemBottomSheetProps {
    isOpen: Animated.SharedValue<boolean>;
    onClose: () => void;
    animationDuration?: number;
}

const generateUUID = (): string => {
    return Crypto.randomUUID();
};

const AddProblemBottomSheet: React.FC<AddProblemBottomSheetProps> = ({
    isOpen,
    onClose,
    animationDuration = 300,
}) => {
    const theme = useAppTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    const sheetInternalHeight = useSharedValue(0);
    const keyboardHeight = useSharedValue(0);

    const keyboardSpacerStyle = useAnimatedStyle(() => {
        return {
            height: keyboardHeight.value,
        };
    });

    useEffect(() => {
        const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const keyboardHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const keyboardDidShowListener = Keyboard.addListener(
            keyboardShowEvent,
            (event) => {
                let eventDuration = 250;
                if (Platform.OS === 'ios' && event.duration) {
                    eventDuration = event.duration;
                }
                keyboardHeight.value = withTiming(event.endCoordinates.height, {
                    duration: eventDuration,
                    easing: Easing.out(Easing.ease),
                });
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            keyboardHideEvent,
            (event) => {
                let eventDuration = 250;
                if (Platform.OS === 'ios' && event?.duration) {
                    eventDuration = event.duration;
                }
                keyboardHeight.value = withTiming(0, {
                    duration: eventDuration,
                    easing: Easing.out(Easing.ease),
                });
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, [keyboardHeight]);

    const progress = useDerivedValue(() => {
        return withTiming(isOpen.value ? 0 : 1, { duration: animationDuration });
    }, [isOpen, animationDuration]);

    const animatedSheetStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            progress.value,
            [0, 1],
            [0, sheetInternalHeight.value || screenHeight * 0.5],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ translateY }],
            opacity: isOpen.value || progress.value < 1 ? 1 : 0,
        };
    });

    const animatedBackdropStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(progress.value, [0, 1], [1, 0], Extrapolation.CLAMP),
            pointerEvents: isOpen.value ? 'auto' : 'none',
        };
    });

    const [problemName, setProblemName] = useState('');
    const [error, setError] = useState('');
    const addProblemToSituation = useAppStore((state) => state.addProblemToSituation);

    const handleInternalClose = useCallback(() => {
        setProblemName('');
        setError('');
        onClose();
    }, [onClose]);

    const handleAddProblem = useCallback(async () => {
        if (!problemName.trim()) {
            setError('Problem name cannot be empty.');
            // Keyboard does NOT dismiss here, as per requirement
            return;
        }
        setError('');

        const newProblem: Problem = {
            id: generateUUID(),
            name: problemName.trim(),
            isResolved: false,
            createdAt: new Date().toISOString(),
            taskIds: [],
        };

        try {
            await addProblemToSituation(newProblem);
            Keyboard.dismiss(); // <--- ADDED: Dismiss keyboard on successful add
            handleInternalClose();
        } catch (e) {
            console.error("Failed to add problem:", e);
            setError('Failed to save problem. Please try again.');
            // Keyboard does NOT dismiss here, allowing user to retry
        }
    }, [problemName, addProblemToSituation, handleInternalClose]);

    return (
        <>
            <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    onPress={handleInternalClose}
                    activeOpacity={1}
                />
            </Animated.View>

            <Animated.View
                style={[styles.sheetContainer, animatedSheetStyle, { backgroundColor: theme.surfaceContainerLow }]}
                onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    if (Math.abs(sheetInternalHeight.value - height) > 1 || sheetInternalHeight.value === 0) {
                        sheetInternalHeight.value = height;
                    }
                }}
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
                            if (error) setError('');
                        }}
                        placeholderTextColor={theme.onSurfaceVariant}
                        selectionColor={theme.primary}
                        autoFocus={false}
                    />
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity style={styles.saveButton} onPress={handleAddProblem}>
                        <Ionicons name="add-circle-outline" size={20} color={theme.onPrimary} style={styles.saveButtonIcon} />
                        <Text style={styles.saveButtonText}>Add Problem</Text>
                    </TouchableOpacity>
                    <Animated.View style={keyboardSpacerStyle} />
                </View>
            </Animated.View>
        </>
    );
};

const getStyles = (theme: AppTheme) => StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1,
    },
    sheetContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        zIndex: 2,
        maxHeight: screenHeight * 0.9,
        overflow: 'hidden',
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
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
        textAlign: 'left',
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