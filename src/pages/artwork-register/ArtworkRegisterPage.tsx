import { useMemo, useState } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import { SessionChangedError } from '@/api/apiError';
import type { DisplayArtworkEditResponseDataDto, DisplayMemberEntryDto } from '@/api/dto';
import {
  ArtworkAuthorSection,
  type ArtworkImageUrls,
  type ArtworkPerson,
  ArtworkRegisterDone,
  ArtworkRegisterForm,
  ArtworkRegisterSkeleton,
  type ArtworkRegisterValues,
  buildCreateArtworkRequest,
  buildUpdateArtworkRequest,
  CoAuthorSheet,
  DIRECT_INPUT_CAPTION,
  EMPTY_ARTWORK_REGISTER_VALUES,
  parseProxyAuthor,
  type ProxyAuthor,
  splitArtworkImages,
  toArtworkRegisterValues,
  toNamedCoAuthor,
  toTeamCandidates,
  useLeaveArtworkRegister,
} from '@/components/artwork-register';
import { ErrorView } from '@/components/common';
import { useArtworkDetail, useArtworkForEdit } from '@/hooks/queries/useArtworkDetail';
import {
  useCreateDisplayArtwork,
  useUpdateDisplayArtwork,
} from '@/hooks/queries/useDisplayArtworks';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useDisplayMembers } from '@/hooks/queries/useDisplayMembers';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useArtworkPolicy } from '@/hooks/usePolicy';
import { useSkeleton } from '@/hooks/useSkeleton';
import { toast } from '@/stores/toastStore';
import { getErrorMessage } from '@/utils/error';
import { hasPermission } from '@/utils/hasPermission';

const notifyError = (error: unknown, fallback: string) => {
  if (error instanceof SessionChangedError) return;

  const message = getErrorMessage(error, fallback);
  if (message) toast(message);
};

interface ArtworkRegisterContentProps {
  displayId: number;
  displayTitle: string;
  ownerUserId?: number;
  myUserId?: number;
  author: ArtworkPerson;
  initialCoAuthors: ArtworkPerson[];
  defaultValues: ArtworkRegisterValues;
  initialImages: ArtworkImageUrls;
  edit?: { artworkId: number; previous: DisplayArtworkEditResponseDataDto };
}

