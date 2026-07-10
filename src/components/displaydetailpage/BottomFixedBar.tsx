import { Share2 } from 'lucide-react';

import { DisplaySaveButton } from './DisplaySaveButton';

export function BottomFixedBar() {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-white border-t border-[#e5e5e5] px-5 py-3 flex items-center justify-between z-50 pb-[calc(12px+env(safe-area-inset-bottom))]">
      <button type="button" className="w-12 h-12 flex items-center justify-center shrink-0">
        <Share2 size={24} color="#333" />
      </button>

      <DisplaySaveButton className="flex-1 ml-2" />
    </div>
  );
}
