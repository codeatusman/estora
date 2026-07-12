import FilterModal from '@/components/FilterModal';
import PropertyCard from '@/components/PropertyCard';
import { formatPrice } from '@/lib/utils';
import { searchProperties } from '@/services/properties';
import { useFilterStore } from '@/store/filterStore';
import { Property } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
    return (
        <View className="flex-row items-center bg-primary/20 border border-primary/40 rounded-full px-3 py-1 gap-1">
            <Text className="text-primary text-xs font-semibold">{label}</Text>
            <TouchableOpacity onPress={onClear}>
                <Ionicons name="close" size={12} color="#B97A14" />
            </TouchableOpacity>
        </View>
    )
}

export default function ExploreScreen() {
    const [results, setResults] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const { openFilters } = useLocalSearchParams<{ openFilters?: string }>();

    useEffect(() => {
        if (openFilters === "true") setShowFilters(true)
    }, [openFilters])

    const { search, type, bedrooms, minPrice, maxPrice,
        setSearch, setType, setBedrooms, setMinPrice, setMaxPrice, } = useFilterStore()

    const activeFilterCount = [type, bedrooms, minPrice, maxPrice].filter((v) => v != null).length

    const loadResults = async () => {
        setIsLoading(true)
        const data = await searchProperties({
            search, type, bedrooms, minPrice, maxPrice
        })
        setResults(data)
        setIsLoading(false)
    }

    useEffect(() => {
        loadResults()
    }, [search, type, bedrooms, minPrice, maxPrice])

    return (
        <View className="flex-1 bg-accent-100">
            <SafeAreaView edges={["top"]} className="bg-accent rounded-b-[28px]">
                <View className="px-5 pt-3 pb-6">
                    <Text className="text-white text-2xl font-bold mb-5">Find a home</Text>

                    {/* Search bar */}
                    <View
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
                        <TextInput
                            className="flex-1 py-3 text-accent"
                            placeholder="Search by title or city..."
                            placeholderTextColor="#9CA3AF"
                            value={search}
                            onChangeText={setSearch}
                            autoCapitalize="none"
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch("")}>
                                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => setShowFilters(true)}
                            className="w-8 h-8 rounded-full flexCenter bg-primary"
                        >
                            <Ionicons name="filter" size={14} color="#1C1C2E" />
                            {activeFilterCount > 0 && (
                                <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flexCenter">
                                    <Text className="text-white text-[9px] font-bold">{activeFilterCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <SafeAreaView edges={["bottom", "left", "right"]} className="flex-1">
                {/* Active Filter Chips */}
                {activeFilterCount > 0 && (
                    <View className="flex-row flex-wrap gap-2 px-5 pt-4">
                        {type && <FilterChip label={type} onClear={() => setType(null)} />}
                        {bedrooms != null && (
                            <FilterChip
                                label={bedrooms === 4 ? "4+ beds" : `${bedrooms} bed${bedrooms > 1 ? "s" : ""}`}
                                onClear={() => setBedrooms(null)}
                            />
                        )}
                        {(minPrice !== null || maxPrice !== null) && (
                            <FilterChip
                                label={
                                    minPrice && maxPrice
                                        ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
                                        : minPrice
                                            ? `From ${formatPrice(minPrice)}`
                                            : `Up to ${formatPrice(maxPrice!)}`
                                }
                                onClear={() => {
                                    setMinPrice(null);
                                    setMaxPrice(null);
                                }}
                            />
                        )}
                    </View>
                )}

                {/* Filter Results */}
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => <PropertyCard property={item} />}
                    ListHeaderComponent={
                        <Text className="text-sm text-gray-400 mb-4">
                            {isLoading ? "Searching..." : `${results.length} properties found`}
                        </Text>
                    }
                    ListEmptyComponent={
                        !isLoading ? (
                            <View className="items-center py-20">
                                <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                                <Text className="text-gray-400 mt-4 text-base">No properties found</Text>
                                <Text className="text-gray-300 text-sm mt-1">
                                    Try a different search or adjust filters
                                </Text>
                            </View>
                        ) : (
                            <ActivityIndicator size="large" color="#F5A623" className="py-20" />
                        )
                    }
                />

                <FilterModal visible={showFilters} onClose={() => setShowFilters(false)} />
            </SafeAreaView>
        </View>
    )
}