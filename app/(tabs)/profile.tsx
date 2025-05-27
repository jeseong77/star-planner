import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import ProfileCard from "@/components/ProfileCard";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{flex: 1}}>
        <View style={{paddingTop: 16}}></View>
        <ProfileCard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})