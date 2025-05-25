// app/actions.tsx (or your path)
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Dimensions,
    FlatList, // Import Pressable for overlay
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme, type AppTheme } from '@/contexts/AppThemeProvider';
// Ensure the import name matches the exported component name
import AddRoutineActionView, { RoutineActionData as ModalRoutineActionData } from '@/components/AddRoutineActionForm';


const { width: screenWidth } = Dimensions.get('window');
type SelectedTab = 'routine' | 'log';

type ActionItem = {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    doneCount: number;
    iconColor: string;
    backgroundColor: string;
};

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

const ActionCard = ({ action }: { action: ActionItem }) => {
    const theme = useAppTheme();
    const [doneCount, setDoneCount] = useState(action.doneCount);
    const cardStyles = useMemo(() => getActionCardStyles(theme), [theme]);

    const handleIncrement = () => setDoneCount(prev => prev + 1);
    const handleDecrement = () => setDoneCount(prev => (prev > 0 ? prev - 1 : 0));

    return (
        <View style={cardStyles.routineCard}>
            <View style={[cardStyles.iconContainer, { backgroundColor: action.backgroundColor }]}>
                <Ionicons name={action.icon} size={24} color={action.iconColor} />
            </View>
            <View style={cardStyles.textContainer}>
                <Text style={cardStyles.routineTitle}>{action.title}</Text>
                <Text style={cardStyles.routineTime}>Done: {doneCount}</Text>
            </View>
            <View style={cardStyles.counterContainer}>
                <TouchableOpacity style={cardStyles.counterButton} onPress={handleDecrement}>
                    <Ionicons name="remove-circle-outline" size={28} color={theme.onSurfaceVariant} />
                </TouchableOpacity>
                <TouchableOpacity style={cardStyles.counterButton} onPress={handleIncrement}>
                    <Ionicons name="add-circle-outline" size={28} color={theme.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const CustomHeader = ({ onSelectTab, selectedTab }: { onSelectTab: (tab: SelectedTab) => void; selectedTab: SelectedTab }) => {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const headerStyles = useMemo(() => getCustomHeaderStyles(theme), [theme]);
    const underlineLeft = useSharedValue(selectedTab === 'routine' ? 0 : 50);

    useEffect(() => {
        underlineLeft.value = withSpring(selectedTab === 'routine' ? 0 : 50, springConfig);
    }, [selectedTab, underlineLeft]);

    const animatedUnderlineStyle = useAnimatedStyle(() => ({ left: `${underlineLeft.value}%` }));
    const handleBackPress = () => { if (router.canGoBack()) router.back(); };

    return (
        <View style={[headerStyles.customHeaderRoot, { paddingTop: insets.top }]}>
            <View style={headerStyles.topAppBar}>
                <TouchableOpacity style={headerStyles.backButton} onPress={handleBackPress}>
                    <Ionicons name="chevron-back" size={28} color={theme.onSurface} />
                </TouchableOpacity>
                <Text style={headerStyles.headerTitle}>Task Actions</Text>
                <View style={headerStyles.headerRightPlaceholder} />
            </View>
            <View style={headerStyles.categoryTabsBar}>
                <TouchableOpacity style={headerStyles.actionButton} onPress={() => onSelectTab('routine')}>
                    <Text style={[headerStyles.actionButtonText, selectedTab === 'routine' && headerStyles.actionButtonTextSelected]}>Routine Actions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={headerStyles.actionButton} onPress={() => onSelectTab('log')}>
                    <Text style={[headerStyles.actionButtonText, selectedTab === 'log' && headerStyles.actionButtonTextSelected]}>Log Specific Action</Text>
                </TouchableOpacity>
                <Animated.View style={[headerStyles.underline, { width: '50%' }, animatedUnderlineStyle]} />
            </View>
        </View>
    );
};

export default function ActionsScreen() {
    const theme = useAppTheme();
    const screenStyles = useMemo(() => getScreenStyles(theme), [theme]);

    const [selectedTab, setSelectedTab] = useState<SelectedTab>('routine');
    const tabPosition = useSharedValue(selectedTab === 'routine' ? 0 : 1);
    const [isAddRoutineModalVisible, setIsAddRoutineModalVisible] = useState(false);
    const [currentActionsData, setCurrentActionsData] = useState<ActionItem[]>(initialActionsData);

    useEffect(() => {
        tabPosition.value = withSpring(selectedTab === 'routine' ? 0 : 1, springConfig);
    }, [selectedTab, tabPosition]);

    const routineAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: interpolate(tabPosition.value, [0, 1], [0, -screenWidth]) }] }));
    const logAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: interpolate(tabPosition.value, [0, 1], [screenWidth, 0]) }] }));

    const lightenColor = (hex: string, percent: number): string => {
        hex = hex.replace(/^\s*#|\s*$/g, '');
        if (hex.length === 3) { hex = hex.replace(/(.)/g, '$1$1'); }
        let r = parseInt(hex.substring(0, 2), 16), g = parseInt(hex.substring(2, 4), 16), b = parseInt(hex.substring(4, 6), 16);
        r = Math.min(255, Math.floor(r + (255 - r) * percent));
        g = Math.min(255, Math.floor(g + (255 - g) * percent));
        b = Math.min(255, Math.floor(b + (255 - b) * percent));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    const handleSaveRoutineAction = (data: ModalRoutineActionData) => {
        const newAction: ActionItem = {
            id: String(Date.now()), title: data.title, icon: data.icon,
            iconColor: data.color, backgroundColor: lightenColor(data.color, 0.85), doneCount: 0,
        };
        setCurrentActionsData(prevActions => [newAction, ...prevActions]);
        setIsAddRoutineModalVisible(false); // Close the modal view
    };

    const handleCloseModal = () => {
        setIsAddRoutineModalVisible(false);
    };

    return (
        <SafeAreaView style={screenStyles.safeArea}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    header: () => (<CustomHeader onSelectTab={setSelectedTab} selectedTab={selectedTab} />),
                }}
            />
            <View style={screenStyles.contentContainer}>
                <Animated.View style={[screenStyles.pageContainer, routineAnimatedStyle]}>
                    <View style={screenStyles.routineSection}>
                        <FlatList
                            data={currentActionsData}
                            renderItem={({ item }) => <ActionCard action={item} />}
                            keyExtractor={(item) => item.id}
                            style={screenStyles.listStyle}
                            contentContainerStyle={screenStyles.listContentStyle}
                            ListFooterComponent={<View style={{ height: 110 }} />}
                        />
                        <TouchableOpacity style={screenStyles.addButton} onPress={() => setIsAddRoutineModalVisible(true)}>
                            <Ionicons name="add" size={24} color={theme.onPrimaryContainer} />
                            <Text style={screenStyles.addButtonText}>Add Routine Action</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
                <Animated.View style={[screenStyles.pageContainer, logAnimatedStyle]}>
                    <View style={screenStyles.logSection}>
                        <Text style={screenStyles.contentText}>Log Specific Action content here.</Text>
                    </View>
                </Animated.View>
            </View>

            {/* Conditional rendering of the custom modal view */}
            {isAddRoutineModalVisible && (
                // This Animated.View provides the overlay and centering
                <Animated.View
                    style={screenStyles.modalOverlay}
                    entering={FadeIn.duration(200)} // Added Reanimated enter animation
                // exiting={FadeOut.duration(200)} // Add exiting if desired, requires careful state management
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ width: '100%', alignItems: 'center' }} // Necessary for KAV to work with centered content
                    >
                        <AddRoutineActionView
                            onClose={handleCloseModal}
                            onSave={handleSaveRoutineAction}
                        />
                    </KeyboardAvoidingView>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

// Styles (getScreenStyles, getCustomHeaderStyles, getActionCardStyles)
const getScreenStyles = (theme: AppTheme) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    contentContainer: { flex: 1, backgroundColor: theme.surface, overflow: 'hidden' },
    pageContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width: screenWidth },
    routineSection: { flex: 1, backgroundColor: theme.surface },
    logSection: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: theme.surfaceContainerLow },
    contentText: { fontSize: 18, color: theme.onSurfaceVariant, textAlign: 'center' },
    listStyle: { flex: 1 },
    listContentStyle: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 /* Adjust if needed for addButton */ },
    addButton: {
        position: 'absolute',
        bottom: Platform.OS === 'android' ? 20 : 0, // Adjusted by user
        left: 20, right: 20, backgroundColor: theme.primaryContainer,
        borderRadius: 28, paddingVertical: 16, flexDirection: 'row',
        justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 3,
    },
    addButtonText: { color: theme.onPrimaryContainer, fontSize: 16, fontWeight: '600', marginLeft: 8 },
    // New style for the modal overlay container
    modalOverlay: {
        ...StyleSheet.absoluteFillObject, // Covers the whole screen
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent background (less dim)
        justifyContent: 'center', // Centers child vertically
        alignItems: 'center',     // Centers child horizontally
        zIndex: 1000, // Ensure it's on top
    },
});

