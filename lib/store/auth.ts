import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import type { User } from '../api/types';

const TOKEN_KEY = 'vns.auth.token';
const USER_KEY = 'vns.auth.user';

interface AuthState {
  token: string | null;
  user: User | null;
  /** True once the persisted session has been read from secure storage. */
  hydrated: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,

  login: async (token, user) => {
    set({ token, user });
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    ]);
  },

  logout: async () => {
    set({ token: null, user: null });
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  },

  hydrate: async () => {
    try {
      const [token, userRaw] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      const user = userRaw ? (JSON.parse(userRaw) as User) : null;
      set({ token: token ?? null, user, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
}));
