import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, isLoaded } = useUser();
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleChangePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          "Allow photo access to update your picture.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (result.canceled) return;

      setIsUpdatingPhoto(true);
      const { base64, uri } = result.assets[0];
      const extension = /\.(\w+)$/.exec(uri)?.[1] ?? "jpeg";
      await user?.setProfileImage({
        file: `data:image/${extension};base64,${base64}`,
      });
      Alert.alert("Success", "Profile picture updated!");

    } catch (error) {
      console.error("Photo update failed:", error);
      Alert.alert("Error", "Couldn't update your picture. Please try again.");
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F4EF] flexCenter">
        <ActivityIndicator size="large" color="#F5A623" />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-[#F8F4EF]">
      {/* Dark header */}
      <SafeAreaView edges={["top"]} className="bg-accent rounded-b-[28px]">
        <View className="px-5 pt-5 pb-7">
          {/* Avatar row */}
          <View className="flex-row items-center gap-4">
            <View className="relative">
              <Image
                source={{ uri: user.imageUrl }}
                className="w-20 h-20 rounded-3xl"
              />
              <TouchableOpacity
                onPress={handleChangePhoto}
                disabled={isUpdatingPhoto}
                className="absolute -bottom-2 -right-2 bg-primary rounded-full p-1.5"
              >
                {isUpdatingPhoto ? (
                  <ActivityIndicator size="small" color="#1C1C2E" />
                ) : (
                  <Ionicons name="camera" size={13} color="#1C1C2E" />
                )}
              </TouchableOpacity>
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">
                {user.firstName} {user.lastName}
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
                {user.emailAddresses[0].emailAddress}
              </Text>
              <View className="flex-row items-center gap-1 mt-2 self-start bg-primary/20 px-2.5 py-1 rounded-full">
                <Ionicons name="checkmark-circle" size={11} color="#F5A623" />
                <Text className="text-primary text-[10px] font-semibold">
                  Verified Member
                </Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <SafeAreaView edges={["bottom", "left", "right"]} className="flex-1">
        <View className="px-5 pt-6 gap-2">
          {/* Section label */}
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 mb-1">
            Account
          </Text>
          <MenuItem
            icon="bookmark-outline"
            label="Saved Properties"
            onPress={() => router.push("/(root)/(tabs)/favorites")}
          />
          <MenuItem
            icon="time-outline"
            label="Recently Viewed"
            onPress={() => Alert.alert("Coming Soon", "Coming soon!")}
          />

          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 mt-3 mb-1">
            General
          </Text>
          <MenuItem
            icon="shield-checkmark-outline"
            label="Privacy & Security"
            onPress={() => Alert.alert("Coming Soon", "Coming soon!")}
          />
          <MenuItem
            icon="mail-outline"
            label="Contact Us"
            onPress={async () => {
              const url =
                "mailto:dummy@gmail.com?subject=Help%20%26%20Support%20-%20Estora%20App";
              const canOpen = await Linking.canOpenURL(url);
              if (canOpen) {
                Linking.openURL(url);
              } else {
                Alert.alert(
                  "No Mail App",
                  "Please install a mail app to contact us.",
                );
              }
            }}
          />
          <MenuItem
            icon="information-circle-outline"
            label="About Estora"
            onPress={() => Alert.alert("Estora", "Version 1.0.0")}
          />
        </View>

        {/* Sign out */}
        <View className="px-5 mt-28">
          <TouchableOpacity
            onPress={handleSignOut}
            className="btn bg-red-50 border border-red-100"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-red-500 font-semibold text-base">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}


function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-3 bg-white px-4 py-3.5 rounded-2xl"
      style={{ borderWidth: 1, borderColor: "#F0EBE3" }}
    >
      <View className="w-8 h-8 rounded-xl bg-accent flexCenter">
        <Ionicons name={icon} size={15} color="#F5A623" />
      </View>
      <Text className="flex-1 text-accent font-medium text-sm">{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    </TouchableOpacity>
  );
}