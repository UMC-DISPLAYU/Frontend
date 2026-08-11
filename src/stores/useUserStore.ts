import { create } from 'zustand';

import type { ArtistProfileDto, UserProfileDto } from '@/api/dto';

interface UserState {
  userId: number | null;
  accountId: string;
  displayArtistName: string;
  artistName: string;
  setUserMe: (user: UserProfileDto) => void;
  setArtistProfile: (artistProfile: ArtistProfileDto) => void;
  setDisplayArtistName: (displayArtistName: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  accountId: '',
  displayArtistName: '',
  artistName: '',
  setUserMe: (user) =>
    set({
      userId: user.id,
      accountId: user.nickname,
    }),
  setArtistProfile: (artistProfile) =>
    set({
      artistName: artistProfile.artistName,
    }),
  setDisplayArtistName: (displayArtistName) => set({ displayArtistName }),
  clearUser: () =>
    set({
      userId: null,
      accountId: '',
      displayArtistName: '',
      artistName: '',
    }),
}));
