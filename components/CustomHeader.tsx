// components/CustomHeader.tsx
import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme, type AppTheme } from '@/contexts/AppThemeProvider'; // 경로는 프로젝트에 맞게 조정하세요
import { SelectedTab } from '@/types/actionTypes'; // 경로는 프로젝트에 맞게 조정하세요

type CustomHeaderProps = {
    onSelectTab: (tab: SelectedTab) => void;
    selectedTab: SelectedTab;
};

/** 애니메이션을 위한 Spring 설정 */
const springConfig = {
    damping: 18,
    stiffness: 200,
    mass: 1,
};

/** 커스텀 헤더 컴포넌트 (뒤로가기, 타이틀, 탭 포함) */
export const CustomHeader = ({ onSelectTab, selectedTab }: CustomHeaderProps) => {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const headerStyles = useMemo(() => getCustomHeaderStyles(theme), [theme]);
    const underlineLeft = useSharedValue(selectedTab === 'routine' ? 0 : 50);

    // 선택된 탭이 변경되면 밑줄 애니메이션 실행
    useEffect(() => {
        underlineLeft.value = withSpring(selectedTab === 'routine' ? 0 : 50, springConfig);
    }, [selectedTab, underlineLeft]);

    // 밑줄의 왼쪽 위치를 애니메이션화하는 스타일
    const animatedUnderlineStyle = useAnimatedStyle(() => ({
        left: `${underlineLeft.value}%`,
    }));

    // 뒤로가기 버튼 핸들러
    const handleBackPress = () => {
        if (router.canGoBack()) {
            router.back();
        }
    };

    return (
        <View style={[headerStyles.customHeaderRoot, { paddingTop: insets.top }]}>
            {/* 상단 앱 바 (뒤로가기, 타이틀) */}
            <View style={headerStyles.topAppBar}>
                <TouchableOpacity style={headerStyles.backButton} onPress={handleBackPress}>
                    <Ionicons name="chevron-back" size={28} color={theme.onSurface} />
                </TouchableOpacity>
                <Text style={headerStyles.headerTitle}>Task Actions</Text>
                <View style={headerStyles.headerRightPlaceholder} /> {/* 타이틀 중앙 정렬을 위한 빈 공간 */}
            </View>
            {/* 카테고리 탭 바 */}
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
                {/* 탭 밑줄 애니메이션 */}
                <Animated.View style={[headerStyles.underline, { width: '50%' }, animatedUnderlineStyle]} />
            </View>
        </View>
    );
};

/** CustomHeader 컴포넌트의 스타일을 생성하는 함수 */
const getCustomHeaderStyles = (theme: AppTheme) => StyleSheet.create({
    customHeaderRoot: {
        backgroundColor: theme.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.outlineVariant,
        elevation: 2, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    topAppBar: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    backButton: {
        padding: 12, // 터치 영역 확보
    },
    headerTitle: {
        color: theme.onSurface,
        fontSize: 20,
        fontWeight: '600',
    },
    headerRightPlaceholder: {
        width: 28 + 24, // 아이콘 크기 + 패딩 (backButton과 대칭)
    },
    categoryTabsBar: {
        flexDirection: 'row',
        width: '100%',
        position: 'relative', // 밑줄의 absolute 포지션을 위함
        backgroundColor: theme.surface,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    actionButtonText: {
        color: theme.onSurfaceVariant,
        fontSize: 14,
        fontWeight: '600',
    },
    actionButtonTextSelected: {
        color: theme.primary,
    },
    underline: {
        height: 3,
        backgroundColor: theme.primary,
        position: 'absolute',
        bottom: 0,
        borderRadius: 1.5,
    },
});