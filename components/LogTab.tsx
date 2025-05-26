// components/LogTab.tsx
import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';

interface LogTabProps {
    styles: {
        logSection: ViewStyle;
        contentText: TextStyle;
    };
}

const LogTab: React.FC<LogTabProps> = ({ styles }) => {
    return (
        <View style={styles.logSection}>
            <Text style={styles.contentText}>Log Specific Action content here.</Text>
            {/* 향후 로그 관련 UI 추가 */}
        </View>
    );
};

export default LogTab;