import { Stack, router } from 'expo-router';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

import { useAppTheme, type AppTheme } from '@/contexts/AppThemeProvider'; // Adjust path
import type { RoutineActionData as ModalRoutineActionData } from '@/components/AddRoutineActionForm';
import AddRoutineActionModal from '@/components/AddRoutineActionForm';

const { width: screenWidth } = Dimensions.get('window');
type SelectedTab = 'routine' | 'log';

type ActionItem = {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    doneCount: number;
    iconColor: string; // Color for the icon itself, determined by modal selection
    backgroundColor: string; // Background for the icon container, determined by modal selection
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
                    {/* Use theme color for icon */}
                    <Ionicons name="remove-circle-outline" size={28} color={theme.onSurfaceVariant} />
                </TouchableOpacity>
                <TouchableOpacity style={cardStyles.counterButton} onPress={handleIncrement}>
                    {/* Use theme color for icon */}
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

    const animatedUnderlineStyle = useAnimatedStyle(() => ({
        left: `${underlineLeft.value}%`,
    }));

    const handleBackPress = () => {
        if (router.canGoBack()) {
            router.back();
        }
    };

    return (
        <View style={[headerStyles.customHeaderRoot, { paddingTop: insets.top }]}>
            <View style={headerStyles.topAppBar}>
                <TouchableOpacity style={headerStyles.backButton} onPress={handleBackPress}>
                    {/* Use theme color for icon */}
                    <Ionicons name="chevron-back" size={28} color={theme.onSurface} />
                </TouchableOpacity>
                <Text style={headerStyles.headerTitle}>Task Actions</Text>
                <View style={headerStyles.headerRightPlaceholder} />
            </View>
            <View style={headerStyles.categoryTabsBar}>
                <TouchableOpacity style={headerStyles.actionButton} onPress={() => onSelectTab('routine')}>
                    <Text style={[headerStyles.actionButtonText, selectedTab === 'routine' && headerStyles.actionButtonTextSelected]}>
                        Routine Actions
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={headerStyles.actionButton} onPress={() => onSelectTab('log')}>
                    <Text style={[headerStyles.actionButtonText, selectedTab === 'log' && headerStyles.actionButtonTextSelected]}>
                        Log Specific Action
                    </Text>
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

    const routineAnimatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(tabPosition.value, [0, 1], [0, -screenWidth]);
        return { transform: [{ translateX }] };
    });

    const logAnimatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(tabPosition.value, [0, 1], [screenWidth, 0]);
        return { transform: [{ translateX }] };
    });

    const lightenColor = (hex: string, percent: number): string => {
        hex = hex.replace(/^\s*#|\s*$/g, '');
        if (hex.length === 3) { hex = hex.replace(/(.)/g, '$1$1'); }
        let r = parseInt(hex.substring(0, 2), 16),
            g = parseInt(hex.substring(2, 4), 16),
            b = parseInt(hex.substring(4, 6), 16);
        r = Math.min(255, Math.floor(r + (255 - r) * percent));
        g = Math.min(255, Math.floor(g + (255 - g) * percent));
        b = Math.min(255, Math.floor(b + (255 - b) * percent));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    const handleSaveRoutineAction = (data: ModalRoutineActionData) => {
        const newAction: ActionItem = {
            id: String(Date.now()),
            title: data.title,
            icon: data.icon,
            iconColor: data.color,
            backgroundColor: lightenColor(data.color, 0.85),
            doneCount: 0,
        };
        setCurrentActionsData(prevActions => [newAction, ...prevActions]);
        setIsAddRoutineModalVisible(false);
    };

    const handleCloseModal = () => {
        setIsAddRoutineModalVisible(false);
    };

    return (
        <SafeAreaView style={screenStyles.safeArea}>
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
                        <TouchableOpacity
                            style={screenStyles.addButton}
                            onPress={() => setIsAddRoutineModalVisible(true)}
                        >
                            {/* Use theme color for icon */}
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

            <AddRoutineActionModal
                visible={isAddRoutineModalVisible}
                onClose={handleCloseModal}
                onSave={handleSaveRoutineAction}
            />
        </SafeAreaView>
    );
}

// Moved StyleSheet creation into functions that accept theme
const getScreenStyles = (theme: AppTheme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.background, // MD3: Main background for the screen
    },
    contentContainer: {
        flex: 1,
        backgroundColor: theme.surface, // MD3: Base surface for content areas
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
        backgroundColor: theme.surface, // Matches content container or could be different
    },
    logSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: theme.surfaceContainerLow, // A slightly different surface
    },
    contentText: {
        fontSize: 18,
        color: theme.onSurfaceVariant,
        textAlign: 'center',
    },
    listStyle: {
        flex: 1,
    },
    listContentStyle: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    addButton: {
        position: 'absolute',
        bottom: Platform.OS === 'android' ? 20 : 0,
        left: 20,
        right: 20,
        backgroundColor: theme.primaryContainer, // MD3: Button background
        borderRadius: 28, // MD3 Extended FAB often has larger radius
        paddingVertical: 16, // Adjusted padding for FAB feel
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        elevation: 3, // MD3 elevation
    },
    addButtonText: {
        color: theme.onPrimaryContainer, // MD3: Text on button
        fontSize: 16,
        fontWeight: '600', // Medium weight
        marginLeft: 8,
    },
});

const getCustomHeaderStyles = (theme: AppTheme) => StyleSheet.create({
    customHeaderRoot: {
        backgroundColor: theme.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.outlineVariant, // Subtle border
    },
    topAppBar: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8, // Adjusted for icon touch areas
    },
    backButton: {
        padding: 12, // Slightly larger touch area
    },
    headerTitle: {
        color: theme.onSurface, // Text on header surface
        fontSize: 20, // MD3 Title Large or Medium
        fontWeight: '600',
    },
    headerRightPlaceholder: {
        width: 28 + 24,
    },
    categoryTabsBar: {
        flexDirection: 'row',
        width: '100%',
        position: 'relative',
        backgroundColor: theme.surface, // Tabs background
    },
    actionButton: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    actionButtonText: {
        color: theme.onSurfaceVariant, // Inactive tab text
        fontSize: 14, // MD3 Label Large
        fontWeight: '600',
    },
    actionButtonTextSelected: {
        color: theme.primary, // Active tab text
    },
    underline: {
        height: 3,
        backgroundColor: theme.primary, // Active tab indicator
        position: 'absolute',
        bottom: 0,
        borderRadius: 1.5, // Rounded indicator
    },
});

const getActionCardStyles = (theme: AppTheme) => StyleSheet.create({
    routineCard: {
        backgroundColor: theme.surfaceContainer, // Use a standard container color
        borderRadius: 12, // MD3 card radius
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    routineTitle: {
        fontSize: 16, // MD3 Title Medium / Body Large
        fontWeight: '600',
        color: theme.onSurface,
    },
    routineTime: {
        fontSize: 14, // MD3 Body Medium
        color: theme.onSurfaceVariant, // Less emphasized text
        marginTop: 4,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterButton: {
        padding: 8, // Make touch target larger
    },
});