function ArtworkRegisterContent({
  displayId,
  displayTitle,
  ownerUserId,
  myUserId,
  author,
  initialCoAuthors,
  defaultValues,
  initialImages,
  edit,
}: ArtworkRegisterContentProps) {
  const leave = useLeaveArtworkRegister();
  const workPath = `/exhibition/${displayId}/work`;
  const [coAuthors, setCoAuthors] = useState(initialCoAuthors);
  const [coSheet, setCoSheet] = useState({ open: false, key: 0 });
  const [registered, setRegistered] = useState<{ title: string; authors: string } | null>(null);
  const membersQuery = useDisplayMembers(displayId);
  const members = membersQuery.data;
  const createArtwork = useCreateDisplayArtwork(displayId);
  const updateArtwork = useUpdateDisplayArtwork(displayId);
  const isSubmitting = createArtwork.isPending || updateArtwork.isPending;

  const candidates = useMemo(
    () =>
      toTeamCandidates(members?.members, {
        excludeUserIds: [myUserId, author.userId],
        requireArtistVerified: true,
      }),
    [author.userId, members, myUserId],
  );

  const handleSubmit = (values: ArtworkRegisterValues, images: ArtworkImageUrls) => {
    const input = { values, images, author, coAuthors, ownerUserId };

    if (edit) {
      updateArtwork.mutate(
        {
          artworkId: edit.artworkId,
          body: buildUpdateArtworkRequest({ ...input, previous: edit.previous }),
        },
        {
          onSuccess: () => {
            toast('작품을 수정했어요');
            leave(workPath);
          },
          onError: (error) => notifyError(error, '작품을 수정하지 못했어요. 다시 시도해주세요.'),
        },
      );
      return;
    }

    createArtwork.mutate(buildCreateArtworkRequest(displayId, input), {
      onSuccess: () =>
        setRegistered({
          title: values.title.trim(),
          authors: [author.name, ...coAuthors.map((person) => person.name)].join(', '),
        }),
      onError: (error) => notifyError(error, '작품을 등록하지 못했어요. 다시 시도해주세요.'),
    });
  };

  if (registered) {
    return (
      <ArtworkRegisterDone
        description="등록한 작품은 전시 작업에서 확인할 수 있어요"
        summary={[
          { label: '작품명', value: registered.title },
          { label: '작가', value: registered.authors },
          { label: '전시', value: displayTitle },
        ]}
        // 들어온 전시 작업 기록으로 돌아간다(새로 쌓으면 전시 작업의 < 가 전시 작업으로 한 번 더 간다)
        onConfirm={() => leave(workPath)}
      />
    );
  }

  return (
    <ArtworkRegisterForm
      mode={edit ? 'edit' : 'create'}
      defaultValues={defaultValues}
      initialImages={initialImages}
      hasExtraChanges={coAuthors.length > 0}
      isReady={author.name.trim().length > 0}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      leaveFallback={workPath}
      allowVideo
      authorSection={
        <>
          <ArtworkAuthorSection
            author={author}
            coAuthors={coAuthors}
            onAddCoAuthor={() => {
              // 저장 중에 시트를 열면 저장 후 이동이 시트 기록만 닫고 이 화면에 남는다
              if (isSubmitting) return;
              setCoSheet((prev) => ({ open: true, key: prev.key + 1 }));
            }}
            onRemoveCoAuthor={(key) =>
              setCoAuthors((prev) => prev.filter((person) => person.key !== key))
            }
          />
          <CoAuthorSheet
            key={coSheet.key}
            open={coSheet.open}
            candidates={candidates}
            candidatesStatus={
              membersQuery.isError ? 'error' : membersQuery.isPending ? 'pending' : 'success'
            }
            onRetryCandidates={() => void membersQuery.refetch()}
            value={coAuthors}
            onClose={() => setCoSheet((prev) => ({ ...prev, open: false }))}
            onDone={(next) => {
              setCoAuthors(next);
              setCoSheet((prev) => ({ ...prev, open: false }));
            }}
          />
        </>
      }
    />
  );
}

type MemberNickname = Pick<DisplayMemberEntryDto, 'userId' | 'nickname'>;

// 프로토타입: 작가명 아래 줄은 계정 닉네임(아이디), 계정 없이 이름만 넣은 작가는 "직접 입력"
const authorCaption = (
  userId: number | null | undefined,
  me: { userId: number | undefined; nickname: string },
  members: readonly MemberNickname[] | undefined,
) => {
  if (typeof userId !== 'number') return DIRECT_INPUT_CAPTION;
  if (userId === me.userId) return me.nickname;
  return members?.find((member) => member.userId === userId)?.nickname?.trim() ?? '';
};

