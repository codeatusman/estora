import { LISTING_PROPERTY_OPTIONS } from '@/constants/filters';
import { useSupabase } from '@/hooks/useSupabase';
import { addProperty, uploadPropertyImage } from '@/services/properties';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


type PropertyType = (typeof LISTING_PROPERTY_OPTIONS)[number]["value"];

interface FormState {
    title: string;
    description: string;
    price: string;
    type: PropertyType;
    bedrooms: number;
    bathrooms: number;
    areaSqft: string;
    address: string;
    city: string;
    latitude: string;
    longitude: string;
    isFeatured: boolean;
    images: string[];
    localImages: string[];
}

const INITIAL_FORM: FormState = {
    title: "",
    description: "",
    price: "",
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    isFeatured: false,
    images: [],
    localImages: [],
};

const MIN_PRICE = 1;
const MAX_PRICE = 999_999_999;
const labelClass =
    "text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide";
const fieldClass =
    "bg-white border border-gray-200 rounded-xl px-4 py-3 text-accent";

const sectionLabel = (text: string) => (
    <View className="flex-row items-center gap-1.5 mb-1.5">
        <View className="w-1.5 h-1.5 rounded-full bg-primary" />
        <Text className={labelClass + " mb-0"}>{text}</Text>
    </View>
);


