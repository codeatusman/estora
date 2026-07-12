import { SupabaseClient } from "@supabase/supabase-js";

export interface UserData {
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string;
}

export interface UserRecord {
  clerk_id: string;
  is_admin: boolean;
}

/**
 * Looks up a user by Clerk ID. If found, returns the record.
 * If not found, inserts a new user row and returns the new record.
 */
export async function upsertUser(
  userData: UserData,
  supabaseClient: SupabaseClient,
): Promise<UserRecord | null> {
  try {
    const { data: existing } = await supabaseClient
      .from("users")
      .select("clerk_id, is_admin")
      .eq("clerk_id", userData.clerk_id)
      .single();

    if (existing) return existing as UserRecord;

    const { data: newUser } = await supabaseClient
      .from("users")
      .insert({
        clerk_id: userData.clerk_id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        avatar_url: userData.avatar_url,
      })
      .select("clerk_id, is_admin")
      .single();

    return newUser as UserRecord | null;
  } catch (error) {
    console.error("Error upserting user:", error);
    return null;
  }
}