function ArtworkRegisterRoute() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const leave = useLeaveArtworkRegister();
  const displayId = Number(params.displayId);
  const artworkId = Number(params.artworkId ?? 0);
  const isEdit = artworkId > 0;
  const workPath = `/exhibition/${displayId}/work`;

  const userMeQuery = useUserMe();
  const displayQuery = useDisplayDetail(displayId);
  const membersQuery = useDisplayMembers(displayId);
  const editQuery = useArtworkForEdit(isEdit ? artworkId : 0);
  // 수정 화면 조회 응답에는 사진 구분(imageType)이 명세에 없어, 사진은 관람용 상세에서 나눈다
  const detailQuery = useArtworkDetail(isEdit ? artworkId : 0);

  const myUserId = userMeQuery.data?.id;
  const display = displayQuery.data;
  // 대신 등록은 대표자 · 관리자만 할 수 있다(기획 권한표)
  const canProxy = hasPermission(useArtworkPolicy(display), 'proxy');
  const proxy: ProxyAuthor | null = !isEdit && canProxy ? parseProxyAuthor(searchParams) : null;
  const members = membersQuery.data?.members;
  // 전시 작가명이 비어 있으면(빈 문자열 포함) 기본 닉네임을 쓴다
  const myName =
    members?.find((member) => member.userId === myUserId)?.displayNickname?.trim() ||
    userMeQuery.data?.nickname?.trim() ||
    '';
  const me = { userId: myUserId, nickname: userMeQuery.data?.nickname?.trim() ?? '' };

  const queries = [
    userMeQuery,
    displayQuery,
    membersQuery,
    ...(isEdit ? [editQuery, detailQuery] : []),
  ];
  const failed = queries.find((query) => query.isError);
  const isPending = queries.some((query) => query.isPending);
  const { showSkeleton } = useSkeleton(isPending);
  const title = isEdit ? '작품 수정' : '작품 등록';

  if (failed) {
    return (
      <ErrorView
        message={getErrorMessage(failed.error, '작품 정보를 불러오지 못했어요.')}
        onRetry={() => queries.forEach((query) => void query.refetch())}
      />
    );
  }

  if (showSkeleton || !display) {
    return <ArtworkRegisterSkeleton title={title} withAuthor onBack={() => leave(workPath)} />;
  }

  if (isEdit && editQuery.data && detailQuery.data) {
    const previous = editQuery.data;

    return (
      <ArtworkRegisterContent
        key={`edit-${artworkId}`}
        displayId={displayId}
        displayTitle={display.title}
        ownerUserId={display.ownerUserId}
        myUserId={myUserId}
        author={{
          key: 'author',
          name: previous.artistName,
          caption: authorCaption(previous.artistUserId, me, members),
          userId: previous.artistUserId ?? undefined,
        }}
        initialCoAuthors={(previous.coAuthors ?? []).map((coAuthor) =>
          typeof coAuthor.userId === 'number'
            ? {
                key: `user-${coAuthor.userId}`,
                name: coAuthor.name,
                caption: authorCaption(coAuthor.userId, me, members),
                userId: coAuthor.userId,
              }
            : toNamedCoAuthor(coAuthor.name),
        )}
        defaultValues={toArtworkRegisterValues(previous)}
        initialImages={{
          ...splitArtworkImages(detailQuery.data.images),
          artworkCrop: previous.artworkCrop,
        }}
        // 수정 화면 조회 응답에는 사진 설명이 없어, 다시 보낼 사진 설명 · 크기는 관람용 상세에서 가져온다
        edit={{ artworkId, previous: { ...previous, images: detailQuery.data.images } }}
      />
    );
  }

  const proxyMember =
    proxy?.kind === 'member'
      ? members?.find((member) => member.userId === proxy.userId && member.accepted !== false)
      : undefined;

  if (proxy?.kind === 'member' && !proxyMember) {
    return (
      <ErrorView
        message="작가로 선택한 팀원을 찾지 못했어요."
        retryLabel="돌아가기"
        onRetry={() => leave(workPath)}
      />
    );
  }

  const author: ArtworkPerson = proxyMember
    ? {
        key: 'author',
        name: proxyMember.displayNickname,
        caption: authorCaption(proxyMember.userId, me, members),
        userId: proxyMember.userId,
      }
    : proxy?.kind === 'name'
      ? { key: 'author', name: proxy.name, caption: DIRECT_INPUT_CAPTION }
      : {
          key: 'author',
          name: myName,
          caption: authorCaption(myUserId, me, members),
          userId: myUserId,
        };

  return (
    <ArtworkRegisterContent
      key={`new-${proxy?.kind ?? 'mine'}-${author.name}`}
      displayId={displayId}
      displayTitle={display.title}
      ownerUserId={display.ownerUserId}
      myUserId={myUserId}
      author={author}
      initialCoAuthors={[]}
      defaultValues={EMPTY_ARTWORK_REGISTER_VALUES}
      initialImages={{ artworkUrls: [], processUrls: [] }}
    />
  );
}

/**
 * 전시 출품작 등록(/exhibition/:displayId/artworks/new)과 수정(/exhibition/:displayId/artworks/:artworkId/edit).
 * 대표자가 대신 등록할 때는 전시 작업의 작품 추가 시트가 ?as=member&userId= 또는 ?as=name&name= 을 붙여 들어온다.
 */
export function ArtworkRegisterPage() {
  return (
    // 프로토타입은 태블릿 · 데스크톱에서도 입력 칸 바깥까지 흰 화면이다
    <div className="min-h-dvh bg-primary-white">
      <ArtworkRegisterRoute />
    </div>
  );
}
