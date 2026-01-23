import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  name: string;
  phone: string;
  address: string;
  setUserInfo: (name: string, phone: string, address: string) => void;
  setName: (name: string) => void;
  setPhone: (phone: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: '',
      phone: '',
      address: '',
      setUserInfo: (name, phone, address) => set({ name, phone, address }),
      setName: (name) => set({ name }),
      setPhone: (phone) => set({ phone }),
      clearUser: () => set({ name: '', phone: '', address: '' }),
    }),
    {
      name: 'alshbh-user',
    }
  )
);