import { useSavedProperty } from "@/hooks/useSavedProperty";
import { useSupabase } from "@/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import { deleteProperty, markPropertySold } from "@/services/properties";
import { userUserStore } from "@/store/userStore";
import { Property } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Linking,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import ImageViewing from "react-native-image-viewing";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const { width } = Dimensions.get("window");
const ADMIN_PHONE = "929999999999"; // replace with your WhatsApp number

// Small pill used in the specs strip — icon + value
function SpecPill({
    icon,
    value,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
}) {
    return (
        <View className="flex-row items-center gap-1.5 bg-white border border-gray-200 px-3 py-2 rounded-full mr-2">
            <Ionicons name={icon} size={14} color="#F5A623" />
            <Text className="text-dark text-xs font-semibold">{value}</Text>
        </View>
    );
}

export default function PropertyDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const isAdmin = userUserStore((state) => state.isAdmin);

    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isViewerVisible, setIsViewerVisible] = useState(false);

    const { isSaved, saveLoading, toggleSave } = useSavedProperty(id ?? "");

    const authSupabase = useSupabase();

    useEffect(() => {
        loadProperty();
    }, [id]);

    const loadProperty = async () => {
        const { data } = await supabase
            .from("properties")
            .select("*")
            .eq("id", id)
            .single();
        setProperty(data);
        setIsLoading(false);
    };


    const handleDelete = () => {
        Alert.alert("Delete Property", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    await deleteProperty(id ?? "", authSupabase);
                    router.replace("/(root)/(tabs)");
                },
            },
        ]);
    };

    const handleMarkSold = () => {
        Alert.alert("Mark as Sold", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Mark Sold",
                onPress: async () => {
                    await markPropertySold(id ?? "", authSupabase);
                    setProperty((prev) => (prev ? { ...prev, is_sold: true } : prev));
                },
            },
        ]);
    };

    const handleContact = () => {
        const message = `Hi! I'm interested in the property: ${property?.title}`;
        Linking.openURL(
            `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`,
        );
    };

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
    };

    if (isLoading) {
        return (
            <View className="flex-1 flexCenter bg-accent-100">
                <ActivityIndicator size="large" color="#F5A623" />
            </View>
        );
    }

    if (!property) {
        return (
            <View className="flex-1 flexCenter bg-accent-100">
                <Text className="text-gray-500">Property not found</Text>
            </View>
        );
    }

    const isLongDesc = (property.description?.length ?? 0) > 150;
    const displayDesc =
        isExpanded || !isLongDesc
            ? property.description
            : property.description?.slice(0, 150) + "...";

    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${property.longitude - 0.003
        }%2C${property.latitude - 0.003}%2C${property.longitude + 0.003}%2C${property.latitude + 0.003
        }&layer=mapnik&marker=${property.latitude}%2C${property.longitude}`;

    return (
        <View className="flex-1 bg-accent-100">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 110 }}
            >
                {/* Image carousel — title & price overlaid directly on the photo */}
                <View style={{ opacity: property.is_sold ? 0.5 : 1 }}>
                    <FlatList
                        data={property.images}
                        keyExtractor={(_, i) => i.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => setIsViewerVisible(true)}>
                                <Image
                                    source={{ uri: item }}
                                    style={{ width, height: 380 }}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        )}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                    />

                    {/* Image count badge */}
                    <View className="absolute bottom-32 right-4 bg-black/50 px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-medium">
                            {activeIndex + 1}/{property.images.length}
                        </Text>
                    </View>

                    {/* Dot indicators */}
                    {property.images.length > 1 && (
                        <View className="absolute bottom-32 left-0 right-0 flex-row justify-center gap-1">
                            {property.images.map((_, i) => (
                                <View
                                    key={i}
                                    className={`h-1.5 rounded-full ${i === activeIndex ? "w-8 bg-white" : "w-1.5 bg-white/60"}`}
                                />
                            ))}
                        </View>
                    )}
                    {/* Bottom gradient-style overlay panel with title/price/badges */}
                    <View className="absolute bottom-0 left-0 right-0 bg-accent/90 px-5 py-3 rounded-t-[28px]">
                        <View className="flex-row gap-2 mb-2">
                            <View className="bg-primary px-2.5 py-0.5 rounded-full">
                                <Text className="text-dark text-[10px] font-bold capitalize">
                                    {property.type}
                                </Text>
                            </View>
                            {property.is_featured && (
                                <View className="bg-white/15 px-2.5 py-0.5 rounded-full">
                                    <Text className="text-primary text-[10px] font-bold">
                                        ⭐ Featured
                                    </Text>
                                </View>
                            )}
                            {property.is_sold && (
                                <View className="bg-red-500 px-2.5 py-0.5 rounded-full">
                                    <Text className="text-white text-[10px] font-bold">Sold</Text>
                                </View>
                            )}
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-white text-xl font-bold" numberOfLines={1}>
                                {property.title}
                            </Text>
                            <Text className="text-primary text-lg font-bold mt-0.5">
                                {formatPrice(property.price)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Top bar: back + save, floats over the photo */}
                <SafeAreaView className="absolute top-0 left-0 right-0">
                    <View className="flex-row flexBetween px-4 pt-2">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-black/50 rounded-full flexCenter"
                        >
                            <Ionicons name="arrow-back" size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={toggleSave}
                            disabled={saveLoading}
                            className="w-10 h-10 bg-black/50 rounded-full flexCenter"
                        >
                            <Ionicons
                                name={isSaved ? "heart" : "heart-outline"}
                                size={20}
                                color={isSaved ? "#F5A623" : "white"}
                            />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>

                {/* Content */}
                <View
                    className="px-5 pt-5"
                    style={{ opacity: property.is_sold ? 0.6 : 1 }}
                >
                    {/* Specs — horizontal scroll of small pills */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-6"
                    >
                        <SpecPill icon="bed-outline" value={`${property.bedrooms} beds`} />
                        <SpecPill
                            icon="water-outline"
                            value={`${property.bathrooms} baths`}
                        />
                        <SpecPill
                            icon="expand-outline"
                            value={`${property.area_sqft} ft²`}
                        />
                        <SpecPill icon="home-outline" value={property.type} />
                    </ScrollView>
                    {/* Description */}
                    <Text className="text-base font-bold text-dark mb-2">
                        About this place
                    </Text>
                    <Text className="text-gray-500 text-sm leading-6 mb-1">
                        {displayDesc}
                    </Text>
                    {isLongDesc && (
                        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                            <Text className="text-primary text-sm font-semibold mb-5">
                                {isExpanded ? "Show less" : "Read more"}
                            </Text>
                        </TouchableOpacity>
                    )}
                    <View className="mb-5" />

                    {/* Location — compact row, map thumbnail opens full map on tap */}
                    <Text className="text-base font-bold text-dark mb-2">Location</Text>
                    <TouchableOpacity
                        onPress={() =>
                            router.push({
                                pathname: "/(root)/property/map",
                                params: {
                                    latitude: property.latitude,
                                    longitude: property.longitude,
                                    title: property.title,
                                    address: `${property.address}, ${property.city}`,
                                },
                            })
                        }
                        activeOpacity={0.9}
                        className="flex-row items-center bg-white rounded-2xl overflow-hidden mb-6"
                    >
                        <View style={{ width: 90, height: 80 }}>
                            <WebView
                                source={{ uri: mapUrl }}
                                style={{ flex: 1 }}
                                scrollEnabled={false}
                                pointerEvents="none"
                            />
                        </View>
                        <View className="flex-1 px-3">
                            <Text
                                className="text-dark text-sm font-semibold"
                                numberOfLines={1}
                            >
                                {property.address}
                            </Text>
                            <Text className="text-gray-400 text-xs" numberOfLines={1}>
                                {property.city}
                            </Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="#D1D5DB"
                            style={{ marginRight: 12 }}
                        />
                    </TouchableOpacity>
                    {/* Admin Actions */}
                    {isAdmin && (
                        <View className="flex-row gap-3 mb-2">
                            {!property.is_sold && (
                                <TouchableOpacity
                                    onPress={handleMarkSold}
                                    className="btn flex-1 bg-primary/20"
                                >
                                    <Ionicons
                                        name="checkmark-circle-outline"
                                        size={18}
                                        color="#B97A14"
                                    />
                                    <Text className="text-primary-dark font-semibold">
                                        Mark Sold
                                    </Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={handleDelete}
                                className="btn flex-1 bg-red-500/10"
                            >
                                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                <Text className="text-red-500 font-semibold">Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Sticky contact bar — pinned to the bottom instead of inline in the scroll */}
            <SafeAreaView
                edges={["bottom"]}
                className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-3 pb-3"
            >
                <TouchableOpacity onPress={handleContact} className="btn">
                    <Ionicons name="logo-whatsapp" size={20} color="#1C1C2E" />
                    <Text className="text-dark font-bold text-base">Contact Agent</Text>
                </TouchableOpacity>
            </SafeAreaView>

            <ImageViewing
                images={property.images.map((uri) => ({ uri }))}
                imageIndex={activeIndex}
                visible={isViewerVisible}
                onRequestClose={() => setIsViewerVisible(false)}
            />
        </View>
    );
}
