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
  const [registeredTitle, setRegisteredTitle] = useState<string | null>(null);
  const createArtwork = useCreatePersonalArtwork();
  const updateArtwork = useUpdatePersonalArtwork();
  const detailPath = previous ? `/personal-artworks/${previous.personalArtworkId}` : MY_PAGE_PATH;

  const handleSubmit = (values: ArtworkRegisterValues, images: ArtworkImageUrls) => {
    if (previous) {
      updateArtwork.mutate(
        {
          personalArtworkId: previous.personalArtworkId,
          body: buildPersonalArtworkRequest(values, images, previous.point),
        },
        {
          onSuccess: () => {
            toast('작품을 수정했어요');
            leave(detailPath);
          },
          onError: (error) => notifyError(error, '작품을 수정하지 못했어요. 다시 시도해주세요.'),
        },
      );
      return;
    }

    createArtwork.mutate(buildPersonalArtworkRequest(values, images), {
      onSuccess: () => setRegisteredTitle(values.title.trim()),
      onError: (error) => notifyError(error, '작품을 등록하지 못했어요. 다시 시도해주세요.'),
    });
  };

  if (registeredTitle !== null) {
    return (
      <ArtworkRegisterDone
        description="등록한 작품은 마이 페이지에서 확인할 수 있어요"
        summary={[
          { label: '작품명', value: registeredTitle },
          { label: '작가', value: userMe?.nickname ?? '' },
        ]}
        onConfirm={() => navigate(MY_PAGE_PATH, { replace: true })}
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
      leaveFallback={detailPath}
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

/** 개인 작품 등록(/personal-artworks/new)과 수정(/personal-artworks/:personalArtworkId/edit). 작가는 항상 나라서 작가 영역이 없다 */
export function PersonalArtworkRegisterPage() {
  const personalArtworkId = Number(useParams().personalArtworkId ?? 0);

  if (personalArtworkId > 0) {
    return <PersonalArtworkEditPage personalArtworkId={personalArtworkId} />;
  }

  return <PersonalArtworkRegisterContent />;
}
