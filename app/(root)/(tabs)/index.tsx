import FeaturedCard from '@/components/FeaturedCard';
import PropertyCard from '@/components/PropertyCard';
import { fetchFeaturedProperties, fetchRecommendedProperties } from '@/services/properties';
import { Property } from '@/types';
import { useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
    const { user } = useUser();
    const router = useRouter();

    const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
    const [recommendedProperties, setRecommendedProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    const loadHomes = async () => {
        setIsLoading(true);
        const [featured, recommended] = await Promise.all([
            fetchFeaturedProperties(),
            fetchRecommendedProperties(),
        ]);
        setFeaturedProperties(featured);
        setRecommendedProperties(recommended);
        setIsLoading(false);
    }

    useFocusEffect(
        useCallback(() => {
            loadHomes();
        }, [])
    )

    return (
        <View className='flex-1'>
            <SafeAreaView edges={["top"]} className="bg-accent rounded-b-[28px]">
                <View className="flex-row flexBetween px-5 pt-3 pb-5">
                    <Image
                        source={require("../../../assets/images/logo.png")}
                        style={{ width: 90, height: 36 }}
                        resizeMode="contain"
                    />
                    {/* User profile section grouped horizontally */}
                    <View className="flex-row items-center gap-3">
                        <View className="items-end">
                            <Text className="text-white text-base font-bold">
                                Hi {user?.firstName ?? "there"} 👋
                            </Text>
                        </View>

                        <View className="w-11 h-11 rounded-full border-2 border-primary flexCenter">
                            {user?.imageUrl ? (
                                <Image source={{ uri: user.imageUrl }} className="w-9 h-9 rounded-full" />
                            ) : (
                                <View className="w-9 h-9 rounded-full bg-primary flexCenter">
                                    <Text className="text-accent font-bold text-xs">{user?.firstName?.charAt(0)}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
                <View className="px-5 pb-6">
                    <View className="flex-row items-center self-start bg-white/10 rounded-full px-3 py-1 gap-1 mb-5">
                        <Ionicons name="location" size={12} color="#F5A623" />
                        <Text className="text-primary text-xs font-semibold">Homes near you</Text>
                    </View>
                    {/* Search bar */}
                    <TouchableOpacity
                        onPress={() => router.push("/(root)/(tabs)/explore")}
                        className="flex-row items-center bg-white rounded-full pl-4 pr-2 gap-3"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 10,
                            elevation: 4,
                        }}
                    >
                        <Ionicons name="search" size={18} color="#9CA3AF" />
                        <Text className="flex-1 py-3 text-gray-400 text-sm">Search by title or city...</Text>
                        <TouchableOpacity
                            onPress={() => router.push("/(root)/(tabs)/explore?openFilters=true")}
                            className="w-8 h-8 rounded-full flexCenter bg-primary"
                        >
                            <Ionicons name="filter" size={14} color="#1C1C2E" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            <SafeAreaView edges={["bottom", "left", "right"]} className="flex-1">
                <FlatList
                    data={recommendedProperties}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 24 }}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View>
                            {/* Featured section */}
                            <View className="mb-6">
                                <Text className="text-accent text-lg font-bold px-5 mb-4">Featured</Text>

                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#F5A623" className="py-10" />
                                ) : (
                                    <FlatList
                                        data={featuredProperties}
                                        keyExtractor={(item) => item.id}
                                        renderItem={({ item }) => <FeaturedCard property={item} />}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ paddingHorizontal: 20, marginBottom: 20 }}
                                    />
                                )}
                            </View>
                            <Text className="text-dark text-lg font-bold px-5 mb-4">
                                Recommended for you
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View className="px-5">
                            <PropertyCard property={item} />
                        </View>
                    )}
                    ListEmptyComponent={
                        !isLoading ? (
                            <View className="items-center py-10">
                                <Text className="text-gray-400">No properties found</Text>
                            </View>
                        ) : null
                    }
                />
            </SafeAreaView>
        </View >
    )
}