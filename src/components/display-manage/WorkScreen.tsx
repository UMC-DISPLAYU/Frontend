import { useState } from 'react';

import { ChevronRight, Info, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useArtworkPolicy, useDisplayContentPolicy } from '@/hooks/usePolicy';
import type { ExhibitionItem } from '@/types/mypage';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';

import { ArtworkCard } from './ArtworkCard';
import { Header, Screen, SectionTitle } from './Common';
import { ContentRow } from './ContentRow';
import { ExhibitionMeta } from './ExhibitionMeta';
import { Poster } from './Poster';

interface WorkData {
  contents: Array<{
    id: string;
    title: string;
    meta: string;
    photos?: Array<{ id: number | string; url: string; alt?: string }>;
  }>;
  artworks: Array<{ id: string; title: string; artist: string; image: string | null }>;
}

export function WorkScreen({
  ex,
  work,
  onBack,
  onManageArtworks,
}: {
  ex: ExhibitionItem;
  work: WorkData;
  onBack: () => void;
  onManageArtworks: () => void;
}) {
  const navigate = useNavigate();
  const { data: display } = useDisplayDetail(Number(ex.id));
  const displayContentPolicy = useDisplayContentPolicy(display);
  const canCreateCategory = hasPermission(displayContentPolicy, 'createCategory');
  const canEditCategory = hasPermission(displayContentPolicy, 'editCategory');
  const canDeleteCategory = hasPermission(displayContentPolicy, 'deleteCategory');
  const canCreateContent = hasPermission(displayContentPolicy, 'createContent');
  const canDeleteContent = hasPermission(displayContentPolicy, 'deleteContent');
  const canReorder = hasPermission(displayContentPolicy, 'reorder');
  const canManageDisplayContent =
    canCreateCategory ||
    canEditCategory ||
    canDeleteCategory ||
    canCreateContent ||
    canDeleteContent ||
    canReorder;
  const artworkPolicy = useArtworkPolicy(display);
  const canCreateArtwork = hasPermission(artworkPolicy, 'create');

  const handlePhotoCountChange = (_categoryId: number, _count: number) => {
    void _categoryId;
    void _count;
    // TODO: 사진 개수 업데이트 로직
    // console.log('Photo count changed:', categoryId, count);
  };

  return (
    <Screen>
      <Header title="전시 작업" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pt-1.5 pb-9">
        <div
          className={cn(
            'flex gap-3 h-32 px-4 py-3.5 rounded-2xl items-start overflow-hidden',
            'bg-box100 shadow-[8px_8px_18px_rgba(6,3,45,0.04),inset_1px_1px_4px_rgba(1,8,21,0.20),inset_-2px_-2px_2px_rgba(252,252,252,0.90)]',
          )}
        >
          <Poster src={ex.thumbnail} w={72} h={101} />
          <ExhibitionMeta ex={ex} showBadge={false} />
        </div>

        <div className="flex items-center justify-between mt-6 mb-1">
          <SectionTitle>전시콘텐츠</SectionTitle>
          {canManageDisplayContent && (
            <button
              onClick={() => navigate(`/exhibition/${ex.id}/contents`)}
              className="typo-body-xs-regular flex items-center gap-0.5 border-none bg-transparent text-hint cursor-pointer"
            >
              관리하기 <ChevronRight size={13} />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {work.contents.map((r) => (
            <ContentRow
              key={r.id}
              row={r}
              onClick={() => navigate(`/exhibition/${ex.id}/contents/${r.id}`)}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 mb-1">
          <div className="typo-body-sm-bold text-main">전시작</div>
          <button
            onClick={onManageArtworks}
            className="typo-body-xs-regular flex items-center gap-0.5 border-none bg-transparent text-hint cursor-pointer"
          >
            관리하기 <ChevronRight size={13} />
          </button>
        </div>
        <div className="typo-body-xs-regular text-hint mb-3">
          전시에 참여한 작품을 등록하고 작가 정보를 연결할 수 있어요.
        </div>

        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {canCreateArtwork && (
            <button
              type="button"
              onClick={() => navigate(`/exhibition/${ex.id}/artworks/add`)}
              className="flex h-[158px] w-[118px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border-none bg-box200 cursor-pointer"
            >
              <Plus size={20} className="text-hint" />
              <span className="typo-body-xs-regular text-sub600">전시작 추가</span>
            </button>
          )}
          {work.artworks.map((art) => (
            <ArtworkCard key={art.id} art={art} />
          ))}
        </div>

        <div className="mt-20 flex items-center gap-1.5 rounded-[10px] bg-card px-3 py-2.5">
          <Info size={13} className="text-hint" />
          <span className="typo-body-xs-regular text-hint">작품은 일부만 등록해도 괜찮아요.</span>
        </div>
      </div>
    </Screen>
  );
}
