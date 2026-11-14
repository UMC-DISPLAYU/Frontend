import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Skeleton } from '@/components/ui';
import { cn } from '@/utils/cn';

import type { ReceivedInvitation } from './receivedInvitation';

const POSTER_FRAME_CLASS = 'h-24 w-18 bg-secondary';
const ROW_CLASS = 'mt-3 grid grid-cols-[72px_minmax(0,1fr)] gap-x-4';

const BUTTON_CLASS =
  'typography-body-lg-bold flex h-11 items-center justify-center rounded-12 transition duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99';

interface InvitationCardProps {
  invitation: ReceivedInvitation;
  onReject: () => void;
  onAccept: () => void;
}

export function InvitationCard({ invitation, onReject, onAccept }: InvitationCardProps) {
  return (
    <li className="border-b border-bg-tertiary py-4">
      <p className="typography-body-md-medium text-secondary">{invitation.inviterLabel}</p>
      <div className={ROW_CLASS}>
        {invitation.posterUrl ? (
          <OptimizedImage
            alt=""
            displayWidth={72}
            frameClassName={POSTER_FRAME_CLASS}
            skeleton
            src={invitation.posterUrl}
          />
        ) : (
          <span aria-hidden="true" className={cn('block', POSTER_FRAME_CLASS)} />
        )}
        <div className="grid min-w-0 content-start gap-0.5">
          <b className="typography-body-xl-semibold block text-primary">{invitation.title}</b>
          {invitation.organization && (
            <span className="typography-body-md-medium block text-tertiary">
              {invitation.organization}
            </span>
          )}
          {invitation.period && (
            <span className="typography-body-md-regular2 block text-tertiary">
              {invitation.period}
            </span>
          )}
          {invitation.placeName && (
            <span className="typography-body-md-medium block text-tertiary">
              {invitation.placeName}
            </span>
          )}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          className={cn(BUTTON_CLASS, 'bg-secondary text-primary hover:bg-tertiary')}
          onClick={onReject}
          type="button"
        >
          거절하기
        </button>
        <button
          className={cn(
            BUTTON_CLASS,
            'bg-interactive-primary text-interactive-inverse hover:bg-interactive-primary-hover',
          )}
          onClick={onAccept}
          type="button"
        >
          수락하기
        </button>
      </div>
    </li>
  );
}

export function InvitationCardSkeleton() {
  return (
    <li aria-hidden="true" className="border-b border-bg-tertiary py-4">
      <Skeleton className="h-4 w-32 rounded-4" />
      <div className={ROW_CLASS}>
        <Skeleton className="h-24 w-18" />
        <div className="grid content-start gap-1.5">
          <Skeleton className="h-5.5 w-2/3 rounded-4" />
          <Skeleton className="h-4 w-1/2 rounded-4" />
          <Skeleton className="h-4 w-2/5 rounded-4" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Skeleton className="h-11 rounded-12" />
        <Skeleton className="h-11 rounded-12" />
      </div>
    </li>
  );
}
