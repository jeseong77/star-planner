// app/(tabs)/tasks.tsx
import { Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform, StatusBar, FlatList, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
type SelectedTab = 'routine' | 'log';
type Action = {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    initialDoneCount: number;
    iconColor: string;
    backgroundColor: string;
};
const actionsData: Action[] = [
    { id: '1', icon: 'sunny-outline', title: 'Morning Routine', initialDoneCount: 0, iconColor: '#FFA500', backgroundColor: '#FFF3E0' },
    { id: '2', icon: 'restaurant-outline', title: 'Lunch Break', initialDoneCount: 0, iconColor: '#4CAF50', backgroundColor: '#E8F5E9' },
    { id: '3', icon: 'moon-outline', title: 'Evening Routine', initialDoneCount: 0, iconColor: '#673AB7', backgroundColor: '#EDE7F6' },
    { id: '4', icon: 'walk-outline', title: 'Afternoon Walk', initialDoneCount: 0, iconColor: '#03A9F4', backgroundColor: '#E1F5FE' },
    { id: '5', icon: 'book-outline', title: 'Reading Time', initialDoneCount: 0, iconColor: '#795548', backgroundColor: '#EFEBE9' },
    { id: '6', icon: 'fitness-outline', title: 'Workout', initialDoneCount: 0, iconColor: '#F44336', backgroundColor: '#FFEBEE' },
];

// 스프링 설정 (힘 빼기)
const springConfig = {
    damping: 18, // 출렁임 줄이기 (값을 높임)
    stiffness: 200, // 부드럽게 움직이도록 (값을 낮춤)
    mass: 1, // 기본값 유지 (필요시 조정)
};

const ActionCard = ({ action }: { action: Action }) => {
    const [doneCount, setDoneCount] = useState(action.initialDoneCount);
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
    const underlineLeft = useSharedValue(selectedTab === 'routine' ? 0 : 50);

    useEffect(() => {
        // ▼▼▼ 여기에 springConfig 적용 ▼▼▼
        underlineLeft.value = withSpring(selectedTab === 'routine' ? 0 : 50, springConfig);
    }, [selectedTab]);

    const animatedUnderlineStyle = useAnimatedStyle(() => {
        return {
            left: `${underlineLeft.value}%`,
        };
    });

    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Task Details</Text>
            <View style={styles.actionButtonsContainer}>
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

export default function TasksScreen() {
    const [selectedTab, setSelectedTab] = useState<SelectedTab>('routine');
    const tabPosition = useSharedValue(selectedTab === 'routine' ? 0 : 1);

    useEffect(() => {
        // ▼▼▼ 여기에 springConfig 적용 ▼▼▼
        tabPosition.value = withSpring(selectedTab === 'routine' ? 0 : 1, springConfig);
    }, [selectedTab]);

    const routineAnimatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            tabPosition.value,
            [0, 1],
            [0, -screenWidth]
        );
        return { transform: [{ translateX }] };
    });

    const logAnimatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            tabPosition.value,
            [0, 1],
            [screenWidth, 0]
        );
        return { transform: [{ translateX }] };
    });

    return (
        <>
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
                            data={actionsData}
                            renderItem={({ item }) => <ActionCard action={item} />}
                            keyExtractor={(item) => item.id}
                            style={styles.listStyle}
                            contentContainerStyle={styles.listContentStyle}
                            ListFooterComponent={<View style={{ height: 90 }} />}
                        />
                        <TouchableOpacity style={styles.addButton}>
                            <Ionicons name="add" size={24} color="white" />
                            <Text style={styles.addButtonText}>Add Routine Action</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
                <Animated.View style={[styles.pageContainer, logAnimatedStyle]}>
                    <View style={styles.logSection}>
                        <Text style={styles.contentText}>Log Specific Action 내용이 여기에 표시됩니다.</Text>
                    </View>
                </Animated.View>
            </View>
        </>
    );
}

// 스타일 시트 (이전과 동일)
const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: 'white',
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) : 50,
        paddingBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    backButton: {
        position: 'absolute',
        left: 15,
        top: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 5 : 55,
        zIndex: 1,
    },
    headerTitle: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    actionButtonsContainer: {
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
    },
    addButton: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 30 : 20,
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
        shadowOffset: { width: 0, height: 2, },
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