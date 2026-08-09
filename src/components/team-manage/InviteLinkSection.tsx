import { useState } from 'react';

import { Copy } from 'lucide-react';

import EntypoCycle from '@/assets/exhibition-register/entypo_cycle.svg';

import { Toggle } from './Toggle';

interface InviteLinkSectionProps {
  inviteLink: string;
  enabled: boolean;
  onToggle: (next: boolean) => void;
  pending?: boolean;
}

export function InviteLinkSection({
  inviteLink,
  enabled,
  onToggle,
  pending = false,
}: InviteLinkSectionProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 클립보드 권한이 없으면 조용히 무시 */
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="typo-body-sm-regular text-main">초대 링크 활성화</span>
        <Toggle checked={enabled} onChange={onToggle} disabled={pending} />
      </div>

      {enabled && inviteLink && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            <span className="grid h-4 w-7 shrink-0 place-items-center rounded-sm bg-card outline outline-1 outline-offset-[-1px] outline-line-soft">
              <img src={EntypoCycle} className="size-3" alt="cycle" />
            </span>
            <span className="typo-body-xs-regular truncate text-main">{inviteLink}</span>
          </div>
          <button type="button" onClick={copyLink} className="flex shrink-0 items-center gap-0.5">
            <Copy className="size-3 text-main" strokeWidth={2} />
            <span className="typo-body-xs-regular text-main">{copied ? '복사됨' : '복사'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
