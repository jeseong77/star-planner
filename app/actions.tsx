// app/actions.tsx
import { Stack } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, SafeAreaView, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

// Context & Theme
import { useAppTheme } from '@/contexts/AppThemeProvider';

// Components
import { CustomHeader } from '@/components/CustomHeader';
import RoutineTab from '@/components/RoutineTab';// 분리된 컴포넌트
import LogTab from '@/components/LogTab';       // 분리된 컴포넌트
import AddRoutineModal from '@/components/AddRoutineModal'; // 분리된 컴포넌트

// Types
import { ActionItem, SelectedTab, RoutineActionData } from '@/types/actionTypes';

// Data
import { initialActionsData } from '@/data/initialActions';

// Utils
import { lightenColor } from '@/utils/colorUtils';

// Styles
import { getScreenStyles } from '@/styles/actionsStyles';

const { width: screenWidth } = Dimensions.get('window');

const springConfig = {
    damping: 18,
    stiffness: 200,
    mass: 1,
};

export default function ActionsScreen() {
    const theme = useAppTheme();
    const screenStyles = useMemo(() => getScreenStyles(theme), [theme]);

    const [selectedTab, setSelectedTab] = useState<SelectedTab>('routine');
    const tabPosition = useSharedValue(selectedTab === 'routine' ? 0 : 1);
    const [isAddRoutineModalVisible, setIsAddRoutineModalVisible] = useState(false);
    const [currentActionsData, setCurrentActionsData] = useState<ActionItem[]>(initialActionsData);

    // 탭 변경 시 애니메이션 값 업데이트
    useEffect(() => {
        tabPosition.value = withSpring(selectedTab === 'routine' ? 0 : 1, springConfig);
    }, [selectedTab, tabPosition]);

    // 루틴 탭 애니메이션 스타일
    const routineAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: interpolate(tabPosition.value, [0, 1], [0, -screenWidth]) }],
    }));

    // 로그 탭 애니메이션 스타일
    const logAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: interpolate(tabPosition.value, [0, 1], [screenWidth, 0]) }],
    }));

    // 새 루틴 액션 저장 핸들러
    const handleSaveRoutineAction = (data: RoutineActionData) => {
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

    // 모달 닫기 핸들러
    const handleCloseModal = () => {
        setIsAddRoutineModalVisible(false);
    };

    // 모달 열기 핸들러
    const handleOpenModal = () => {
        setIsAddRoutineModalVisible(true);
    }

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
                    <RoutineTab
                        actions={currentActionsData}
                        styles={screenStyles}
                        theme={theme}
                        onAddPress={handleOpenModal}
                    />
                </Animated.View>

                <Animated.View style={[screenStyles.pageContainer, logAnimatedStyle]}>
                    <LogTab styles={screenStyles} />
                </Animated.View>
            </View>

            <AddRoutineModal
                isVisible={isAddRoutineModalVisible}
                onClose={handleCloseModal}
                onSave={handleSaveRoutineAction}
                styles={screenStyles}
            />
        </SafeAreaView>
    );
}