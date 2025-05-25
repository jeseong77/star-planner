// src/components/AddRoutineActionForm.tsx (or your path)
import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Pressable,
    Dimensions,
    ScrollView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';

import { useAppTheme, type AppTheme } from '@/contexts/AppThemeProvider'; // Adjust path

const ALL_IONICON_NAMES = Object.keys(Ionicons.glyphMap)
    .filter(name => name.includes('-outline') || (!name.includes('sharp') && !name.includes('logo-')))
    .slice(0, 200) as (keyof typeof Ionicons.glyphMap)[];

const THEME_CHOICE_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#2AB7CA', '#FE4A49',
    '#F06595', '#74B816', '#15AABF', '#FF922B', '#845EF7', '#547AA5',
    '#FFA500', '#4CAF50', '#673AB7', '#03A9F4', '#795548', '#F44336',
];

const ICON_PREVIEW_SIZE = 48;
const COLOR_SWATCH_SIZE = 35;
const ANIMATION_DURATION = 250;

export interface RoutineActionData {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

interface AddRoutineActionViewProps { // Renamed from AddRoutineActionModalProps
    // visible prop is no longer needed here if parent controls rendering
    onClose: () => void;
    onSave: (data: RoutineActionData) => void;
}

export default function AddRoutineActionView({ // Renamed from AddRoutineActionModal
    onClose,
    onSave,
}: AddRoutineActionViewProps) {
    const theme = useAppTheme();
    const styles = useMemo(() => getFormStyles(theme), [theme]);

    const [title, setTitle] = useState('');
    const [selectedIcon, setSelectedIcon] = useState<keyof typeof Ionicons.glyphMap | null>(null);
    const [selectedColor, setSelectedColor] = useState<string>(THEME_CHOICE_COLORS[0]);

    const animatedBackgroundColor = useSharedValue(THEME_CHOICE_COLORS[0]);

    // Effect to reset form when it's about to be shown (e.g. parent sets it visible)
    // This can be triggered by a prop change if parent passes a 'resetKey' or similar,
    // or parent calls a reset method via ref. For simplicity, we'll reset on save/close.
    // And parent ensures it's re-mounted or state is fresh.
    // A simple way is to reset when selectedIcon/Color changes back to default AFTER an interaction.

    useEffect(() => {
        // Always keep animated background in sync with selectedColor
        animatedBackgroundColor.value = withTiming(selectedColor || theme.surfaceContainerHighest, {
            duration: ANIMATION_DURATION,
            easing: Easing.inOut(Easing.quad),
        });
    }, [selectedColor, animatedBackgroundColor, theme.surfaceContainerHighest]);


    const animatedIconPreviewStyle = useAnimatedStyle(() => ({
        backgroundColor: animatedBackgroundColor.value,
    }));

    const resetForm = () => {
        setTitle('');
        setSelectedIcon(null);
        const initialColor = THEME_CHOICE_COLORS[0];
        setSelectedColor(initialColor);
        animatedBackgroundColor.value = initialColor; // Instantly set for next use
    };

    // Call resetForm when the component mounts to ensure it's fresh if it was hidden and state persisted
    useEffect(() => {
        resetForm();
    }, []);


    const handleSave = () => {
        if (title && selectedIcon && selectedColor) {
            onSave({ title, icon: selectedIcon, color: selectedColor });
            resetForm(); // Reset after saving
        } else {
            alert('Please fill in all fields, select an icon, and a color.');
        }
    };

    const handleClosePress = () => {
        resetForm(); // Reset before closing
        onClose();
    };

    return (
        // This Pressable is the main container for the form card.
        // e.stopPropagation() prevents clicks inside from propagating to parent overlay.
        <Pressable style={styles.formCard} onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.formTitle}>Add New Routine Action</Text>

                <Text style={styles.label}>Title</Text>
                <TextInput
                    style={styles.input}
                    placeholderTextColor={theme.onSurfaceVariant}
                    placeholder="e.g., Morning Hydration"
                    value={title}
                    onChangeText={setTitle}
                    selectionColor={theme.primary}
                />

                {!selectedIcon && (
                    <View style={[styles.iconPreviewContainer, { backgroundColor: theme.surfaceContainer }]}>
                        <Ionicons name="image-outline" size={ICON_PREVIEW_SIZE * 0.6} color={theme.onSurfaceVariant} />
                    </View>
                )}
                {selectedIcon && (
                    <Animated.View style={[styles.iconPreviewContainer, animatedIconPreviewStyle]}>
                        <Ionicons name={selectedIcon} size={ICON_PREVIEW_SIZE * 0.6} color={theme.onPrimaryContainer} />
                    </Animated.View>
                )}

                <Text style={styles.label}>Icon</Text>
                <View style={styles.iconListContainer}>
                    <FlatList
                        data={ALL_IONICON_NAMES}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.iconTouchable,
                                    selectedIcon === item && styles.iconTouchableSelected,
                                ]}
                                onPress={() => setSelectedIcon(item)}
                            >
                                <Ionicons name={item} size={26} color={selectedIcon === item ? theme.onPrimaryContainer : theme.onSurfaceVariant} />
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: 0 }}
                    />
                </View>

                <Text style={styles.label}>Theme Color</Text>
                <View style={styles.colorListContainer}>
                    {THEME_CHOICE_COLORS.map((color) => (
                        <TouchableOpacity
                            key={color}
                            style={[
                                styles.colorSwatch,
                                { backgroundColor: color },
                                selectedColor === color && styles.colorSwatchSelected,
                            ]}
                            onPress={() => setSelectedColor(color)}
                        />
                    ))}
                </View>

                <View style={styles.formButtonContainer}>
                    <TouchableOpacity
                        style={[styles.formButton, styles.cancelButton]}
                        onPress={handleClosePress}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.formButton, styles.saveButton]}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </Pressable>
    );
}

