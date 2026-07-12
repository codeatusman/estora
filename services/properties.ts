import { supabase } from "@/lib/supabase";
import { Property, PropertyFilterType, PropertyTypeValue } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

export interface NewPropertyData {
  title: string;
  description: string;
  price: number;
  type: PropertyTypeValue;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number | null;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  is_featured: boolean;
  is_sold: boolean;
}

export interface PropertySearchFilters {
  search?: string;
  type?: PropertyFilterType;
  bedrooms?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
}

export async function fetchFeaturedProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("Error fetching featured properties:", error);
    return [];
  }
}

export async function fetchRecommendedProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("is_featured", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("Error fetching recommended properties:", error);
    return [];
  }
}

export async function searchProperties(
  filters: PropertySearchFilters = {},
): Promise<Property[]> {
  const {
    search = "",
    type = null,
    bedrooms = null,
    minPrice = null,
    maxPrice = null,
  } = filters;

  try {
    let query = supabase.from("properties").select("*");

    if (search) {
      query = query.or(`title.ilike.%${search}%,city.ilike.%${search}%`);
    }

    if (type) query = query.eq("type", type);

    if (bedrooms) {
      if (bedrooms >= 4) {
        query = query.gte("bedrooms", 4);
      } else {
        query = query.eq("bedrooms", bedrooms);
      }
    }
    if (minPrice) query = query.gte("price", minPrice);
    if (maxPrice) query = query.lte("price", maxPrice);

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("Error searching properties:", error);
    return [];
  }
}

export async function deleteProperty(
  propertyId: string,
  supabaseClient: SupabaseClient,
): Promise<boolean> {
  try {
    const { error } = await supabaseClient
      .from("properties")
      .delete()
      .eq("id", propertyId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting property:", error);
    return false;
  }
}

export async function markPropertySold(
  propertyId: string,
  supabaseClient: SupabaseClient,
): Promise<boolean> {
  try {
    const { error } = await supabaseClient
      .from("properties")
      .update({ is_sold: true })
      .eq("id", propertyId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error marking property as sold:", error);
    return false;
  }
}

export async function uploadPropertyImage(
  filename: string,
  buffer: Uint8Array,
  supabaseClient: SupabaseClient,
): Promise<string | null> {
  try {
    const { error } = await supabaseClient.storage
      .from("property-images")
      .upload(filename, buffer, { contentType: "image/jpeg", upsert: false });

    if (error) throw error;

    const { data: urlData } = supabaseClient.storage
      .from("property-images")
      .getPublicUrl(filename);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

export async function addProperty(
  propertyData: NewPropertyData,
  supabaseClient: SupabaseClient,
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabaseClient
      .from("properties")
      .insert(propertyData);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error creating property:", error);
    return { error: error as Error };
  }
}
