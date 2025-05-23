import { Stack, router } from 'expo-router'; // Stack is used for options
import React, { useState, useEffect } from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
    SafeAreaView,
    Platform,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Assuming your modal component is named AddRoutineActionForm.tsx
// and located at '@/components/AddRoutineActionForm'
// If it's AddRoutineActionModal.tsx, change the import accordingly.
import AddRoutineActionModal, { RoutineActionData } from '@/components/AddRoutineActionForm';

const { width: screenWidth } = Dimensions.get('window');
type SelectedTab = 'routine' | 'log';

// Updated ActionItem type: removed initialDoneCount, doneCount is the source of truth
type ActionItem = {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    doneCount: number; // Current done count
    iconColor: string;
    backgroundColor: string;
};

// Initial data now directly uses doneCount
const initialActionsData: ActionItem[] = [
    { id: '1', icon: 'sunny-outline', title: 'Morning Routine', doneCount: 0, iconColor: '#FFA500', backgroundColor: '#FFF3E0' },
    { id: '2', icon: 'restaurant-outline', title: 'Lunch Break', doneCount: 0, iconColor: '#4CAF50', backgroundColor: '#E8F5E9' },
    { id: '3', icon: 'moon-outline', title: 'Evening Routine', doneCount: 0, iconColor: '#673AB7', backgroundColor: '#EDE7F6' },
    { id: '4', icon: 'walk-outline', title: 'Afternoon Walk', doneCount: 0, iconColor: '#03A9F4', backgroundColor: '#E1F5FE' },
    { id: '5', icon: 'book-outline', title: 'Reading Time', doneCount: 0, iconColor: '#795548', backgroundColor: '#EFEBE9' },
    { id: '6', icon: 'fitness-outline', title: 'Workout', doneCount: 0, iconColor: '#F44336', backgroundColor: '#FFEBEE' },
];

const springConfig = {
    damping: 18,
    stiffness: 200,
    mass: 1,
};

// ActionCard now uses action.doneCount directly for its initial state.
// If doneCount needs to be updated in the parent (currentActionsData),
// you'd pass an onUpdateCount function from ActionsScreen to ActionCard.
// For now, ActionCard manages its own displayed doneCount based on the initial prop.
const ActionCard = ({ action }: { action: ActionItem }) => {
    const [doneCount, setDoneCount] = useState(action.doneCount); // Use action.doneCount
    const handleIncrement = () => setDoneCount(prev => prev + 1);
    const handleDecrement = () => setDoneCount(prev => (prev > 0 ? prev - 1 : 0));

    return (
        <View style={styles.routineCard}>
            <View style={[styles.iconContainer, { backgroundColor: action.backgroundColor }]}>
                <Ionicons name={action.icon} size={24} color={action.iconColor} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.routineTitle}>{action.title}</Text>
                <Text style={styles.routineTime}>Done: {doneCount}</Text>
            </View>
            <View style={styles.counterContainer}>
                <TouchableOpacity style={styles.counterButton} onPress={handleDecrement}>
                    <Ionicons name="remove-circle-outline" size={28} color="gray" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.counterButton} onPress={handleIncrement}>
                    <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const CustomHeader = ({ onSelectTab, selectedTab }: { onSelectTab: (tab: SelectedTab) => void; selectedTab: SelectedTab }) => {
    const insets = useSafeAreaInsets();
    const underlineLeft = useSharedValue(selectedTab === 'routine' ? 0 : 50);

    useEffect(() => {
        underlineLeft.value = withSpring(selectedTab === 'routine' ? 0 : 50, springConfig);
    }, [selectedTab, underlineLeft]);

    const animatedUnderlineStyle = useAnimatedStyle(() => ({
        left: `${underlineLeft.value}%`,
    }));

    const handleBackPress = () => {
        if (router.canGoBack()) {
            router.back();
        }
    };

    return (
        <View style={[styles.customHeaderRoot, { paddingTop: insets.top }]}>
            <View style={styles.topAppBar}>
                <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                    <Ionicons name="chevron-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Task Actions</Text>
                <View style={styles.headerRightPlaceholder} />
            </View>
            <View style={styles.categoryTabsBar}>
                <TouchableOpacity style={styles.actionButton} onPress={() => onSelectTab('routine')}>
                    <Text style={[styles.actionButtonText, selectedTab === 'routine' && styles.actionButtonTextSelected]}>
                        Routine Actions
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => onSelectTab('log')}>
                    <Text style={[styles.actionButtonText, selectedTab === 'log' && styles.actionButtonTextSelected]}>
                        Log Specific Action
                    </Text>
                </TouchableOpacity>
                <Animated.View style={[styles.underline, { width: '50%' }, animatedUnderlineStyle]} />
            </View>
        </View>
    );
};

