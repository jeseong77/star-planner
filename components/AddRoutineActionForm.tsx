import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import {
    Modal,
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Pressable,
    Dimensions,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    // Easing, // Only if using custom easing, withTiming default is Easing.inOut(Easing.quad)
} from 'react-native-reanimated';

// Import your theme context and types
import { useAppTheme, type AppTheme } from '@/contexts/AppThemeProvider'; // Adjust path as needed

// Get all Ionicon names (filter for more usable subset)
const ALL_IONICON_NAMES = Object.keys(Ionicons.glyphMap)
    .filter(name => name.includes('-outline') || (!name.includes('sharp') && !name.includes('logo-')))
    .slice(0, 200) as (keyof typeof Ionicons.glyphMap)[];

// Sample theme colors for user selection - these define the action's visual identity
const THEME_CHOICE_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#2AB7CA', '#FE4A49',
    '#F06595', '#74B816', '#15AABF', '#FF922B', '#845EF7', '#547AA5',
    '#FFA500', '#4CAF50', '#673AB7', '#03A9F4', '#795548', '#F44336',
];

const ICON_PREVIEW_SIZE = 48;
const COLOR_SWATCH_SIZE = 35;
const ANIMATION_DURATION = 300; // Kept from your code

export interface RoutineActionData {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

interface AddRoutineActionModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: RoutineActionData) => void;
}

