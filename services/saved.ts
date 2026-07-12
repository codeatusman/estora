import { SavedProperty } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchSavedProperties(
  userId: string,
  supabaseClient: SupabaseClient,
): Promise<SavedProperty[]> {
  try {
    const { data, error } = await supabaseClient
      .from("saved_properties")
      .select("id, property_id, properties(*)")
      .eq("user_clerk_id", userId)
      .order("id", { ascending: false });

    if (error) throw error;
    return (data as unknown as SavedProperty[]) ?? [];
  } catch (error) {
    console.error("Error fetching saved properties:", error);
    return [];
  }
}

export async function checkIfPropertySaved(
  propertyId: string,
  userId: string,
  supabaseClient: SupabaseClient,
): Promise<boolean> {
  try {
    const { data } = await supabaseClient
      .from("saved_properties")
      .select("id")
      .eq("user_clerk_id", userId)
      .eq("property_id", propertyId)
      .single();

    return !!data;
  } catch (error) {
    console.error("Error checking saved property:", error);
    return false;
  }
}

export async function saveProperty(
  propertyId: string,
  userId: string,
  supabaseClient: SupabaseClient,
): Promise<boolean> {
  try {
    const { error } = await supabaseClient
      .from("saved_properties")
      .insert({ user_clerk_id: userId, property_id: propertyId });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error saving property:", error);
    return false;
  }
}

export async function unsaveProperty(
  propertyId: string,
  userId: string,
  supabaseClient: SupabaseClient,
): Promise<boolean> {
  try {
    const { error } = await supabaseClient
      .from("saved_properties")
      .delete()
      .eq("user_clerk_id", userId)
      .eq("property_id", propertyId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error unsaving property:", error);
    return false;
  }
}
