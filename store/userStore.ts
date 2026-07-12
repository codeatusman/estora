import { create } from "zustand";

interface UserStore {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const userUserStore = create<UserStore>((set) => ({
  isAdmin: false,
  setIsAdmin: (isAdmin) => set({ isAdmin }),
}));