export default function ActionsScreen() {
    const [selectedTab, setSelectedTab] = useState<SelectedTab>('routine');
    const tabPosition = useSharedValue(selectedTab === 'routine' ? 0 : 1);

    // State for modal visibility
    const [isAddRoutineModalVisible, setIsAddRoutineModalVisible] = useState(false);
    // State for the list of routine actions
    const [currentActionsData, setCurrentActionsData] = useState<ActionItem[]>(initialActionsData);

    useEffect(() => {
        tabPosition.value = withSpring(selectedTab === 'routine' ? 0 : 1, springConfig);
    }, [selectedTab, tabPosition]);

    const routineAnimatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(tabPosition.value, [0, 1], [0, -screenWidth]);
        return { transform: [{ translateX }] };
    });

    const logAnimatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(tabPosition.value, [0, 1], [screenWidth, 0]);
        return { transform: [{ translateX }] };
    });

    // Helper function to generate a lighter background (example)
    const lightenColor = (hex: string, percent: number): string => {
        hex = hex.replace(/^\s*#|\s*$/g, '');
        if (hex.length === 3) {
            hex = hex.replace(/(.)/g, '$1$1');
        }
        let r = parseInt(hex.substring(0, 2), 16),
            g = parseInt(hex.substring(2, 4), 16),
            b = parseInt(hex.substring(4, 6), 16);

        r = Math.min(255, Math.floor(r + (255 - r) * percent));
        g = Math.min(255, Math.floor(g + (255 - g) * percent));
        b = Math.min(255, Math.floor(b + (255 - b) * percent));

        const rr = r.toString(16).padStart(2, '0');
        const gg = g.toString(16).padStart(2, '0');
        const bb = b.toString(16).padStart(2, '0');
        return `#${rr}${gg}${bb}`;
    };

    const handleSaveRoutineAction = (data: RoutineActionData) => {
        console.log('New Routine Action to save:', data);
        const newAction: ActionItem = {
            id: String(Date.now()), // Simple ID generation for example
            title: data.title,
            icon: data.icon,
            iconColor: data.color,
            backgroundColor: lightenColor(data.color, 0.85), // Derive a lighter background
            doneCount: 0, // New actions start with 0 doneCount
        };
        setCurrentActionsData(prevActions => [newAction, ...prevActions]); // Add to top of the list
        setIsAddRoutineModalVisible(false); // Close modal
        // Later, you'll call your Zustand store action here to persist this
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    header: () => (
                        <CustomHeader
                            onSelectTab={setSelectedTab}
                            selectedTab={selectedTab}
                        />
                    ),
                }}
            />
            <View style={styles.contentContainer}>
                <Animated.View style={[styles.pageContainer, routineAnimatedStyle]}>
                    <View style={styles.routineSection}>
                        <FlatList
                            data={currentActionsData} // Use the state variable for dynamic data
                            renderItem={({ item }) => <ActionCard action={item} />}
                            keyExtractor={(item) => item.id}
                            style={styles.listStyle}
                            contentContainerStyle={styles.listContentStyle}
                            ListFooterComponent={<View style={{ height: 110 }} />} // Increased footer for button spacing
                        />
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setIsAddRoutineModalVisible(true)} // Open the modal
                        >
                            <Ionicons name="add" size={24} color="white" />
                            <Text style={styles.addButtonText}>Add Routine Action</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
                <Animated.View style={[styles.pageContainer, logAnimatedStyle]}>
                    <View style={styles.logSection}>
                        <Text style={styles.contentText}>Log Specific Action content here.</Text>
                    </View>
                </Animated.View>
            </View>

            {/* Render the Modal Component */}
            <AddRoutineActionModal
                visible={isAddRoutineModalVisible}
                onClose={() => setIsAddRoutineModalVisible(false)}
                onSave={handleSaveRoutineAction}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    customHeaderRoot: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    topAppBar: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: 'black',
        fontSize: 18,
        fontWeight: '600',
    },
    headerRightPlaceholder: {
        width: 28 + 16,
    },
    categoryTabsBar: {
        flexDirection: 'row',
        width: '100%',
        position: 'relative',
        backgroundColor: 'white',
    },
    actionButton: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    actionButtonText: {
        color: 'gray',
        fontSize: 16,
        fontWeight: 'bold',
    },
    actionButtonTextSelected: {
        color: '#007AFF',
    },
    underline: {
        height: 3,
        backgroundColor: '#007AFF',
        position: 'absolute',
        bottom: 0,
        borderRadius: 2,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    pageContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: screenWidth,
    },
    routineSection: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    logSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    contentText: {
        fontSize: 18,
        color: 'gray',
        textAlign: 'center',
    },
    listStyle: {
        flex: 1,
    },
    listContentStyle: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    routineCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.00,
        elevation: 1,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    routineTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    routineTime: {
        fontSize: 14,
        color: 'gray',
        marginTop: 4,
        fontWeight: '500',
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterButton: {
        paddingHorizontal: 5,
        paddingVertical: 5,
    },
    addButton: {
        position: 'absolute',
        bottom: Platform.OS === 'android' ? 20 : 0,
        left: 20,
        right: 20,
        backgroundColor: '#007AFF',
        borderRadius: 25,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});