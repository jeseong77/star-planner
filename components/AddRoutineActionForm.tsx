import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Pressable, // For background dismiss
    Dimensions,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Import Reanimated library components
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';

// Get all Ionicon names (filter for more usable subset)
const ALL_IONICON_NAMES = Object.keys(Ionicons.glyphMap)
    .filter(name => name.includes('-outline') || (!name.includes('sharp') && !name.includes('logo-')))
    .slice(0, 200) as (keyof typeof Ionicons.glyphMap)[]; // Limit for performance

// Sample theme colors
const THEME_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#2AB7CA', '#FE4A49',
    '#F06595', '#74B816', '#15AABF', '#FF922B', '#845EF7', '#547AA5',
    '#FFA500', '#4CAF50', '#673AB7', '#03A9F4', '#795548', '#F44336',
];

const ICON_PREVIEW_SIZE = 48;
const COLOR_SWATCH_SIZE = 35;

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
    const [title, setTitle] = useState('');
    const [selectedIcon, setSelectedIcon] = useState<keyof typeof Ionicons.glyphMap | null>(null);
    const [selectedColor, setSelectedColor] = useState<string>(THEME_COLORS[0]);

    // Reanimated shared value for the background color
    const animatedBackgroundColor = useSharedValue(selectedColor);

    useEffect(() => {
        // Animate to the new color when selectedColor changes
        animatedBackgroundColor.value = withTiming(selectedColor || '#cccccc', { duration: 300 });
    }, [selectedColor, animatedBackgroundColor]);

    // Animated style for the icon preview background
    const animatedIconPreviewStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: animatedBackgroundColor.value,
        };
    });

    const handleSave = () => {
        if (title && selectedIcon && selectedColor) {
            onSave({ title, icon: selectedIcon, color: selectedColor });
            resetForm();
        } else {
            alert('Please fill in all fields, select an icon, and a color.');
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    }

    const resetForm = () => {
        setTitle('');
        setSelectedIcon(null);
        // Reset selectedColor and also the animated value to avoid stale color on reopen
        const initialColor = THEME_COLORS[0];
        setSelectedColor(initialColor);
        animatedBackgroundColor.value = initialColor; // Instantly set for next open
    }

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose} // For Android back button
        >
            <Pressable style={styles.overlay} onPress={handleClose}>
                <Pressable style={styles.modalView} onPress={(e) => e.stopPropagation()}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.modalTitle}>Add New Routine Action</Text>

                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Morning Hydration"
                            value={title}
                            onChangeText={setTitle}
                        />

                        {selectedIcon && (
                            // Use Animated.View and apply the animated style
                            <Animated.View style={[styles.iconPreviewContainer, animatedIconPreviewStyle]}>
                                <Ionicons name={selectedIcon} size={ICON_PREVIEW_SIZE * 0.6} color="white" />
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
                                        <Ionicons name={item} size={26} color={selectedIcon === item ? '#FFFFFF' : '#444444'} />
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item) => item}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingVertical: 0 }} // Your style
                            />
                        </View>

                        <Text style={styles.label}>Theme Color</Text>
                        <View style={styles.colorListContainer}>
                            {THEME_COLORS.map((color) => (
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

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={handleClose}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveModalButton]}
                                onPress={handleSave}
                            >
                                <Text style={[styles.modalButtonText, styles.saveModalButtonText]}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

// Using the exact styles you provided in the prompt
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        width: Dimensions.get('window').width * 0.9,
        maxHeight: Dimensions.get('window').height * 0.8,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#555',
        marginTop: 15,
        marginBottom: 7,
    },
    input: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        fontSize: 16,
        borderColor: '#e0e0e0',
        borderWidth: 1,
    },
    iconPreviewContainer: { // This style is applied to Animated.View
        width: ICON_PREVIEW_SIZE,
        height: ICON_PREVIEW_SIZE,
        borderRadius: ICON_PREVIEW_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 16, // Your style
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)' // Your style
    },
    iconListContainer: {
        height: 60,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        paddingVertical: 5, // Your style
    },
    iconTouchable: {
        width: 50,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
        backgroundColor: '#e9e9e9',
    },
    iconTouchableSelected: {
        backgroundColor: '#007AFF',
    },
    colorListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center', // Your style
        marginTop: 5,
        marginBottom: 20,
    },
    colorSwatch: {
        width: COLOR_SWATCH_SIZE,
        height: COLOR_SWATCH_SIZE,
        borderRadius: COLOR_SWATCH_SIZE / 2,
        // Your dynamic margin calculation for swatches
        margin: ((Dimensions.get('window').width * 0.9 - 50) - (6 * COLOR_SWATCH_SIZE)) / 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorSwatchSelected: {
        borderColor: 'black',
        transform: [{ scale: 1.15 }],
        elevation: 2, // Your style
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Your style
        marginTop: 25,
    },
    modalButton: {
        flex: 1, // Your style
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5, // Your style
    },
    cancelButton: {
        backgroundColor: '#e0e0e0',
    },
    saveModalButton: {
        backgroundColor: '#007AFF',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    saveModalButtonText: {
        color: 'white',
    },
});