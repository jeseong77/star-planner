import { Tabs } from 'expo-router';
import React from 'react';
import { Animated, Platform, StyleProp } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AntDesign from "@expo/vector-icons/AntDesign";
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ViewStyle } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        headerPressColor: 'transparent',
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
          animation: 'none'
        }}
      />
      <Tabs.Screen
        name="situation"
        options={{
          title: "Situation",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
          animation: 'none'
        }}
      />
      <Tabs.Screen
        name="result"
        options={{
          title: "Result",
          tabBarIcon: ({ color }) => (
            <AntDesign name="profile" size={24} color={color} />
          ),
          animation: 'none'
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <AntDesign name="user" size={24} color={color} />
          ),
          animation: 'none'
        }}
      />
      
    </Tabs>
  );
}
