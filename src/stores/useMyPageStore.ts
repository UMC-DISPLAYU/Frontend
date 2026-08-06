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
  isArtistView: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
  toggleArtistView: () =>
    set((state) => {
      const newIsArtistView = !state.isArtistView;
      // 작가 뷰로 전환할 때, 현재 'artist' 탭이면 'exhibition'으로 변경
      const newActiveTab =
        newIsArtistView && state.activeTab === 'artist' ? 'exhibition' : state.activeTab;

      return {
        isArtistView: newIsArtistView,
        activeTab: newActiveTab,
      };
    }),
}));