export default function AddListingScreen() {
    const router = useRouter();
    const authSupabase = useSupabase();

    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    const updateForm = (fields: Partial<FormState>) =>
        setForm((prev) => ({ ...prev, ...fields }));

    const handlePickImages = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(
                "Permission Required",
                "Please allow access to your photo library.",
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsMultipleSelection: true,
            quality: 0.7,
            base64: true,
            selectionLimit: 6,
        });
        if (result.canceled) return;

        setIsUploadingImages(true);
        const uploadedUrls: string[] = [];
        const previewUris: string[] = [];

        for (const asset of result.assets) {
            try {
                const filename = `property_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
                const buffer = Uint8Array.from(atob(asset.base64!), (c) =>
                    c.charCodeAt(0),
                );

                const publicUrl = await uploadPropertyImage(
                    filename,
                    buffer,
                    authSupabase,
                );
                if (!publicUrl) throw new Error("Upload returned no URL");

                uploadedUrls.push(publicUrl);
                previewUris.push(asset.uri);
            } catch (err) {
                console.error("Upload error:", err);
                Alert.alert("Upload Failed", "One or more images failed to upload.");
            }
        }

        updateForm({
            images: [...form.images, ...uploadedUrls],
            localImages: [...form.localImages, ...previewUris],
        });
        setIsUploadingImages(false);
    };

    const handleRemoveImage = (index: number) => {
        updateForm({
            images: form.images.filter((_, i) => i !== index),
            localImages: form.localImages.filter((_, i) => i !== index),
        });
    };

    const handleDetectLocation = async () => {
        setIsDetectingLocation(true)
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission Denied",
                    "Location permission is required to detect coordinates.",
                );
                return;
            }
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            updateForm({
                latitude: String(location.coords.latitude),
                longitude: String(location.coords.longitude),
            });
        } catch (error) {
            Alert.alert("Error", "Could not detect location. Enter manually.");
        } finally {
            setIsDetectingLocation(false)
        }
    };

    const handleSubmit = async () => {
        if (!form.title.trim())
            return Alert.alert("Validation", "Title is required.");
        if (!form.price.trim())
            return Alert.alert("Validation", "Price is required.");

        const priceNum = Number(form.price);
        if (isNaN(priceNum) || priceNum < MIN_PRICE)
            return Alert.alert("Validation", "Price must be greater than PKR0.");
        if (priceNum > MAX_PRICE)
            return Alert.alert(
                "Validation",
                `Price cannot exceed PKR${MAX_PRICE.toLocaleString("en-IN")}.`,
            );

        if (!form.address.trim())
            return Alert.alert("Validation", "Address is required.");
        if (!form.city.trim())
            return Alert.alert("Validation", "City is required.");
        if (form.images.length === 0)
            return Alert.alert("Validation", "Please upload at least one image.");

        setIsSubmitting(true);

        const { error } = await addProperty(
            {
                title: form.title.trim(),
                description: form.description.trim(),
                price: priceNum,
                type: form.type,
                bedrooms: form.bedrooms,
                bathrooms: form.bathrooms,
                area_sqft: form.areaSqft ? Number(form.areaSqft) : null,
                address: form.address.trim(),
                city: form.city.trim(),
                latitude: form.latitude ? Number(form.latitude) : null,
                longitude: form.longitude ? Number(form.longitude) : null,
                images: form.images,
                is_featured: form.isFeatured,
                is_sold: false,
            },
            authSupabase,
        );

        setIsSubmitting(false)

        if (error) {
            Alert.alert("Error", "Failed to add property. Please try again.");
            console.error(error);
            return;
        }

        setForm(INITIAL_FORM);
        Alert.alert("Success! 🎉", "Property listed successfully.", [
            { text: "OK", onPress: () => router.replace("/(root)/(tabs)") },
        ]);
    }

    const Stepper = ({
        label,
        value,
        onChange,
    }: {
        label: string;
        value: number;
        onChange: (v: number) => void;
    }) => (
        <View className="flex-1">
            <Text className={labelClass}>{label}</Text>
            <View className="flex-row flexBetween bg-white border border-gray-200 rounded-xl px-3 py-2">
                <TouchableOpacity onPress={() => onChange(Math.max(1, value - 1))}>
                    <Ionicons name="remove" size={22} color="#1C1C2E" />
                </TouchableOpacity>
                <Text className="text-accent font-bold text-base">{value}</Text>
                <TouchableOpacity onPress={() => onChange(value + 1)}>
                    <Ionicons name="add" size={22} color="#1C1C2E" />
                </TouchableOpacity>
            </View>
        </View>
    );


    return (
        <View className="flex-1 bg-accent-100">
            <SafeAreaView edges={["top"]} className="bg-accent rounded-b-[28px]">
                <View className="flex-row flexBetween px-5 pt-3 pb-6">
                    <View>
                        <Text className="text-white text-2xl font-bold">New Listing</Text>
                        <Text className="text-gray-400 text-sm mt-1">
                            Fill in the details below
                        </Text>
                    </View>
                    <View className="bg-primary/20 px-3 py-1.5 rounded-full">
                        <Text className="text-primary text-xs font-semibold">
                            {form.images.length}/6 photos
                        </Text>
                    </View>
                </View>
            </SafeAreaView>

            <SafeAreaView edges={["bottom", "left", "right"]} className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <ScrollView
                        contentContainerStyle={{ padding: 20, paddingBottom: 66, gap: 18 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Photos */}
                        <View>
                            {sectionLabel("Photos (up to 6)")}
                            <View className="flex-row flex-wrap gap-3">
                                {form.localImages.map((uri, index) => (
                                    <View key={index} className="relative">
                                        <Image
                                            source={{ uri }}
                                            className="w-20 h-20 rounded-xl"
                                            resizeMode="cover"
                                        />
                                        {index === 0 && (
                                            <View className="absolute top-1 left-1 bg-primary px-1.5 py-0.5 rounded-full">
                                                <Text className="text-accent text-[8px] font-bold">
                                                    COVER
                                                </Text>
                                            </View>
                                        )}
                                        <TouchableOpacity
                                            onPress={() => handleRemoveImage(index)}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flexCenter"
                                        >
                                            <Ionicons name="close" size={11} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                {form.localImages.length < 6 && (
                                    <TouchableOpacity
                                        onPress={handlePickImages}
                                        disabled={isUploadingImages}
                                        className="w-20 h-20 rounded-xl bg-white border-2 border-dashed border-gray-300 flexCenter"
                                    >
                                        {isUploadingImages ? (
                                            <ActivityIndicator size="small" color="#F5A623" />
                                        ) : (
                                            <Ionicons
                                                name="camera-outline"
                                                size={22}
                                                color="#9CA3AF"
                                            />
                                        )}
                                    </TouchableOpacity>
                                )}

                            </View>
                        </View>
                        {/* Title & description */}
                        <View>
                            {sectionLabel("Title")}
                            <TextInput
                                className={fieldClass}
                                placeholder="e.g. Modern Luxury Villa"
                                placeholderTextColor="#9CA3AF"
                                value={form.title}
                                onChangeText={(v) => updateForm({ title: v })}
                            />
                        </View>

                        <View>
                            {sectionLabel("Description")}
                            <TextInput
                                className={`${fieldClass} h-24`}
                                placeholder="Describe the property..."
                                placeholderTextColor="#9CA3AF"
                                value={form.description}
                                onChangeText={(v) => updateForm({ description: v })}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Price */}
                        <View>
                            {sectionLabel("Price (PKR)")}
                            <TextInput
                                className={fieldClass}
                                placeholder="e.g. 5000000"
                                placeholderTextColor="#9CA3AF"
                                value={form.price}
                                onChangeText={(v) => updateForm({ price: v })}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Type — horizontal icon tiles */}
                        <View>
                            {sectionLabel("Property Type")}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 10 }}
                            >
                                {LISTING_PROPERTY_OPTIONS.map((option) => {
                                    const active = form.type === option.value;
                                    return (
                                        <TouchableOpacity
                                            key={option.label}
                                            onPress={() => updateForm({ type: option.value })}
                                            className={`flexCenter w-20 h-20 rounded-2xl ${active
                                                ? "bg-primary"
                                                : "bg-white border border-gray-200"
                                                }`}
                                        >
                                            <Ionicons
                                                name={option.icon}
                                                size={20}
                                                color={active ? "#1C1C2E" : "#6B7280"}
                                            />
                                            <Text
                                                className={`text-[11px] font-semibold mt-1.5 ${active ? "text-accent" : "text-gray-500"}`}
                                            >
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* Bedrooms / Bathrooms / Area */}
                        <View className="flex-row gap-3">
                            <Stepper
                                label="Bedrooms"
                                value={form.bedrooms}
                                onChange={(v) => updateForm({ bedrooms: v })}
                            />
                            <Stepper
                                label="Bathrooms"
                                value={form.bathrooms}
                                onChange={(v) => updateForm({ bathrooms: v })}
                            />
                        </View>
                        <View>
                            {sectionLabel("Area (sq ft)")}
                            <TextInput
                                className={fieldClass}
                                placeholder="e.g. 1200"
                                placeholderTextColor="#9CA3AF"
                                value={form.areaSqft}
                                onChangeText={(v) => updateForm({ areaSqft: v })}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Location */}
                        <View>
                            {sectionLabel("Address")}
                            <TextInput
                                className={fieldClass}
                                placeholder="Street address"
                                placeholderTextColor="#9CA3AF"
                                value={form.address}
                                onChangeText={(v) => updateForm({ address: v })}
                            />
                        </View>

                        <View>
                            {sectionLabel("City")}
                            <TextInput
                                className={fieldClass}
                                placeholder="e.g. Lahore"
                                placeholderTextColor="#9CA3AF"
                                value={form.city}
                                onChangeText={(v) => updateForm({ city: v })}
                            />
                        </View>
                        {/* Coordinates */}
                        <View>
                            <View className="flex-row flexBetween mb-1.5">
                                {sectionLabel("Coordinates")}
                                <TouchableOpacity
                                    onPress={handleDetectLocation}
                                    disabled={isDetectingLocation}
                                    className="flex-row items-center gap-1 bg-primary/20 px-3 py-1.5 rounded-full"
                                >
                                    {isDetectingLocation ? (
                                        <ActivityIndicator size="small" color="#F5A623" />
                                    ) : (
                                        <Ionicons name="locate-outline" size={13} color="#B97A14" />
                                    )}
                                    <Text className="text-primary-300 text-xs font-semibold">
                                        {isDetectingLocation ? "Detecting..." : "Detect Location"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View className="flex-row gap-3">
                                <TextInput
                                    className={`${fieldClass} flex-1`}
                                    placeholder="Latitude"
                                    placeholderTextColor="#9CA3AF"
                                    value={form.latitude}
                                    onChangeText={(v) => updateForm({ latitude: v })}
                                    keyboardType="numeric"
                                />
                                <TextInput
                                    className={`${fieldClass} flex-1`}
                                    placeholder="Longitude"
                                    placeholderTextColor="#9CA3AF"
                                    value={form.longitude}
                                    onChangeText={(v) => updateForm({ longitude: v })}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                        {/* Featured toggle — plain row, no card wrapper */}
                        <TouchableOpacity
                            onPress={() => updateForm({ isFeatured: !form.isFeatured })}
                            className="flex-row flexBetween"
                        >
                            <View>
                                <Text className="text-accent font-semibold text-sm">
                                    Feature this listing
                                </Text>
                                <Text className="text-gray-400 text-xs mt-0.5">
                                    Shown in Home's Featured row
                                </Text>
                            </View>
                            <View
                                className={`w-12 h-7 rounded-full p-1 ${form.isFeatured ? "bg-[#F5A623]" : "bg-gray-200"}`}
                            >
                                <View
                                    className="w-5 h-5 rounded-full bg-white"
                                    style={{ marginLeft: form.isFeatured ? 20 : 0 }}
                                />
                            </View>
                        </TouchableOpacity>

                        {/* Submit */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isSubmitting || isUploadingImages}
                            className="btn"
                            style={{ opacity: isSubmitting || isUploadingImages ? 0.6 : 1 }}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#1C1C2E" />
                            ) : (
                                <Text className="text-accent font-bold text-base">
                                    Publish Listing
                                </Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    )
}