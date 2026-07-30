import { create } from 'zustand';

import type { TabKey } from '@/types/mypage';

interface MyPageStore {
  activeTab: TabKey;
  isSettingsOpen: boolean;
  isArtistView: boolean;
  setActiveTab: (tab: TabKey) => void;
  setIsSettingsOpen: (open: boolean) => void;
  toggleArtistView: () => void;
}

export const useMyPageStore = create<MyPageStore>((set) => ({
  activeTab: 'exhibition',
  isSettingsOpen: false,
  isArtistView: true,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
  toggleArtistView: () =>
    set((state) => {
      const newIsArtistView = !state.isArtistView;
      const newActiveTab =
        newIsArtistView || state.activeTab !== 'artist' ? state.activeTab : 'exhibition';

      return {
        isArtistView: newIsArtistView,
        activeTab: newActiveTab,
      };
    }),
}));
