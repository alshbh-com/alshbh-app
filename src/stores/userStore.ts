import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserInfo {
  name: string;
  phone: string;
  city: string;
  address?: string;
}

interface UserState {
  user: UserInfo | null;
  setUser: (user: UserInfo) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'alshbh-user',
    }
  )
);