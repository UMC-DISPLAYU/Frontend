import { useState } from 'react';

import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { SessionChangedError } from '@/api/apiError';
import type { PersonalArtworkResponseDataDto } from '@/api/dto';
import {
  type ArtworkImageUrls,
  ArtworkRegisterDone,
  ArtworkRegisterForm,
  ArtworkRegisterSkeleton,
  type ArtworkRegisterValues,
  buildPersonalArtworkRequest,
  EMPTY_ARTWORK_REGISTER_VALUES,
  readArtworkTypes,
  splitArtworkImages,
  toArtworkRegisterValues,
  useLeaveArtworkRegister,
} from '@/components/artwork-register';
import { ErrorView } from '@/components/common';
import {
  useCreatePersonalArtwork,
  usePersonalArtwork,
  useUpdatePersonalArtwork,
} from '@/hooks/queries/usePersonalArtwork';
import { useIsUserMePending, useUserMe } from '@/hooks/queries/useUserProfile';
import { usePersonalArtworkPolicy } from '@/hooks/usePolicy';
import { toast } from '@/stores/toastStore';
import { getErrorMessage } from '@/utils/error';
import { hasPermission } from '@/utils/hasPermission';

const MY_PAGE_PATH = '/my';

/** 개인 작품이 모여 있는 곳(전시작의 전시 작업처럼). 내 작가 프로필의 작품 목록이다 */
const artistProfilePath = (userId: number | undefined) =>
  typeof userId === 'number' ? `/artist/${userId}` : MY_PAGE_PATH;

const notifyError = (error: unknown, fallback: string) => {
  if (error instanceof SessionChangedError) return;

  const message = getErrorMessage(error, fallback);
  if (message) toast(message);
};

function PersonalArtworkRegisterContent({
  previous,
}: {
  previous?: PersonalArtworkResponseDataDto;
}) {
  const navigate = useNavigate();
  const leave = useLeaveArtworkRegister();
  const { data: userMe } = useUserMe();
  const [registered, setRegistered] = useState<{ title: string; artist: string } | null>(null);
  const createArtwork = useCreatePersonalArtwork();
  const updateArtwork = useUpdatePersonalArtwork();
  const profilePath = artistProfilePath(userMe?.id);
  // 수정은 들어온 작품 상세로, 등록은 작품이 보이는 내 작가 프로필로 돌아간다(들어온 기록이 없을 때)
  const leavePath = previous ? `/personal-artworks/${previous.personalArtworkId}` : profilePath;

  const handleSubmit = (values: ArtworkRegisterValues, images: ArtworkImageUrls) => {
    if (previous) {
      updateArtwork.mutate(
        {
          personalArtworkId: previous.personalArtworkId,
          body: buildPersonalArtworkRequest(values, images, previous),
        },
        {
          onSuccess: () => {
            toast('작품을 수정했어요');
            leave(leavePath);
          },
          onError: (error) => notifyError(error, '작품을 수정하지 못했어요. 다시 시도해주세요.'),
        },
      );
      return;
    }

    createArtwork.mutate(buildPersonalArtworkRequest(values, images), {
      onSuccess: (artwork) =>
        setRegistered({
          title: values.title.trim(),
          artist: artwork?.artistName || userMe?.nickname || '',
        }),
      onError: (error) => notifyError(error, '작품을 등록하지 못했어요. 다시 시도해주세요.'),
    });
  };

  if (registered) {
    return (
      <ArtworkRegisterDone
        description="등록한 작품은 작가 프로필에서 확인할 수 있어요"
        summary={[
          { label: '작품명', value: registered.title },
          { label: '작가', value: registered.artist },
        ]}
        onConfirm={() => navigate(profilePath, { replace: true })}
      />
    );
  }

  return (
    <ArtworkRegisterForm
      mode={previous ? 'edit' : 'create'}
      defaultValues={previous ? toArtworkRegisterValues(previous) : EMPTY_ARTWORK_REGISTER_VALUES}
      initialImages={
        previous ? splitArtworkImages(previous.images) : { artworkUrls: [], processUrls: [] }
      }
      isSubmitting={createArtwork.isPending || updateArtwork.isPending}
      onSubmit={handleSubmit}
      leaveFallback={leavePath}
      previousTypes={previous ? readArtworkTypes(previous) : undefined}
    />
  );
}

function PersonalArtworkEditPage({ personalArtworkId }: { personalArtworkId: number }) {
  const leave = useLeaveArtworkRegister();
  const { data, isPending, isError, error, refetch } = usePersonalArtwork(personalArtworkId);
  const policy = usePersonalArtworkPolicy(data);
  const isUserPending = useIsUserMePending();
  const detailPath = `/personal-artworks/${personalArtworkId}`;

  if (isError) {
    return (
      <ErrorView
        message={getErrorMessage(error, '작품 정보를 불러오지 못했어요.')}
        onRetry={() => void refetch()}
      />
    );
  }

  if (isPending || isUserPending) {
    return <ArtworkRegisterSkeleton title="작품 수정" onBack={() => leave(detailPath)} />;
  }

  if (!hasPermission(policy, 'edit')) return <Navigate to="/403" replace />;

  return <PersonalArtworkRegisterContent key={personalArtworkId} previous={data} />;
}

/**
 * 개인 작품 등록(/personal-artworks/new)과 수정(/personal-artworks/:personalArtworkId/edit).
 * 전시작 등록과 같은 폼을 쓴다. 개인 작품 요청에는 작가 · 공동 작가 필드가 없어(작가는 항상 나) 작가 영역을 두지 않는다
 */
export function PersonalArtworkRegisterPage() {
  const personalArtworkId = Number(useParams().personalArtworkId ?? 0);

  return (
    // 전시작 등록 화면과 같이 태블릿 · 데스크톱에서도 입력 칸 바깥까지 흰 화면이다
    <div className="min-h-dvh bg-primary-white">
      {personalArtworkId > 0 ? (
        <PersonalArtworkEditPage personalArtworkId={personalArtworkId} />
      ) : (
        <PersonalArtworkRegisterContent />
      )}
    </div>
  );
}
