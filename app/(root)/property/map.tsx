import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

export default function MapScreen() {
    const { latitude, longitude, title, address } = useLocalSearchParams<{
        latitude: string;
        longitude: string;
        title: string;
        address: string;
    }>();

    const router = useRouter()

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.001
        }%2C${lat - 0.001}%2C${lng + 0.001}%2C${lat + 0.001
        }&layer=mapnik&marker=${lat}%2C${lng}`;

    return (
        <View className="flex-1 bg-accent-100">
            {/* Dark header — same pattern as the rest of the app */}
            <SafeAreaView edges={["top"]} className="bg-accent rounded-b-[28px] z-50">
                <View className="flex-row items-center px-4 pt-3 pb-5 gap-3">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-9 h-9 flexCenter rounded-full bg-white/10"
                    >
                        <Ionicons name="arrow-back" size={18} color="white" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                            {title}
                        </Text>
                        <Text className="text-gray-400 text-xs" numberOfLines={1}>
                            {address}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`)}
                        className="flex-row items-center gap-1 bg-primary px-3 py-2 rounded-full"
                    >
                        <Ionicons name="navigate-outline" size={14} color="#1C1C2E" />
                        <Text className="text-accent text-xs font-semibold">Maps</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Full screen map */}
            <View className="flex-1 -mt-2 overflow-hidden">
                <WebView source={{ uri: mapUrl }} style={{ flex: 1 }} />
            </View>
        </View>
    )
}