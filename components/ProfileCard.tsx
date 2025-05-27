// ProfileCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AppTheme, useAppTheme } from "@/contexts/AppThemeProvider";
import { Image } from 'react-native';

export default function ProfileCard() {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return ( // <--- ADDED RETURN STATEMENT
        <View style={styles.container}>
            <View style={styles.avatarContainer}>
                <Image style={styles.image} source={require('@/assets/images/bbun.png')}/>
            </View>
            <Text style={styles.text}>이그린</Text>
            <Text style={styles.text}>@greeeeeniii</Text>
            <Text style={styles.text}>개발자</Text>
        </View>
    );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        backgroundColor: theme.surfaceContainer,
        borderRadius: 20,
        shadowColor: 'black',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        margin: 16,
    },
    text: {
        color: theme.onSurface,
        fontSize: 16,
        fontWeight: "500",
    },
    avatarContainer: {
        marginBottom: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: theme.primary,
    },
})