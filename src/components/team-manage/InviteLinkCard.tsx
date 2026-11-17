import {
  useDisplayInvitationUrl,
  useToggleDisplayInvitationLink,
} from '@/hooks/queries/useDisplayMembers';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/error';

import { CopyIcon } from './TeamIcons';

interface InviteLinkCardProps {
  displayId: number;
  invitationToken?: string | null;
  invitationDisabledAt?: string | null;
}

export function InviteLinkCard({
  displayId,
  invitationToken,
  invitationDisabledAt,
}: InviteLinkCardProps) {
  const toggle = useToggleDisplayInvitationLink(displayId);
  const { data: invitationUrl } = useDisplayInvitationUrl(displayId);
  const savedEnabled = Boolean(invitationToken) && !invitationDisabledAt;
  // 요청 중에는 누른 쪽으로 먼저 보여준다. 실패하면 서버 값으로 돌아간다
  const enabled = toggle.isPending ? toggle.variables : savedEnabled;
  const link = savedEnabled ? (invitationUrl ?? '') : '';
  const canCopy = enabled && link !== '';

  const changeEnabled = () => {
    toggle.mutate(!enabled, {
      onError: (error) =>
        toast(getErrorMessage(error, '초대 링크 설정을 바꾸지 못했어요. 다시 시도해주세요.')),
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast('링크를 복사했어요');
    } catch {
      toast('링크를 복사하지 못했어요. 다시 시도해주세요.');
    }
  };

  return (
    <section
      aria-label="링크로 초대"
      className={cn(
        'mt-3 rounded-[12px] border border-[#d4d4d8] px-4 pt-3.5 pb-4',
        enabled ? 'bg-[#fff]' : 'bg-[#f4f4f5]',
      )}
    >
      <div className="flex items-center gap-2">
        <h3 className="text-[14px] font-semibold">링크로 초대</h3>
        <span
          className={cn('text-[10px] font-semibold', enabled ? 'text-[#00c758]' : 'text-[#71717b]')}
        >
          {enabled ? '링크 활성화' : '초대 링크 꺼짐'}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="초대 링크"
          disabled={toggle.isPending}
          onClick={changeEnabled}
          // 보이는 크기는 44×26, 누르는 영역은 after 로 44×44 까지 넓힌다
          className={cn(
            'relative ml-auto h-6.5 w-11 shrink-0 rounded-full transition-colors duration-[250ms] after:absolute after:inset-x-0 after:-inset-y-[9px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] disabled:cursor-default',
            enabled ? 'bg-[#18181b]' : 'bg-[#a1a1aa]',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'absolute top-[3px] size-5 rounded-full bg-[#fff] transition-[left] duration-[250ms] ease-[cubic-bezier(.16,1,.3,1)]',
              enabled ? 'left-[21px]' : 'left-[3px]',
            )}
          />
        </button>
      </div>
      <p className="mt-1.5 text-[12px] font-medium text-[#71717b]">
        {enabled
          ? '링크를 공유하면 초대받은 사람이 이 전시에 참여할 수 있어요'
          : '초대 링크를 켜고 팀원을 초대해보세요'}
      </p>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <input
          type="text"
          readOnly
          value={enabled ? link : ''}
          placeholder="초대 링크 꺼짐"
          aria-label="초대 링크"
          disabled={!enabled}
          onFocus={(event) => event.currentTarget.select()}
          className={cn(
            'h-10 min-w-0 truncate rounded-[8px] border px-3 text-[12px] font-medium outline-0 placeholder:text-[#757575]',
            enabled
              ? 'border-[#d4d4d8] bg-[#fff] text-[#18181b]'
              : 'border-[#e4e4e7] bg-[#e4e4e7] text-[#71717b]',
          )}
        />
        <button
          type="button"
          disabled={!canCopy}
          onClick={() => void copyLink()}
          // 보이는 높이는 40px, 누르는 영역은 after 로 44px 까지 넓힌다
          className="relative inline-flex h-10 items-center gap-1.5 rounded-[8px] border border-[#18181b] bg-[#fff] px-3.5 text-[12px] font-semibold text-[#18181b] transition-colors duration-200 after:absolute after:inset-x-0 after:-inset-y-[3px] hover:bg-[#f4f4f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] disabled:cursor-default disabled:border-[#d4d4d8] disabled:text-[#d4d4d8] disabled:hover:bg-[#fff]"
        >
          <CopyIcon className="size-4" />
          링크 복사
        </button>
      </div>
      {!enabled && (
        <p className="mt-2 text-[12px] leading-[1.4] font-medium whitespace-pre-line text-[#71717b]">
          {'이 링크로 새로운 팀원이 참여할 수 없어요\n기존 팀원의 참여 상태는 유지돼요'}
        </p>
      )}
    </section>
  );
}