const getFormStyles = (theme: AppTheme) => StyleSheet.create({
    formCard: { // Renamed from modalView, this is the card itself
        width: Dimensions.get('window').width * 0.9,
        maxWidth: Platform.OS === 'web' ? 400 : Dimensions.get('window').width * 0.9, // Max width for web
        maxHeight: Dimensions.get('window').height * 0.8,
        backgroundColor: theme.surfaceContainerHigh,
        borderRadius: 28,
        padding: 24,
        elevation: 3, // MD3 Elevation
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        // Max width of 70% will be applied by the parent container if desired
        // For now, this card defines its own width relative to screen.
    },
    formTitle: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
        color: theme.onSurface,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.onSurfaceVariant,
        marginTop: 16,
        marginBottom: 8,
    },
    input: {
        backgroundColor: theme.surfaceContainerHighest,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 8,
        fontSize: 16,
        color: theme.onSurface,
        borderColor: theme.outline,
        borderWidth: 1,
    },
    iconPreviewContainer: {
        width: ICON_PREVIEW_SIZE,
        height: ICON_PREVIEW_SIZE,
        borderRadius: ICON_PREVIEW_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 16,
        borderWidth: 1,
        borderColor: theme.outlineVariant,
    },
    iconListContainer: {
        height: 60,
        backgroundColor: theme.surfaceContainer,
        borderRadius: 12,
        paddingVertical: 5,
        marginTop: 4,
    },
    iconTouchable: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
        backgroundColor: theme.surfaceContainerHigh,
    },
    iconTouchableSelected: {
        backgroundColor: theme.primaryContainer,
    },
    colorListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    colorSwatch: {
        width: COLOR_SWATCH_SIZE,
        height: COLOR_SWATCH_SIZE,
        borderRadius: COLOR_SWATCH_SIZE / 2,
        margin: 6,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorSwatchSelected: {
        borderColor: theme.outline,
        transform: [{ scale: 1.1 }],
    },
    formButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 24,
        gap: 8,
    },
    formButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'transparent',
    },
    saveButton: {
        backgroundColor: theme.primary,
    },
    cancelButtonText: {
        color: theme.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    saveButtonText: {
        color: theme.onPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
});