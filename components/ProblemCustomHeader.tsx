// components/ProblemCustomHeader.tsx
import React, { useMemo, useCallback } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Problem } from '@/types'; // 경로 확인 및 수정 필요
import { useAppTheme, type AppTheme } from '../contexts/AppThemeProvider'; // 경로 확인 및 수정 필요

// --- ProblemChip (내부 컴포넌트) ---
interface ProblemChipProps {
    problem: Problem;
    onPress: () => void;
    isSelected: boolean;
}

const chipStyles = (theme: AppTheme) =>
    StyleSheet.create({
        chip: {
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            marginHorizontal: 6,
            borderWidth: 1,
        },
        chipDefault: {
            backgroundColor: theme.surfaceContainerHigh,
            borderColor: theme.outlineVariant,
        },
        chipSelected: {
            backgroundColor: theme.primary,
            borderColor: theme.primary,
        },
        chipText: {
            fontSize: 14,
            fontWeight: '500',
        },
        chipTextDefault: {
            color: theme.onSurfaceVariant,
        },
        chipTextSelected: {
            color: theme.onPrimary,
        },
    });

const ProblemChip: React.FC<ProblemChipProps> = ({ problem, onPress, isSelected }) => {
    const theme = useAppTheme();
    const styles = useMemo(() => chipStyles(theme), [theme]);

    return (
        <TouchableOpacity
            style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipDefault,
            ]}
            onPress={onPress}
        >
            <Text
                style={[
                    styles.chipText,
                    isSelected ? styles.chipTextSelected : styles.chipTextDefault,
                ]}
            >
                {problem.name}
            </Text>
        </TouchableOpacity>
    );
};


// --- ProblemCustomHeader (메인 컴포넌트 - 이름 변경) ---
interface ProblemCustomHeaderProps { // 인터페이스 이름도 변경
    problems: Problem[];
    selectedProblemId: string | null;
    onSelectProblem: (id: string) => void;
    onAddProblem: () => void;
}

const getHeaderStyles = (theme: AppTheme) =>
    StyleSheet.create({
        headerContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 10,
            backgroundColor: theme.surface,
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: 'bold',
            color: theme.onSurface,
        },
        chipsContainer: {
            paddingVertical: 10,
            paddingLeft: 10,
            backgroundColor: theme.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.outlineVariant,
        },
        chipsListContent: {
            paddingRight: 10,
        },
    });

export const ProblemCustomHeader: React.FC<ProblemCustomHeaderProps> = ({
    problems,
    selectedProblemId,
    onSelectProblem,
    onAddProblem,
}) => {
    const theme = useAppTheme();
    const styles = useMemo(() => getHeaderStyles(theme), [theme]);

    const renderProblemChip = useCallback(
        ({ item }: { item: Problem }) => (
            <ProblemChip
                problem={item}
                onPress={() => onSelectProblem(item.id)}
                isSelected={item.id === selectedProblemId}
            />
        ),
        [selectedProblemId, onSelectProblem]
    );

    return (
        <>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Problems</Text>
                <TouchableOpacity onPress={onAddProblem}>
                    <Ionicons name="add-circle-outline" size={30} color={theme.primary} />
                </TouchableOpacity>
            </View>
            <View style={styles.chipsContainer}>
                <FlatList
                    data={problems}
                    renderItem={renderProblemChip}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsListContent}
                />
            </View>
        </>
    );
};