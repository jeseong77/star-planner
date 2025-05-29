import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface StarDiaryProps {
    problemName: string;
    situation: string;
    task: string;
    action: string;
    result: string;
}

// StarDiary 컴포넌트가 props (여기서는 { problemName, situation, ... })를 받도록 수정합니다.
export default function StarDiary({ problemName, situation, task, action, result }: StarDiaryProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Retrospective Detail</Text>
            {/* problemName prop을 사용합니다. */}
            <Text style={styles.problemname}>
                PROBLEM: {problemName}
            </Text>
            <Text style={styles.startitle}>
                Situation
            </Text>
            {/* situation prop을 사용합니다. */}
            <Text style={styles.stardiscription}>
                {situation}
            </Text>
            <Text style={styles.startitle}>
                Task
            </Text>
            {/* task prop을 사용합니다. */}
            <Text style={styles.stardiscription}>
                {task}
            </Text>
            <Text style={styles.startitle}>
                Action
            </Text>
            {/* action prop을 사용합니다. */}
            <Text style={styles.stardiscription}>
                {action}
            </Text>
            <Text style={styles.startitle}>
                Result
            </Text>
            {/* result prop을 사용합니다. */}
            <Text style={styles.stardiscription}>
                {result}
            </Text>
        </View>
    );
}

// 스타일 시트는 이전과 동일합니다.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
        padding: 30, // 컨테이너에 전체적인 패딩 추가 (상하좌우 여백)
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20, // title 아래 간격
    },
    problemname: {
        fontSize: 16,
        color: "#666",
        marginBottom: 30, // problemname 아래 간격
    },
    startitle: {
        fontSize: 20,       // 크기 증가
        color: "#000000",   // 검정색으로 변경
        fontWeight: "bold", // 굵게 변경
        marginBottom: 10,   // startitle 아래 간격
    },
    stardiscription: {
        fontSize: 16,
        color: "#000000",   // 검정색으로 변경
        marginBottom: 25,   // stardiscription 아래 간격
        lineHeight: 24,     // 줄 간격 추가 (가독성 향상)
    },
});