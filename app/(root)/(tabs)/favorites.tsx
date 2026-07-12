import PropertyCard from '@/components/PropertyCard';
import { useSupabase } from '@/hooks/useSupabase';
import { fetchSavedProperties } from '@/services/saved';
import { SavedProperty } from '@/types';
import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FavoritesScreen() {
    const { userId } = useAuth();
    const authSupabase = useSupabase();
    const router = useRouter();

    const [savedHomes, setSavedHomes] = useState<SavedProperty[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadSaved = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        const data = await fetchSavedProperties(userId, authSupabase);
        setSavedHomes(data);
        setIsLoading(false);
    }, [userId])

    // Refresh every time the tab comes into focus
    useFocusEffect(
        useCallback(() => {
            loadSaved();
        }, [loadSaved]),
    );

    return (
        <View className="flex-1 bg-accent-100">
            {/* Dark header — same pattern as Home & Search so all tabs feel like one app */}
            <SafeAreaView edges={["top"]} className="bg-accent rounded-b-[28px]">
                <View className="px-5 pt-3 pb-6">
                    <Text className="text-white text-2xl font-bold">Favorites</Text>
                    {!isLoading && (
                        <Text className="text-accent-300 text-sm mt-1">
                            {savedHomes.length}{" "}
                            {savedHomes.length === 1 ? "property" : "properties"} saved
                        </Text>
                    )}
                </View>
            </SafeAreaView>

            <SafeAreaView edges={["bottom", "left", "right"]} className="flex-1">
                {isLoading ? (
                    <View className="flex-1 flexCenter">
                        <ActivityIndicator size="large" color="#F5A623" />
                    </View>
                ) : (
                    <FlatList
                        data={savedHomes}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <PropertyCard
                                property={item.properties}
                                onUnSave={() =>
                                    setSavedHomes((prev) => prev.filter((s) => s.id !== item.id))
                                }
                                showSave
                            />
                        )}
                        ListEmptyComponent={
                            <View className="flex-1 flexCenter py-24">
                                <View className="w-20 h-20 bg-primary/20 rounded-full flexCenter mb-4">
                                    <Ionicons name="heart-outline" size={36} color="#F5A623" />
                                </View>
                                <Text className="text-accent text-lg font-bold mb-1">
                                    No saved properties
                                </Text>
                                <Text className="text-accent-300 text-sm text-center px-8">
                                    Tap the heart icon on any property to save it here
                                </Text>
                                <TouchableOpacity
                                    onPress={() => router.push("/(root)/(tabs)/explore")}
                                    className="mt-6 bg-primary px-6 py-3 rounded-full"
                                >
                                    <Text className="text-accent font-bold">
                                        Browse Properties
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    )
}