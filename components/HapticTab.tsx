import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { GestureResponderEvent, Platform } from 'react-native'; // Import for event type

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      android_ripple={{ color: 'transparent' }} // This disables the visual ripple effect on Android
      onPressIn={(ev: GestureResponderEvent) => {
        if (Platform.OS === 'ios') { // Using React Native's Platform API is more standard
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev); // Call original onPressIn if it exists
      }}
    />
  );
}