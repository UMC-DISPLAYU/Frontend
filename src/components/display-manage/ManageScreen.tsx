import { Plus } from 'lucide-react';

import type { ExhibitionItem } from '@/types/mypage';
import { cn } from '@/utils/cn';

import { BottomBar, Header, Screen } from './Common';
import { ExhibitionCard } from './ExhibitionCard';

export function ManageScreen({
  exhibitions,
  onOpen,
  onBack,
  onRegister,
}: {
  exhibitions: ExhibitionItem[];
  onOpen: (ex: ExhibitionItem) => void;
  onBack?: () => void;
  onRegister: () => void;
}) {
  return (
    <Screen>
      <Header title="내 전시 관리" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pt-1.5 pb-4">
        <div className="flex flex-col gap-3.5">
          {exhibitions.map((ex) => (
            <ExhibitionCard key={ex.id} ex={ex} onClick={() => onOpen(ex)} />
          ))}
        </div>
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
      </div>
      <BottomBar>
        <button className="typo-body-md-bold w-full py-4.5 rounded-[14px] border-none bg-bt-black text-white cursor-pointer">
          완료
        </button>
      </BottomBar>
    </Screen>
  );
}
