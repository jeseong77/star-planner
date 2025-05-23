// app/(tabs)/tasks.tsx
import { Stack } from 'expo-router'; // Stack 컴포넌트를 임포트합니다.
import React, { useState } from 'react'; // useState 훅을 임포트합니다.
import { Text, View, StyleSheet } from 'react-native'; // React Native 컴포넌트 임포트

type SelectedTab = 'routine' | 'log';
// 커스텀 헤더 컴포넌트 정의
// 이 컴포넌트가 'Task Details' 칸(헤더)이 될 것입니다.
const CustomHeader = () => {
    return (
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Task Details</Text>
        </View>
    );
};

export default function TasksScreen() {
    return (
        <>
            {/* 이 Stack.Screen은 이 컴포넌트(TasksScreen) 자체에 적용되는 헤더를 정의합니다. */}
            <Stack.Screen
                options={{
                    headerShown: true, // 헤더를 표시하도록 설정
                    // **여기가 중요합니다: header 속성에 커스텀 컴포넌트를 전달**
                    header: () => <CustomHeader />,
                }}
            />

            {/* 실제 Task Details 화면 내용 */}
            <View style={styles.contentContainer}>
                <Text style={styles.contentText}>여기는 Task Details 화면의 내용입니다.</Text>
                {/* 여기에 Task Details 관련 UI 요소를 추가하세요 */}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        height: 120, // 헤더의 높이를 지정 (원하는 대로 조절 가능)
        backgroundColor: 'white', // 헤더의 배경색 (원하는 색상으로 변경)
        justifyContent: 'center', // 세로 방향으로 가운데 정렬
        alignItems: 'center', // 가로 방향으로 가운데 정렬
        // iOS의 경우 safe area를 고려해야 할 수 있습니다. expo-router의 Safe Area Context를 사용하면 좋습니다.
        // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    headerTitle: {
        color: 'black', // 헤더 텍스트 색상
        fontSize: 20,
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5', // 화면 내용의 배경색
    },
    contentText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});