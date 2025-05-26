import React from "react";
import { SafeAreaView, View } from "react-native";
import ProfileCard from "@/components/ProfileCard";

export default function ProfileScreen() {
  return (
    <>
    <SafeAreaView>
        <View style={{paddingTop: 16}}></View>
        <ProfileCard />
    </SafeAreaView>
    </>
  );
}