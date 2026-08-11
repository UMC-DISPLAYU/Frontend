import { useState } from 'react';

import { Plus } from 'lucide-react';

import { BottomButton } from '@/components/common';
import { useDisplayCreatePolicy } from '@/hooks/usePolicy';
import type { ExhibitionItem } from '@/types/mypage';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';

import { Header, Screen } from './Common';
import { ExhibitionCard } from './ExhibitionCard';

export function ManageScreen({
  exhibitions,
  onOpen,
  onBack,
  onDone,
  onDelete,
  onEditArtistName,
  onRegister,
}: {
  exhibitions: ExhibitionItem[];
  onOpen: (ex: ExhibitionItem) => void;
  onBack?: () => void;
  onDone: () => void;
  onDelete: (ex: ExhibitionItem) => void;
  onEditArtistName: (ex: ExhibitionItem) => void;
  onRegister: () => void;
}) {
  const [menuId, setMenuId] = useState<string | null>(null);
  const displayCreatePolicy = useDisplayCreatePolicy();
  const canCreateDisplay = hasPermission(displayCreatePolicy, 'create');

  return (
    <Screen>
      <Header title="내 전시 관리" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pt-1.5 pb-4">
        {/* 전시 관리 섹션 헤더 */}
        <div className="flex items-end justify-between gap-10 mb-4">
          <div className="flex-1 flex flex-col gap-1">
            <h2 className="typo-body-md-bold text-main">전시 관리</h2>
            <p className="typo-body-xs-regular text-faint">
              등록하거나 참여 중인 전시를 관리할 수 있어요
            </p>
          </div>
          <button
            onClick={onRegister}
            className="flex flex-col items-center gap-0.75 bg-transparent border-none p-0 cursor-pointer"
          >
            <div className="flex items-center justify-center overflow-hidden">
              <Plus size={19} className="text-main" strokeWidth={2} />
            </div>
            <span className="px-1.25 typo-body-xs-bold text-main leading-4">전시 추가</span>
          </button>
        </div>

        {/* 전시 카드 목록 */}
        <div className="flex flex-col gap-3">
          {exhibitions.map((ex) => (
            <ExhibitionCard
              key={ex.id}
              ex={ex}
              menuOpen={menuId === ex.id}
              onClick={() => onOpen(ex)}
              onDelete={() => {
                onDelete(ex);
                setMenuId(null);
              }}
              onEditArtistName={() => {
                onEditArtistName(ex);
                setMenuId(null);
              }}
              onToggleMenu={() => setMenuId((prev) => (prev === ex.id ? null : ex.id))}
            />
          ))}
        </div>
        {canCreateDisplay && (
          <button
            onClick={onRegister}
            className={cn(
              'typo-body-sm-regular w-full mt-3.5 p-4.5 rounded-xl border-none text-main cursor-pointer',
              'flex items-center justify-center gap-2',
              'bg-card',
            )}
          >
            <Plus size={18} /> 전시 등록하기
          </button>
        )}
      </div>
      <BottomButton type="button" onClick={onDone}>
        완료
      </BottomButton>
    </Screen>
  );
}
