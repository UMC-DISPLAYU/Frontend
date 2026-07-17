import { ChevronRight, Info, Plus } from 'lucide-react';

import type { ExhibitionItem } from '@/types/mypage';
import { cn } from '@/utils/cn';

import { ArtworkCard } from './ArtworkCard';
import { Header, Screen, SectionTitle } from './common';
import { ContentRow } from './ContentRow';
import { ExhibitionMeta } from './ExhibitionMeta';
import { InfoBox } from './InfoBox';
import { Poster } from './Poster';

interface WorkData {
  contents: Array<{ id: string; title: string; meta: string }>;
  artworks: Array<{ id: string; title: string; artist: string; image: string | null }>;
}

type UserRole = 'owner' | 'member-verified' | 'member-unverified';

export function WorkScreen({
  ex,
  work,
  onBack,
  userRole = 'owner',
  onVerifyArtist,
}: {
  ex: ExhibitionItem;
  work: WorkData;
  onBack: () => void;
  userRole?: UserRole;
  onVerifyArtist?: () => void;
}) {
  return (
    <Screen>
      <Header title="전시 작업" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pt-1.5 pb-4">
        <div
          className={cn(
            'flex gap-3 h-32 px-4 py-3.5 rounded-2xl items-start overflow-hidden',
            'bg-box100 shadow-[8px_8px_18px_rgba(6,3,45,0.04),inset_1px_1px_4px_rgba(1,8,21,0.20),inset_-2px_-2px_2px_rgba(252,252,252,0.90)]',
          )}
        >
          <Poster src={ex.thumbnail} w={64} h={96} />
          <ExhibitionMeta ex={ex} showBadge={false} />
        </div>

        <InfoBox userRole={userRole} onVerifyArtist={onVerifyArtist} />

        <SectionTitle>전시 콘텐츠</SectionTitle>
        <div className="flex flex-col gap-2">
          {work.contents.map((r) => (
            <ContentRow key={r.id} row={r} />
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 mb-1">
          <div className="typo-body-sm-bold text-main">전시작</div>
          <button className="typo-body-xs-regular bg-transparent border-none cursor-pointer flex items-center gap-0.5 text-hint">
            전시작 관리 <ChevronRight size={13} />
          </button>
        </div>
        <div className="typo-body-xs-regular text-hint mb-3">
          전시에 참여한 작품을 등록하고 작가 정보를 연결할 수 있어요.
        </div>

        <div className="flex gap-2">
          <button className="w-28 h-40 rounded-xl border-none bg-box200 cursor-pointer flex flex-col items-center justify-center gap-1.5">
            <Plus size={20} className="text-hint" />
            <span className="typo-body-xs-regular text-sub600">전시작 추가</span>
          </button>
          {work.artworks.map((art) => (
            <ArtworkCard key={art.id} art={art} />
          ))}
        </div>

        <div className="mt-17.5 p-2.5 px-3 rounded-[10px] bg-card flex items-center gap-1.5">
          <Info size={13} className="text-hint" />
          <span className="typo-body-xs-regular text-hint">작품은 일부만 등록해도 괜찮아요.</span>
        </div>

        <button
          onClick={onBack}
          className="mt-21.5 typo-body-sm-bold w-full mt-4 p-4 rounded-xl bg-card text-main cursor-pointer"
        >
          전시 관리로 돌아가기
        </button>
      </div>
    </Screen>
  );
}
