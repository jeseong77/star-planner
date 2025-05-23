// src/contexts/AppThemeProvider.tsx
import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { PureMD3LightTheme, PureMD3DarkTheme } from '@/constants/Colors';

export type AppTheme = typeof PureMD3LightTheme;

// Create the context with a default theme (e.g., light theme)
const AppThemeContext = createContext<AppTheme>(PureMD3LightTheme);

interface AppThemeProviderProps {
    children: ReactNode;
}

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
    const colorScheme = useSystemColorScheme(); // From 'react-native' or your custom hook

    // useMemo will prevent re-calculating the theme object on every render
    // if the colorScheme hasn't changed.
    const theme = useMemo(() => {
        console.log("Current System Color Scheme:", colorScheme); // For debugging
        return colorScheme === 'dark' ? PureMD3DarkTheme : PureMD3LightTheme;
    }, [colorScheme]);

    return (
        <AppThemeContext.Provider value={theme}>
            {children}
        </AppThemeContext.Provider>
    );
};

/**
 * Custom hook to easily access the current theme object in your components.
 */
export const useAppTheme = (): AppTheme => {
    const context = useContext(AppThemeContext);
    if (context === undefined) {
        throw new Error('useAppTheme must be used within an AppThemeProvider');
    }
    return context;
};