const getCustomHeaderStyles = (theme: AppTheme) => StyleSheet.create({
    customHeaderRoot: { backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.outlineVariant },
    topAppBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
    backButton: { padding: 12 },
    headerTitle: { color: theme.onSurface, fontSize: 20, fontWeight: '600' },
    headerRightPlaceholder: { width: 28 + 24 },
    categoryTabsBar: { flexDirection: 'row', width: '100%', position: 'relative', backgroundColor: theme.surface },
    actionButton: { flex: 1, paddingVertical: 15, alignItems: 'center' },
    actionButtonText: { color: theme.onSurfaceVariant, fontSize: 14, fontWeight: '600' },
    actionButtonTextSelected: { color: theme.primary },
    underline: { height: 3, backgroundColor: theme.primary, position: 'absolute', bottom: 0, borderRadius: 1.5 },
});

const getActionCardStyles = (theme: AppTheme) => StyleSheet.create({
    routineCard: { backgroundColor: theme.surfaceContainer, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    textContainer: { flex: 1, justifyContent: 'center' },
    routineTitle: { fontSize: 16, fontWeight: '600', color: theme.onSurface },
    routineTime: { fontSize: 14, color: theme.onSurfaceVariant, marginTop: 4 },
    counterContainer: { flexDirection: 'row', alignItems: 'center' },
    counterButton: { padding: 8 },
});