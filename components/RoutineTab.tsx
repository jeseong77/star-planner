// components/RoutineTab.tsx
import React from 'react';
import { View, FlatList, TouchableOpacity, Text, ViewStyle, TextStyle, ListRenderItem } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Components
import { ActionCard } from '@/components/ActionCard';

// Types
import { ActionItem } from '@/types/actionTypes';
import { AppTheme } from '@/contexts/AppThemeProvider';

interface RoutineTabProps {
    actions: ActionItem[];
    styles: {
        routineSection: ViewStyle;
        listStyle: ViewStyle;
        listContentStyle: ViewStyle;
        addButton: ViewStyle;
        addButtonText: TextStyle;
    };
    theme: AppTheme;
    onAddPress: () => void;
}

const RoutineTab: React.FC<RoutineTabProps> = ({ actions, styles, theme, onAddPress }) => {

    const renderItem: ListRenderItem<ActionItem> = ({ item }) => <ActionCard action={item} />;

    return (
        <View style={styles.routineSection}>
            <FlatList
                data={actions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                style={styles.listStyle}
                contentContainerStyle={styles.listContentStyle}
                ListFooterComponent={<View style={{ height: 110 }} />}
            />
            <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
                <Ionicons name="add" size={24} color={theme.onPrimaryContainer} />
                <Text style={styles.addButtonText}>Add Routine Action</Text>
            </TouchableOpacity>
        </View>
    );
};

export default RoutineTab;