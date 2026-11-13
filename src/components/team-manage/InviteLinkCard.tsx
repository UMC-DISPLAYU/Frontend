import CopyDisabledIcon from '@/assets/team-manage/CopyDisabledIcon.svg';
import CopyIcon from '@/assets/team-manage/CopyIcon.svg';
import { useToggleDisplayInvitationLink } from '@/hooks/queries/useDisplayMembers';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/error';

import { buildInviteLink } from './teamMembers';

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
  const savedEnabled = Boolean(invitationToken) && !invitationDisabledAt;
  // 요청 중에는 누른 쪽으로 먼저 보여준다. 실패하면 서버 값으로 돌아간다
  const enabled = toggle.isPending ? toggle.variables : savedEnabled;
  const link = savedEnabled && invitationToken ? buildInviteLink(invitationToken) : '';
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
        'mt-2.5 rounded-12 border border-primary p-3.5',
        enabled ? 'bg-icon-white' : 'bg-secondary',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="typography-body-lg-semibold shrink-0 text-primary">링크로 초대</h3>
          <span
            className={cn(
              'typography-body-sm-semibold',
              enabled ? 'text-success' : 'text-tertiary',
            )}
          >
            {enabled ? '링크 활성화' : '초대 링크 꺼짐'}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="초대 링크"
          disabled={toggle.isPending}
          onClick={changeEnabled}
          // 보이는 크기는 40×20, 누르는 영역은 after 로 44×44 까지 넓힌다
          className={cn(
            'relative h-5 w-10 shrink-0 rounded-circle transition-colors duration-fast ease-standard after:absolute after:-inset-x-0.5 after:-inset-y-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-default',
            enabled ? 'bg-primary-black' : 'bg-primary-400',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'absolute top-0.5 left-0.75 size-4 rounded-circle bg-icon-white transition-transform duration-fast ease-standard',
              enabled && 'translate-x-4.75',
            )}
          />
        </button>
      </div>
      <p className="typography-body-md-medium pt-1.5 text-tertiary">
        {enabled
          ? '링크를 공유하면 초대받은 사람이 이 전시에 참여할 수 있어요'
          : '초대 링크를 켜고 팀원을 초대해보세요'}
      </p>
      <div className="flex gap-2 pt-2.5">
        <p
          className={cn(
            'typography-body-md-medium flex h-9 min-w-0 flex-1 items-center rounded-8 border border-primary px-2.5',
            enabled
              ? 'bg-interactive-inverse text-interactive-primary-hover'
              : 'bg-tertiary text-tertiary',
          )}
        >
          <span className="sr-only">초대 링크 </span>
          <span className="truncate select-all">{enabled ? link : '초대 링크 꺼짐'}</span>
        </p>
        <button
          type="button"
          disabled={!canCopy}
          onClick={() => void copyLink()}
          // 보이는 높이는 36px, 누르는 영역은 after 로 44px 까지 넓힌다
          className="typography-body-md-semibold relative flex h-9 shrink-0 items-center gap-1 rounded-8 border border-interactive-selected bg-interactive-inverse px-2.5 text-primary transition duration-fast ease-standard after:absolute after:inset-x-0 after:-inset-y-1 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:cursor-default disabled:border-disable disabled:bg-interactive-inverse disabled:text-tertiary disabled:active:scale-100"
        >
          <span aria-hidden="true" className="relative size-4.25 shrink-0">
            <img
              src={canCopy ? CopyIcon : CopyDisabledIcon}
              alt=""
              className="absolute top-[2.33px] left-[2.5px]"
            />
          </span>
          링크 복사
        </button>
      </div>
      {!enabled && (
        <p className="typography-body-sm-regular pt-1.5 whitespace-pre-line text-tertiary">
          {'이 링크로 새로운 팀원이 참여할 수 없어요\n기존 팀원의 참여 상태는 유지돼요'}
        </p>
      )}
    </section>
  );
}
