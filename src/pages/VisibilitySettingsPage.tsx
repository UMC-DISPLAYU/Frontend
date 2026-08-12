import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { BottomButton } from '@/components/common';
import { ExhibitionHeader } from '@/components/ui';
import { RadioOption } from '@/components/visibility-settings';
import {
  CONTENT_OPEN_TO_VISIBILITY,
  formatStartDate,
  VISIBILITY_LABEL,
  VISIBILITY_TO_CONTENT_OPEN,
  type VisibilityType,
} from '@/constants/visibility';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useUpdateDisplayReservation } from '@/hooks/queries/useDisplayReservation';
import { useGoBackOrHome } from '@/hooks/useGoBackOrHome';
import { useDisplayPolicy } from '@/hooks/usePolicy';
import { hasPermission } from '@/utils/hasPermission';

interface VisibilityState {
  displayId?: number;
  startDate?: string | Date | null;
  artworkVisibility?: VisibilityType;
  contentVisibility?: VisibilityType;
}

interface VisibilitySectionProps {
  disabled?: boolean;
  title: string;
  value: VisibilityType;
  onChange: (next: VisibilityType) => void;
  startDateLabel: string | null;
}

function VisibilitySection({
  disabled = false,
  title,
  value,
  onChange,
  startDateLabel,
}: VisibilitySectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="typo-body-sm-bold text-main">{title}</span>
        <span className="typo-body-xs-regular text-hint">등록된 전시작 전체에 일괄 적용돼요.</span>
      </div>

      <div role="radiogroup" aria-label={title} className="flex flex-col gap-2">
        <RadioOption
          checked={value === 'immediate'}
          disabled={disabled}
          onSelect={() => onChange('immediate')}
          title={VISIBILITY_LABEL.immediate}
          description="등록 즉시 관람자에게 노출돼요."
        />
        <RadioOption
          checked={value === 'startDate'}
          disabled={disabled}
          onSelect={() => onChange('startDate')}
          title={VISIBILITY_LABEL.startDate}
          description={
            startDateLabel ? `${startDateLabel} 부터 노출돼요.` : '전시 시작일부터 노출돼요.'
          }
        />
      </div>
    </section>
  );
}

export function VisibilitySettings() {
  const navigate = useNavigate();
  const goBackOrHome = useGoBackOrHome();
  const { state } = useLocation() as { state: VisibilityState | null };
  const { displayId: paramDisplayId } = useParams();
  const displayId = Number(paramDisplayId ?? state?.displayId ?? 0);

  const startDateLabel = formatStartDate(state?.startDate);

  /* 공개 시점은 전시 상세 응답에 포함되어 있어 별도 조회가 없습니다. */
  const { data: display } = useDisplayDetail(displayId);
  const displayPolicy = useDisplayPolicy(
    display ?? {
      ownerUserId: 0,
      teamMembers: [],
    },
  );
  /*
   * 전시 등록 중에는 아직 displayId가 없어 권한을 판정할 대상이 없습니다.
   * 이때는 값을 다음 단계로 넘기기만 하므로 편집을 허용합니다.
   */
  const canEditDisplay =
    displayId > 0 ? Boolean(display) && hasPermission(displayPolicy, 'edit') : true;

  // 사용자가 아직 고르지 않았으면 서버 값을, 서버 값도 없으면 기본값을 보여줍니다.
  const [picked, setPicked] = useState<{
    artworkVisibility?: VisibilityType;
    contentVisibility?: VisibilityType;
  }>({});

  const artworkVisibility =
    picked.artworkVisibility ??
    (display?.artworkContentOpen
      ? CONTENT_OPEN_TO_VISIBILITY[display.artworkContentOpen]
      : undefined) ??
    state?.artworkVisibility ??
    'startDate';
  const contentVisibility =
    picked.contentVisibility ??
    (display?.exhibitionContentOpen
      ? CONTENT_OPEN_TO_VISIBILITY[display.exhibitionContentOpen]
      : undefined) ??
    state?.contentVisibility ??
    'startDate';

  const setArtworkVisibility = (next: VisibilityType) =>
    setPicked((prev) => ({ ...prev, artworkVisibility: next }));
  const setContentVisibility = (next: VisibilityType) =>
    setPicked((prev) => ({ ...prev, contentVisibility: next }));

  const updateMutation = useUpdateDisplayReservation(displayId);

  const save = () => {
    if (!displayId) {
      // displayId가 없으면 router state로만 전달 (등록 플로우)
      navigate(`/exhibition/${displayId}/manage`, {
        replace: true,
        state: { ...state, artworkVisibility, contentVisibility },
      });
      return;
    }

    // displayId가 있으면 API로 저장
    updateMutation.mutate(
      {
        artworkContentOpen: VISIBILITY_TO_CONTENT_OPEN[artworkVisibility],
        exhibitionContentOpen: VISIBILITY_TO_CONTENT_OPEN[contentVisibility],
      },
      {
        onSuccess: () => {
          navigate(`/exhibition/${displayId}/manage`, {
            replace: true,
            state: { ...state, artworkVisibility, contentVisibility },
          });
        },
      },
    );
  };

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page">
      <ExhibitionHeader title="공개 설정" onBack={() => goBackOrHome()} />

      <main className="min-h-0 flex-1 overflow-hidden px-5">
        <div className="flex flex-col gap-1">
          <h2 className="typo-body-md-bold text-main">공개 시점 설정</h2>
          <p className="typo-body-xs-regular text-hint">
            공개 설정은 대표자만 변경할 수 있어요.
            <br />
            전시 작품과 콘텐츠 노출 시점을 한 곳에서 관리해요.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3.5">
          <VisibilitySection
            disabled={!canEditDisplay}
            title="전시작 공개 시점"
            value={artworkVisibility}
            onChange={setArtworkVisibility}
            startDateLabel={startDateLabel}
          />
          <VisibilitySection
            disabled={!canEditDisplay}
            title="전시콘텐츠 공개 시점"
            value={contentVisibility}
            onChange={setContentVisibility}
            startDateLabel={startDateLabel}
          />
        </div>
      </main>

      <BottomButton type="button" onClick={save} disabled={!canEditDisplay}>
        저장하기
      </BottomButton>
    </div>
  );
}
