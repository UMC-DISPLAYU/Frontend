import { Link } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import FolderOpenIcon from '@/assets/display-hub/FolderOpenIcon.svg';
import PencilIcon from '@/assets/display-hub/PencilIcon.svg';
import UsersIcon from '@/assets/display-hub/UsersIcon.svg';
import ChevronIcon from '@/assets/exhibition-work/ChevronIcon.svg';

const CARD_CLASS =
  'rounded-12 border border-primary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99';

interface DisplayHubBlocksProps {
  display: DisplayDetailDto;
  artworkCount: number;
  acceptedCount: number;
  pendingCount: number;
}

export function DisplayHubBlocks({
  display,
  artworkCount,
  acceptedCount,
  pendingCount,
}: DisplayHubBlocksProps) {
  const basePath = `/exhibition/${display.displayId}`;
  const contentSectionCount = display.contentCategories.length;
  const isWorkEmpty = artworkCount === 0 && contentSectionCount === 0;

  return (
    <>
      <Link to={`${basePath}/work`} className={`${CARD_CLASS} flex flex-col gap-4 p-5`}>
        <span className="flex items-center justify-between">
          <span className="typography-body-lg-semibold flex items-center gap-2 text-primary">
            <img src={FolderOpenIcon} alt="" />
            전시 작업
          </span>
          <img src={ChevronIcon} alt="" />
        </span>
        {isWorkEmpty ? (
          <span className="typography-body-lg-regular text-secondary">
            아직 등록된 작품과 전시 콘텐츠가 없어요
          </span>
        ) : (
          <span className="grid grid-cols-2">
            <DisplayHubStat label="작품" value={artworkCount} unit="점" />
            <span className="border-l border-primary pl-4">
              <DisplayHubStat label="전시 콘텐츠" value={contentSectionCount} unit="섹션" />
            </span>
          </span>
        )}
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <Link to={`${basePath}/team`} className={`${CARD_CLASS} flex flex-col gap-3 p-4`}>
          <span className="typography-body-lg-semibold flex items-center gap-2 text-primary">
            <img src={UsersIcon} alt="" />
            <span className="flex-1">팀원 관리</span>
            <img src={ChevronIcon} alt="" className="hidden tablet:block" />
          </span>
          <span className="flex flex-col gap-1">
            <span className="typography-body-lg-regular text-secondary">
              참여 {acceptedCount}명
            </span>
            {pendingCount > 0 ? (
              <span className="typography-body-lg-semibold flex items-center gap-1.5 text-primary">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-circle bg-current text-icon-warning"
                />
                초대 대기 {pendingCount}명
              </span>
            ) : (
              <span className="typography-body-lg-regular text-secondary">초대 대기 0명</span>
            )}
          </span>
        </Link>

        <Link
          to={`${basePath}/edit`}
          state={{ displayDetail: display }}
          className={`${CARD_CLASS} flex flex-col gap-3 p-4`}
        >
          <span className="typography-body-lg-semibold flex items-center gap-2 text-primary">
            <img src={PencilIcon} alt="" />
            <span className="flex-1">기본 정보</span>
            <img src={ChevronIcon} alt="" className="hidden tablet:block" />
          </span>
          <span className="typography-body-lg-regular flex flex-col gap-1 text-secondary">
            <span>전시명·소개·일정</span>
            <span>장소·유의사항</span>
          </span>
        </Link>
      </div>
    </>
  );
}

function DisplayHubStat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="typography-body-lg-medium text-secondary">{label}</span>
      <span className="flex items-baseline gap-0.5">
        <span className="typography-body-xxl-semibold text-primary">{value}</span>
        <span className="typography-body-lg-medium text-secondary">{unit}</span>
      </span>
    </span>
  );
}
