import { BEDROOM_OPTIONS, PRICE_PRESETS, PROPERTY_TYPE_OPTIONS } from '@/constants/filters';
import { useFilterStore } from '@/store/filterStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FilterModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    const { search, type, bedrooms, minPrice, maxPrice,
        setSearch, setType, setBedrooms, setMinPrice, setMaxPrice, resetFilters } = useFilterStore()

    const [localMin, setLocalMin] = useState(minPrice ? String(minPrice) : "");
    const [localMax, setLocalMax] = useState(maxPrice ? String(maxPrice) : "");

    const activeCount = [type, bedrooms, minPrice, maxPrice].filter((v) => v !== null).length;

    const handleApply = () => {
        setMinPrice(localMin ? Number(localMin) : null);
        setMaxPrice(localMax ? Number(localMax) : null);
        onClose();
    };

    const handleReset = () => {
        setLocalMin("");
        setLocalMax("");
        resetFilters();
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View className="items-center pt-3 pb-1">
                <View className="w-10 h-1 rounded-full bg-gray-300" />
            </View>
            <View className="flex-row flexBetween px-5 pt-2 pb-5">
                <Text className="text-accent text-xl font-bold">Filters</Text>
                <View className="flex-row items-center gap-4">
                    <TouchableOpacity onPress={handleReset}>
                        <Text className="text-primary font-semibold text-sm">Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-accent flexCenter">
                        <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 26 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Property Type — icon tiles */}
                <View>
                    <Text className="text-sm font-bold text-accent mb-3">Property Type</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                        {PROPERTY_TYPE_OPTIONS.map((item) => {
                            const active = type === item.value;
                            return (
                                <TouchableOpacity
                                    key={String(item.value)}
                                    onPress={() => setType(item.value)}
                                    className={`flexCenter w-20 h-20 rounded-2xl ${active ? "bg-primary" : "bg-white border border-gray-200"
                                        }`}
                                >
                                    <Ionicons name={item.icon} size={20} color={active ? "#1C1C2E" : "#6B7280"} />
                                    <Text className={`text-[11px] font-semibold mt-1.5 ${active ? "text-accent" : "text-gray-500"}`}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Bedrooms */}
                <View>
                    <Text className="text-sm font-bold text-accent mb-3">Bedrooms</Text>
                    <View className="flex-row gap-3">
                        {BEDROOM_OPTIONS.map((item) => {
                            const active = bedrooms === item.value;
                            return (
                                <TouchableOpacity
                                    key={String(item.value)}
                                    onPress={() => setBedrooms(item.value)}
                                    className={`w-12 h-12 rounded-full flexCenter ${active ? "bg-accent" : "bg-white border border-gray-200"
                                        }`}
                                >
                                    <Text className={`text-sm font-bold ${active ? "text-primary" : "text-gray-600"}`}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Price Range */}
                <View>
                    <Text className="text-sm font-bold text-accent mb-3">Price Range (PKR)</Text>
                    <View className="flex-row gap-3 mb-3">
                        {[
                            { label: "Min", value: localMin, onChange: setLocalMin, placeholder: "0" },
                            { label: "Max", value: localMax, onChange: setLocalMax, placeholder: "Any" },
                        ].map(({ label, value, onChange, placeholder }) => (
                            <View key={label} className="flex-1 flex-row items-center bg-white rounded-xl px-3 border border-gray-200">
                                <Text className="text-gray-400 text-sm mr-1">PKR</Text>
                                <TextInput
                                    className="flex-1 py-3 text-accent"
                                    placeholder={`${label} • ${placeholder}`}
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            </View>
                        ))}
                    </View>

                    <View className="flex-row flex-wrap gap-2">
                        {PRICE_PRESETS.map((p) => {
                            const active = minPrice === p.min && maxPrice === p.max;
                            return (
                                <TouchableOpacity
                                    key={p.label}
                                    onPress={() => {
                                        setLocalMin(p.min ? String(p.min) : "");
                                        setLocalMax(p.max ? String(p.max) : "");
                                        setMinPrice(p.min);
                                        setMaxPrice(p.max);
                                    }}
                                    className={`px-3 py-1.5 rounded-full ${active ? "bg-primary/20" : "bg-white border border-gray-200"}`}
                                >
                                    <Text className={`text-xs font-medium ${active ? "text-primary-300" : "text-gray-500"}`}>
                                        {p.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            {/* Apply Button */}
            <View className="px-5 pb-8 pt-4">
                <TouchableOpacity onPress={handleApply} className="btn">
                    <Text className="text-accent font-bold text-base">
                        Show Results{activeCount > 0 ? ` (${activeCount} filters)` : ""}
                    </Text>
                </TouchableOpacity>
            </View>
        </Modal>
    )
}