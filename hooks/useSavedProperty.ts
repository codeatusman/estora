import {
  checkIfPropertySaved,
  saveProperty,
  unsaveProperty,
} from "@/services/saved";
import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";
import { useSupabase } from "./useSupabase";

export function useSavedProperty(propertyId: string, onUnSave?: () => void) {
  const { userId } = useAuth();
  const authSupabase = useSupabase();

  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [propertyId, userId]);

  const checkIfSaved = async () => {
    if (!userId) return;
    const saved = await checkIfPropertySaved(propertyId, userId, authSupabase);
    setIsSaved(saved);
  };

  const toggleSave = async () => {
    if (!userId || saveLoading) return;
    setSaveLoading(true);

    const success = isSaved
      ? await unsaveProperty(propertyId, userId, authSupabase)
      : await saveProperty(propertyId, userId, authSupabase);

    if (success) {
      setIsSaved(!isSaved);
      if (isSaved) onUnSave?.();
    }

    setSaveLoading(false);
  };

  return { isSaved, saveLoading, toggleSave };
}
