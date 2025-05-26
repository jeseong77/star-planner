// ProfileCard.tsx
import React from "react";
import { View, Text } from "react-native";
import { useAppTheme } from "@/contexts/AppThemeProvider";

export default function ProfileCard() {
    const theme = useAppTheme();

    return (
        <View style={{ padding: 16, backgroundColor: theme.surfaceContainer, borderRadius: 12 }}>
            <Text style={{ color: theme.onSurface }}>Profile Information</Text>
        </View>
    );
}