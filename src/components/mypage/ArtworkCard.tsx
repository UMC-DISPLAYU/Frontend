import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { getArtworkDetail } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { useDeletePersonalArtwork } from '@/hooks/queries/usePersonalArtwork';
import type { SavedArtworkItem } from '@/types/mypage';

import { ArtworkDeleteConfirmModal } from './ArtworkDeleteConfirmModal';
import { ExhibitionMenuButton } from './ExhibitionMenuButton';
import { MemoFooter } from './MemoFooter';

interface ArtworkCardProps {
  item: SavedArtworkItem;
  isArtistView?: boolean;
  onUnarchive?: (item: SavedArtworkItem) => void;
  onSaveMemo?: (item: SavedArtworkItem, memo: string) => void;
  onDeleteMemo?: (item: SavedArtworkItem) => void;
  onOpen?: (item: SavedArtworkItem) => void;
  showMenu?: boolean;
}

export function ArtworkCard({
  item,
  isArtistView = false,
  onUnarchive,
  onSaveMemo,
  onDeleteMemo,
  onOpen,
  showMenu = false,
}: ArtworkCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deletePersonalArtwork = useDeletePersonalArtwork();

  /* 카드 영역은 div라서 키보드로도 열 수 있도록 역할과 키 처리를 함께 부여합니다. */
  const openHandlers = onOpen
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick: () => onOpen(item),
        onKeyDown: (event: React.KeyboardEvent) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          if (event.target !== event.currentTarget) return;

          event.preventDefault();
          onOpen(item);
        },
      }
    : {};

  const handleEdit = () => {
    if (item.personalArtworkId) {
      navigate(`/personal-artworks/register?id=${item.personalArtworkId}`);
    }
  };

  const handleDelete = () => {
    if (item.personalArtworkId) {
      deletePersonalArtwork.mutate(item.personalArtworkId);
    }
  };

  const handleGoWorkPage = async () => {
    if (item.displayId) {
      navigate(`/exhibition/${item.displayId}/work`);
      return;
    }

    if (item.artworkId) {
      const artwork = await queryClient.fetchQuery({
        queryKey: queryKeys.displayArtworks.detail(item.artworkId),
        queryFn: () => getArtworkDetail(item.artworkId as number),
      });
      const displayId = artwork.exhibitionInfo?.displayId;

      if (displayId) {
        navigate(`/exhibition/${displayId}/work`);
      }
    }
  };

  const isPersonalArtwork = Boolean(item.personalArtworkId);

  return (
    <article className="bg-card rounded-2xl shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] flex flex-col relative">
      <div {...openHandlers} className={onOpen ? 'cursor-pointer px-1.5 py-2.5' : 'px-1.5 py-2.5'}>
        <div className="relative rounded-xl">
          <div className="rounded-xl overflow-hidden">
            <div className="w-full h-44 bg-box200">
              {item.thumbnail && (
                <OptimizedImage
                  className="block w-full h-full object-cover"
                  src={item.thumbnail}
                  displayWidth={170}
                  alt={item.title}
                />
              )}
            </div>
          </div>

          {showMenu && (isPersonalArtwork || !!item.artworkId) && (
            <>
              <ExhibitionMenuButton
                onClick={(event) => {
                  event.stopPropagation();
                  setIsMenuOpen((prev) => !prev);
                }}
              />
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(event) => {
                      event.stopPropagation();
                      setIsMenuOpen(false);
                    }}
                  />
                  <div
                    onClick={(event) => event.stopPropagation()}
                    className="absolute right-2 top-12 z-50 w-36 rounded-[14px] border border-[#C4C4C4] bg-[#FCFCFC] shadow-[2px_4px_18px_0px_rgba(67,0,209,0.05)]"
                    style={{ fontFamily: 'Pretendard' }}
                  >
                    {isPersonalArtwork ? (
                      <>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setIsMenuOpen(false);
                            handleEdit();
                          }}
                          className="flex h-10 w-full items-center pl-[14px] text-left text-[12px] leading-[140%] tracking-[-0.36px] text-[#111]"
                        >
                          수정
                        </button>
                        <div className="border-t border-[#E9E9E9]" />
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setIsMenuOpen(false);
                            setIsDeleteModalOpen(true);
                          }}
                          className="flex h-10 w-full items-center pl-[14px] text-left text-[12px] leading-[140%] tracking-[-0.36px] text-[#C32427]"
                        >
                          삭제
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setIsMenuOpen(false);
                          handleGoWorkPage();
                        }}
                        className="flex h-10 w-full items-center pl-[14px] text-left text-[12px] leading-[140%] tracking-[-0.36px] text-[#111]"
                      >
                        작업 페이지 바로가기
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {!isArtistView && (
            <button
              type="button"
              aria-label="북마크 해제"
              className="absolute bottom-2 right-2"
              onClick={(event) => {
                event.stopPropagation();
                onUnarchive?.(item);
              }}
            >
              <Bookmark fill="currentColor" className="size-4 text-bookmark" />
            </button>
          )}
        </div>
      </div>

      <div
        {...openHandlers}
        className={
          onOpen
            ? 'cursor-pointer px-2.5 pt-0 pb-3 flex flex-col gap-0.5'
            : 'px-2.5 pt-0 pb-3 flex flex-col gap-0.5'
        }
      >
        <div className="typo-body-sm-bold text-main truncate">{item.title}</div>
        <div className="typo-body-xs-regular text-main truncate">{item.artist}</div>
      </div>

      {!isArtistView && (
        <MemoFooter
          className="px-2.5 py-2"
          memo={item.memo}
          userId={item.userId}
          onSave={(memo) => onSaveMemo?.(item, memo)}
          onDelete={() => onDeleteMemo?.(item)}
        />
      )}

      {isDeleteModalOpen && (
        <ArtworkDeleteConfirmModal
          onConfirm={() => {
            setIsDeleteModalOpen(false);
            handleDelete();
          }}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
    </article>
  );
}
