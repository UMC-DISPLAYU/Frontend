import { create } from 'zustand';

interface UserState {
  displayArtistName: string;
  setDisplayArtistName: (displayArtistName: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  displayArtistName: '',
  setDisplayArtistName: (displayArtistName) => set({ displayArtistName }),
  clearUser: () => set({ displayArtistName: '' }),
}));
