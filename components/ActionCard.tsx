// components/ActionCard.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme, type AppTheme } from '@/contexts/AppThemeProvider';
import { ActionItem } from '@/types';

type ActionCardProps = {
    action: ActionItem;
};

export const ActionCard = ({ action }: ActionCardProps) => {
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

const getActionCardStyles = (theme: AppTheme) => StyleSheet.create({
    routineCard: {
        backgroundColor: theme.surfaceContainer,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
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
        fontSize: 16,
        fontWeight: '600',
        color: theme.onSurface,
    },
    routineTime: {
        fontSize: 14,
        color: theme.onSurfaceVariant,
        marginTop: 4,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterButton: {
        padding: 8,
    },
});