export default function AddRoutineActionModal({
    visible,
    onClose,
    onSave,
}: AddRoutineActionModalProps) {
    const theme = useAppTheme(); // Use the app theme
    const styles = useMemo(() => getModalStyles(theme), [theme]); // Memoize styles

    const [title, setTitle] = useState('');
    const [selectedIcon, setSelectedIcon] = useState<keyof typeof Ionicons.glyphMap | null>(null);
    const [selectedColor, setSelectedColor] = useState<string>(THEME_CHOICE_COLORS[0]);

    const animatedBackgroundColor = useSharedValue(THEME_CHOICE_COLORS[0]);

    useEffect(() => {
        // Animate to the new color when selectedColor changes
        // Ensure this only runs when the modal is visible to avoid background updates
        if (visible) {
            animatedBackgroundColor.value = withTiming(selectedColor || theme.surfaceContainerHighest, { duration: ANIMATION_DURATION });
        } else {
            // When not visible, instantly set to the current selectedColor for next opening
            animatedBackgroundColor.value = selectedColor || theme.surfaceContainerHighest;
        }
    }, [selectedColor, visible, animatedBackgroundColor, theme.surfaceContainerHighest]);

    const animatedIconPreviewStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: animatedBackgroundColor.value,
        };
    });

    const resetForm = () => {
        setTitle('');
        setSelectedIcon(null);
        const initialColor = THEME_CHOICE_COLORS[0];
        setSelectedColor(initialColor);
        // When form resets (e.g. modal closes), set animated background to initial directly
        // if modal is not visible, otherwise let the useEffect handle it if it is visible
        if (!visible) {
            animatedBackgroundColor.value = initialColor;
        } else {
            // if visible and resetting, animate to initialColor
            animatedBackgroundColor.value = withTiming(initialColor, { duration: ANIMATION_DURATION });
        }
    };

    const handleSave = () => {
        if (title && selectedIcon && selectedColor) {
            onSave({ title, icon: selectedIcon, color: selectedColor });
            // resetForm(); // Let parent call onClose which should trigger resetForm via onDismiss
        } else {
            alert('Please fill in all fields, select an icon, and a color.');
        }
    };

    const handleModalActualClose = () => {
        // resetForm(); // Delay reset until onDismiss to allow fade out animation to complete
        onClose();
    };


    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={handleModalActualClose} // For Android back button
            onDismiss={resetForm} // Called after modal is fully dismissed
        >
            <Pressable style={styles.overlay} onPress={handleModalActualClose}>
                <Pressable style={styles.modalView} onPress={(e) => e.stopPropagation()}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.modalTitle}>Add New Routine Action</Text>

                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={theme.onSurfaceVariant}
                            placeholder="e.g., Morning Hydration"
                            value={title}
                            onChangeText={setTitle}
                            selectionColor={theme.primary}
                        />

                        {selectedIcon && ( // Icon preview is shown only if an icon is selected
                            <Animated.View style={[styles.iconPreviewContainer, animatedIconPreviewStyle]}>
                                {/* Icon color inside preview is white, assuming selected colors are vibrant enough */}
                                <Ionicons name={selectedIcon} size={ICON_PREVIEW_SIZE * 0.6} color={theme.onPrimaryContainer} />
                            </Animated.View>
                        )}
                        {/* If no icon is selected, the space is simply not taken up, preventing abrupt collapse on deselection.
                To maintain height, you could render an empty container or a placeholder icon if selectedIcon is null:
            */}
                        {!selectedIcon && (
                            <View style={styles.iconPreviewContainer}>
                                <Ionicons name="image-outline" size={ICON_PREVIEW_SIZE * 0.6} color={theme.onSurfaceVariant} />
                            </View>
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
                                        { backgroundColor: color }, // Swatch shows the actual color to pick
                                        selectedColor === color && styles.colorSwatchSelected,
                                    ]}
                                    onPress={() => setSelectedColor(color)}
                                />
                            ))}
                        </View>

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={handleModalActualClose}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveModalButton]}
                                onPress={handleSave}
                            >
                                <Text style={styles.saveModalButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const getModalStyles = (theme: AppTheme) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.35)', // Reduced opacity for less dimming
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        width: Dimensions.get('window').width * 0.9,
        maxHeight: Dimensions.get('window').height * 0.8,
        backgroundColor: theme.surfaceContainerHigh, // MD3 surface for dialogs/modals
        borderRadius: 28, // MD3 Large shape for dialogs
        padding: 24,
        elevation: 3, // MD3 Elevation level 3
        // iOS shadow to mimic elevation
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, // Subtle shadow
        shadowRadius: 8,
    },
    modalTitle: {
        fontSize: 22, // MD3 Headline Small adjusted
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
        color: theme.onSurface,
    },
    label: {
        fontSize: 14, // MD3 Label Large
        fontWeight: '500', // Medium
        color: theme.onSurfaceVariant,
        marginTop: 16,
        marginBottom: 8,
    },
    input: {
        backgroundColor: theme.surfaceContainerHighest, // For filled text fields
        paddingHorizontal: 16,
        paddingVertical: 14, // Slightly more padding
        borderRadius: 8, // Or 4 for filled, 28 for outlined full rounded
        fontSize: 16,    // MD3 Body Large
        color: theme.onSurface,
        borderColor: theme.outline, // Use outline for text field border
        borderWidth: 1, // Can be 0 if using only background, or 1 for outline
    },
    iconPreviewContainer: {
        width: ICON_PREVIEW_SIZE,
        height: ICON_PREVIEW_SIZE,
        borderRadius: ICON_PREVIEW_SIZE / 2, // Circular
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 16,
        borderWidth: 1,
        borderColor: theme.outlineVariant, // Subtle border for the container
        // Background color is animated
    },
    iconListContainer: {
        height: 60, // Keep enough height for touchables
        backgroundColor: theme.surfaceContainer, // A slightly different surface
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
        backgroundColor: theme.surfaceContainerHigh, // Background for unselected icon
    },
    iconTouchableSelected: {
        backgroundColor: theme.primaryContainer, // Selected state
        // borderWidth: 2, // Optional: Add border for selected state
        // borderColor: theme.primary,
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
        borderColor: 'transparent', // No border by default
    },
    colorSwatchSelected: {
        borderColor: theme.outline, // Border to indicate selection
        transform: [{ scale: 1.1 }], // Keep scale effect
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end', // Align buttons to the end (right) per MD3
        marginTop: 24,
        gap: 8, // Spacing between buttons
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20, // MD3 "Full" shape for buttons
        alignItems: 'center',
    },
    cancelButton: {
        // For a text button style or outlined button
        backgroundColor: 'transparent', // Or theme.surface if you want an outlined button appearance
        // borderWidth: 1, // Uncomment for outlined style
        // borderColor: theme.outline, // Uncomment for outlined style
    },
    saveModalButton: {
        backgroundColor: theme.primary,
    },
    modalButtonText: { // General text style for buttons
        fontSize: 14, // MD3 Label Large
        fontWeight: '600', // Medium
        letterSpacing: 0.1,
    },
    cancelButtonText: {
        color: theme.primary, // Text color for text/outlined buttons
    },
    saveModalButtonText: {
        color: theme.onPrimary,
    },
});