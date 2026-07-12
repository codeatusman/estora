import { formatPrice } from '@/lib/utils'
import { Property } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

export default function FeaturedCard({ property }: { property: Property }) {
    const router = useRouter()

    return (
        <TouchableOpacity
            onPress={() => router.push(`/(root)/property/${property.id}`)}
            activeOpacity={0.9}
            className="w-[288px] mr-4 rounded-[28px] overflow-hidden bg-accent"
            style={{ opacity: property.is_sold ? 0.5 : 1 }}
        >
            <View className="relative">
                <Image source={{ uri: property.images[0] }} className="w-full h-52" resizeMode="cover" />

                {/* Top row: type pill + sold flag */}
                <View className="absolute top-3 left-3 right-3 flex-row justify-between">
                    <View className="bg-primary px-3 py-1 rounded-full">
                        <Text className="text-[10px] font-bold text-accent uppercase tracking-wide">
                            {property.type}
                        </Text>
                    </View>
                    {property.is_sold && (
                        <View className="bg-red-500 px-3 py-1 rounded-full">
                            <Text className="text-[10px] font-bold text-white uppercase">Sold</Text>
                        </View>
                    )}
                </View>

                {/* Bottom info strip floats over the photo */}
                <View className="absolute bottom-0 left-0 right-0 bg-accent/70 px-4 py-2">
                    <Text className="text-white font-bold text-sm mb-1" numberOfLines={1}>
                        {property.title}
                    </Text>

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-1 flex-1">
                            <Ionicons name="location-outline" size={12} color="#F5A623" />
                            <Text className="text-gray-300 text-xs flex-1" numberOfLines={1}>
                                {property.city}
                            </Text>
                        </View>
                        <Text className="text-primary font-bold text-sm">
                            {formatPrice(property.price)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Stat row below the photo */}
            <View className="flex-row items-center justify-around py-2.5">
                <View className="flex-row items-center gap-1.5">
                    <Ionicons name="bed-outline" size={14} color="#9CA3AF" />
                    <Text className="text-gray-300 text-xs">{property.bedrooms} beds</Text>
                </View>
                <View className="w-px h-3 bg-gray-700" />
                <View className="flex-row items-center gap-1.5">
                    <Ionicons name="water-outline" size={14} color="#9CA3AF" />
                    <Text className="text-gray-300 text-xs">{property.bathrooms} baths</Text>
                </View>
            </View>

        </TouchableOpacity>

    )
}