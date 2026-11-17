import { useRef } from 'react';

import { ErrorView, FullSheet, FullSheetHeader } from '@/components/common';
import { SkeletonList, SkeletonText } from '@/components/ui';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useSkeleton } from '@/hooks/useSkeleton';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/error';
import { staggerStyle } from '@/utils/stagger';

import type { InboxNotification } from './notification';

interface NotificationSheetProps {
  open: boolean;
  onClose: () => void;
  notifications: InboxNotification[];
  isPending: boolean;
  error: Error | null;
  onRetry: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  /** 이동할 곳(to)이 있는 알림을 눌렀을 때 */
  onSelect: (notification: InboxNotification) => void;
}

const ROW_CLASS = 'grid w-full grid-cols-[8px_minmax(0,1fr)] gap-x-3 py-4 text-left';

function NotificationContent({ notification }: { notification: InboxNotification }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={cn('mt-1.75 size-2 rounded-circle', notification.isUnread && 'bg-notice')}
      />
      <span className="min-w-0">
        {notification.isUnread && <span className="sr-only">안 읽음, </span>}
        <span className="typography-body-lg-medium block text-primary">
          {notification.body.map((segment, index) =>
            segment.bold ? (
              <strong className="font-semibold" key={index}>
                {segment.text}
              </strong>
            ) : (
              <span key={index}>{segment.text}</span>
            ),
          )}
        </span>
        <span className="typography-body-md-medium mt-0.5 block text-tertiary">
          {notification.timeLabel}
        </span>
      </span>
    </>
  );
}

function NotificationRowSkeleton() {
  return (
    <li className={cn(ROW_CLASS, 'border-b border-bg-tertiary')}>
      <span />
      <span className="min-w-0">
        <SkeletonText className="typography-body-lg-medium w-4/5" />
        <SkeletonText className="typography-body-md-medium mt-0.5 w-12" />
      </span>
    </li>
  );
}

export function NotificationSheet({
  open,
  onClose,
  notifications,
  isPending,
  error,
  onRetry,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onSelect,
}: NotificationSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { showSkeleton, skeletonProps } = useSkeleton(isPending);
  const triggerRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: onLoadMore,
    rootMargin: '0px 0px 200px 0px',
  });

  const renderBody = () => {
    if (showSkeleton) {
      return (
        <ul aria-label="알림을 불러오는 중">
          <SkeletonList count={4}>{() => <NotificationRowSkeleton />}</SkeletonList>
        </ul>
      );
    }

    if (isPending) return null;

    if (error && notifications.length === 0) {
      return (
        <ErrorView
          fullScreen={false}
          message={getErrorMessage(error, '알림을 불러오지 못했어요.')}
          onRetry={onRetry}
        />
      );
    }

    if (notifications.length === 0) {
      return <p className="typography-body-md-medium pt-6 pb-3">받은 알림이 없어요</p>;
    }

    return (
      <>
        <ul>
          {notifications.map((notification, index) => (
            <li
              className="animate-rise border-b border-bg-tertiary"
              key={notification.id}
              style={staggerStyle(index)}
            >
              {notification.to ? (
                <button
                  className={cn(
                    ROW_CLASS,
                    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
                  )}
                  onClick={() => onSelect(notification)}
                  type="button"
                >
                  <NotificationContent notification={notification} />
                </button>
              ) : (
                <div className={ROW_CLASS}>
                  <NotificationContent notification={notification} />
                </div>
              )}
            </li>
          ))}
        </ul>
        {hasNextPage && <div aria-hidden="true" className="h-1" ref={triggerRef} />}
      </>
    );
  };

  return (
    <FullSheet initialFocusRef={closeButtonRef} label="알림함" onClose={onClose} open={open}>
      {(requestClose) => (
        <>
          <FullSheetHeader closeButtonRef={closeButtonRef} onClose={requestClose} title="알림함" />
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-1 pb-[max(32px,env(safe-area-inset-bottom))]"
            {...skeletonProps}
          >
            {renderBody()}
          </div>
        </>
      )}
    </FullSheet>
  );
}
