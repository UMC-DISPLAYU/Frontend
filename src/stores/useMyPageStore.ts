import { create } from 'zustand';

import type { TabKey } from '@/types/mypage';

interface MyPageStore {
  activeTab: TabKey;
  isSettingsOpen: boolean;
  isArtistView: boolean;
  /* 작가 인증 상태가 실제로 바뀐 시점에만 isArtistView를 재동기화하기 위한 마지막 동기화 값입니다. */
  lastSyncedIsVerified: boolean | null;
  setActiveTab: (tab: TabKey) => void;
  setIsSettingsOpen: (open: boolean) => void;
  toggleArtistView: () => void;
  syncArtistViewWithVerification: (isVerified: boolean) => void;
}

export const useMyPageStore = create<MyPageStore>((set) => ({
  activeTab: 'exhibition',
  isSettingsOpen: false,
  isArtistView: false,
  lastSyncedIsVerified: null,
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
  /*
   * MyPage는 상세 페이지 이동/뒤로가기마다 언마운트-재마운트되므로, isVerified 값이 그대로여도
   * 마운트할 때마다 이 함수가 호출됩니다. isVerified가 이전에 동기화한 값과 같다면 아무것도 하지 않아,
   * 사용자가 수동으로 전환해둔 뷰(예: 인증된 작가가 일반 뷰를 보고 있는 상태)를 덮어쓰지 않습니다.
   * isVerified가 실제로 바뀐 경우(예: 방금 작가 인증을 완료함)에만 뷰를 갱신합니다.
   */
  syncArtistViewWithVerification: (isVerified) =>
    set((state) => {
      if (state.lastSyncedIsVerified === isVerified) {
        return state;
      }
      return {
        isArtistView: isVerified,
        lastSyncedIsVerified: isVerified,
      };
    }),
}));
