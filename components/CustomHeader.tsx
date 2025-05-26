// components/CustomHeader.tsx
import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme, type AppTheme } from '@/contexts/AppThemeProvider';
import { SelectedTab } from '@/types/actionTypes';

type CustomHeaderProps = {
    onSelectTab: (tab: SelectedTab) => void;
    selectedTab: SelectedTab;
};

const springConfig = {
    damping: 18,
    stiffness: 200,
    mass: 1,
};

export const CustomHeader = ({ onSelectTab, selectedTab }: CustomHeaderProps) => {
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

const getCustomHeaderStyles = (theme: AppTheme) => StyleSheet.create({
    customHeaderRoot: {
        backgroundColor: theme.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.outlineVariant,
        elevation: 2, 
        shadowColor: '#000',
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
        padding: 12,
    },
    headerTitle: {
        color: theme.onSurface,
        fontSize: 20,
        fontWeight: '600',
    },
    headerRightPlaceholder: {
        width: 28 + 24,
    },
    categoryTabsBar: {
        flexDirection: 'row',
        width: '100%',
        position: 'relative',
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