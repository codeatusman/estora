import { useSavedProperty } from '@/hooks/useSavedProperty';
import { formatPrice } from '@/lib/utils';
import { Property } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function PropertyCard({ property, onUnSave, showSave = false }: {
    property: Property
    onUnSave?: () => void;
    showSave?: boolean;
}) {
    const router = useRouter();
    const { isSaved, saveLoading, toggleSave } = useSavedProperty(
        property.id,
        onUnSave,
    );

    return (
        <TouchableOpacity
            onPress={() => router.push(`/(root)/property/${property.id}`)}
            activeOpacity={0.85}
            className="flex-row items-center bg-white rounded-3xl mb-4 pr-1 gap-3 border border-accent-200"
            style={{
                opacity: property.is_sold ? 0.5 : 1,
            }}
        >
            {/* Thumbnail */}
            <Image
                source={{ uri: property.images[0] }}
                className="w-36 h-[89px] rounded-2xl"
                resizeMode="cover"
            />

            {/* Info */}
            <View className="flex-1 gap-2">
                <View>
                    <Text className="text-sm font-bold text-accent" numberOfLines={1}>
                        {property.title}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-0.5">
                        <Ionicons name="location-outline" size={11} color="#9CA3AF" />
                        <Text className="text-xs text-gray-400" numberOfLines={1}>
                            {property.city}
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center gap-3">
                    <View className="bg-accent/80 px-2.5 py-1 rounded-full">
                        <Text className="text-primary font-bold text-xs capitalize">
                            {property.type}
                        </Text>
                    </View>
                    <View className="bg-primary/20 px-2.5 py-1 rounded-full">
                        <Text className="text-primary font-bold text-xs">
                            {formatPrice(property.price)}
                        </Text>
                    </View>
                    {property.is_sold && (
                        <View className="bg-red-50 px-2 py-0.5 rounded-full">
                            <Text className="text-red-500 text-[10px] font-semibold">
                                Sold
                            </Text>
                        </View>
                    )}
                </View>

                <View className="flex-row gap-3">
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="bed-outline" size={11} color="#9CA3AF" />
                        <Text className="text-xs text-gray-400">
                            {property.bedrooms} bd
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="expand-outline" size={11} color="#9CA3AF" />
                        <Text className="text-xs text-gray-400">
                            {property.area_sqft} ft²
                        </Text>
                    </View>
                </View>
            </View>

            {/* Save Button */}
            {showSave && (
                <TouchableOpacity
                    onPress={toggleSave}
                    disabled={saveLoading}
                    className="w-9 h-9 rounded-full bg-accent-100 flexCenter"
                >
                    <Ionicons
                        name={isSaved ? "heart" : "heart-outline"}
                        size={16}
                        color={isSaved ? "#F5A623" : "#9CA3AF"}
                    />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    )
}