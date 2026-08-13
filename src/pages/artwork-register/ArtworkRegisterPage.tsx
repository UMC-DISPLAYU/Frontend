import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { AddArtworkPage } from '@/components/artwork-register/AddArtworkPage';
import type {
  AuthorOption,
  RegisterPerson,
} from '@/components/artwork-register/ArtworkRegisterControls';
import {
  ArtworkRegisterSheets,
  type RegisterSheet,
} from '@/components/artwork-register/ArtworkRegisterSheets';
import { EnterArtistNamePage } from '@/components/artwork-register/EnterArtistNamePage';
import { RegisterArtworkPage } from '@/components/artwork-register/RegisterArtworkPage';
import { RegisterCollaboratorsPage } from '@/components/artwork-register/RegisterCollaboratorsPage';
import { SelectArtistPage } from '@/components/artwork-register/SelectArtistPage';
import { useFlowContext } from '@/components/guards/useFlowContext';
import { useHideFooter } from '@/components/layout';
import {
  ARTWORK_FIELD_MAP,
  DEFAULT_ARTWORK_IMAGE_HEIGHT,
  DEFAULT_ARTWORK_IMAGE_WIDTH,
} from '@/constants';
import { MAX_ARTWORK_PROGRESS_IMAGES, MAX_ARTWORK_UPLOAD_IMAGES } from '@/constants/exhibition';
import { ArtworkRegisterDraftProvider } from '@/contexts/artworkRegisterDraftContext';
import {
  type ArtworkOtherAuthorSource,
  type ArtworkRegisterMode,
} from '@/contexts/artworkRegisterDraftState';
import { useArtworkDetail } from '@/hooks/queries/useArtworkDetail';
import { useCreateDisplayArtwork, useDisplayArtworks } from '@/hooks/queries/useDisplayArtworks';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useDisplayMembers } from '@/hooks/queries/useDisplayMembers';
import { useArtworkRegisterDraft } from '@/hooks/useArtworkRegisterDraft';
import { useFlowBack } from '@/hooks/useFlowBack';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useArtworkPolicy } from '@/hooks/usePolicy';
import { useUserStore } from '@/stores/useUserStore';
import { hasPermission } from '@/utils/hasPermission';

import {
  type ArtworkRegisterFormValues,
  artworkRegisterSchema,
  artworkRegisterSubmitSchema,
  sanitizeArtworkRegisterYearInput,
  toArtworkRegisterProductionYear,
} from './artworkRegister.schema';

type RegisterStep = 'choice' | 'otherTeamAuthor' | 'otherAuthor' | 'basic' | 'participants';
const DIRECT_INPUT_ACCOUNT = '직접입력';

const formatMonthDay = (date: string | undefined) => {
  if (!date) return '';
  const [, month, day] = date.split('-');
  return month && day ? `${month}.${day}` : date;
};

export function ArtworkRegisterPage() {
  return (
    <ArtworkRegisterDraftProvider>
      <ArtworkRegisterPageContent />
    </ArtworkRegisterDraftProvider>
  );
}

function ArtworkRegisterPageContent() {
  useHideFooter();

  const { draft, updateDraft, resetDraft } = useArtworkRegisterDraft();
  const navigate = useNavigate();
  const flowBack = useFlowBack();
  const { completeFlow, completeStep } = useFlowContext();
  const location = useLocation();
  const { displayId: paramDisplayId, artworkId: paramArtworkId } = useParams();
  const [searchParams] = useSearchParams();
  const displayId = Number(paramDisplayId ?? searchParams.get('displayId') ?? 0);
  const artworkId = Number(paramArtworkId ?? 0);
  const isEditMode = artworkId > 0;
  const routeStep = useMemo<RegisterStep | null>(() => {
    const pathname = location.pathname;

    if (pathname.includes('/artworks/add/choice')) return 'choice';
    if (pathname.includes('/artworks/add/artist/direct')) return 'otherAuthor';
    if (pathname.includes('/artworks/add/artist')) return 'otherTeamAuthor';
    if (pathname.includes('/artworks/add/basic')) return 'basic';
    if (pathname.includes('/artworks/add/participants')) return 'participants';

    return null;
  }, [location.pathname]);

  const { data: artworkDetail } = useArtworkDetail(artworkId);

  /* 작품 이미지와 작업과정 이미지를 각각 따로 모아 등록 시 순서대로 업로드합니다. */
  const artworkUpload = useImageUpload({ domain: 'artwork', maxImages: MAX_ARTWORK_UPLOAD_IMAGES });
  const processUpload = useImageUpload({
    domain: 'artwork',
    maxImages: MAX_ARTWORK_PROGRESS_IMAGES,
  });
  const createArtwork = useCreateDisplayArtwork(displayId);
  const isSubmitting =
    artworkUpload.isUploading || processUpload.isUploading || createArtwork.isPending;
  const artworkImages = artworkUpload.images;
  const processImages = processUpload.images;
  const setUploadedArtworkImages = artworkUpload.setUploadedImages;
  const setUploadedProcessImages = processUpload.setUploadedImages;

  const [step, setStepState] = useState<RegisterStep>(
    isEditMode ? 'basic' : (routeStep ?? draft.step),
  );
  const [registerMode, setRegisterModeState] = useState<ArtworkRegisterMode>(draft.registerMode);
  const [activeSheet, setActiveSheet] = useState<RegisterSheet>(null);
  const [selectedOtherAuthorId, setSelectedOtherAuthorIdState] = useState<string | null>(
    draft.selectedOtherAuthorId,
  );
  const [otherAuthorName, setOtherAuthorNameState] = useState(draft.otherAuthorName);
  const [otherAuthorSource, setOtherAuthorSourceState] = useState<ArtworkOtherAuthorSource>(
    draft.otherAuthorSource,
  );
  const [directCollaboratorName, setDirectCollaboratorName] = useState('');
  const [title, setTitleState] = useState(draft.title);
  const [isTitleTouched, setIsTitleTouched] = useState(false);
  const [description, setDescriptionState] = useState(draft.description);
  const [field, setFieldState] = useState<string>(draft.field);
  const [year, setYearState] = useState(draft.year);
  const [isYearTouched, setIsYearTouched] = useState(false);
  const [medium, setMediumState] = useState(draft.medium);
  const [isMediumTouched, setIsMediumTouched] = useState(false);
  const [size, setSizeState] = useState(draft.size);
  const [point, setPointState] = useState(draft.point);
  /* userId가 있으면 디유 계정이 연결된 팀원, 없으면 직접 이름을 입력한 작가입니다. */
  const [collaborators, setCollaboratorsState] = useState<
    { id: string; name: string; account: string; userId?: number }[]
  >(draft.collaborators);
  const [qnaAssigneeIds, setQnaAssigneeIdsState] = useState<string[]>(draft.qnaAssigneeIds);

  const {
    formState: { errors },
    register,
    setValue,
    trigger,
  } = useForm<ArtworkRegisterFormValues>({
    resolver: zodResolver(artworkRegisterSchema),
    mode: 'onChange',
    defaultValues: {
      artworkImageCount: artworkImages.length,
      title,
      intro: description,
      field,
      year,
      material: medium,
      size,
      thoughts: point,
    },
  });

  const basicFormValue = {
    artworkImageCount: artworkImages.length,
    title,
    intro: description,
    field,
    year,
    material: medium,
    size,
    thoughts: point,
  };
  const canProceedBasic = artworkRegisterSchema.safeParse(basicFormValue).success;
  const basicFormError = artworkRegisterSchema.safeParse(basicFormValue).error;
  const getBasicFormError = (fieldName: keyof ArtworkRegisterFormValues) =>
    basicFormError?.issues.find((issue) => issue.path[0] === fieldName)?.message;
  const titleError = isTitleTouched ? getBasicFormError('title') : undefined;
  const yearError = isYearTouched ? getBasicFormError('year') : undefined;
  const mediumError = isMediumTouched ? getBasicFormError('material') : undefined;

  useEffect(() => {
    register('year');
  }, [register]);

  const yearInputProps = register('year', {
    onBlur: () => {
      setIsYearTouched(true);
      void trigger('year');
    },
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const nextYear = sanitizeArtworkRegisterYearInput(event.target.value);
      setIsYearTouched(true);
      setValue('year', nextYear, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setYearState(nextYear);
      updateDraft({ year: nextYear });
    },
  });

  useEffect(() => {
    setValue('artworkImageCount', artworkImages.length, { shouldValidate: true });
  }, [artworkImages.length, setValue]);

  const setStep = useCallback(
    (nextStep: RegisterStep, options: { replace?: boolean } = {}) => {
      setStepState(nextStep);
      updateDraft({ step: nextStep });

      if (isEditMode) return;

      const stepPathMap: Record<RegisterStep, string> = {
        choice: `/exhibition/${displayId}/artworks/add/choice`,
        otherTeamAuthor: `/exhibition/${displayId}/artworks/add/artist`,
        otherAuthor: `/exhibition/${displayId}/artworks/add/artist/direct`,
        basic: `/exhibition/${displayId}/artworks/add/basic`,
        participants: `/exhibition/${displayId}/artworks/add/participants`,
      };

      navigate(stepPathMap[nextStep], { replace: options.replace ?? true });
    },
    [displayId, isEditMode, navigate, updateDraft],
  );

  const setRegisterMode = useCallback(
    (mode: ArtworkRegisterMode) => {
      setRegisterModeState(mode);
      updateDraft({ registerMode: mode });
    },
    [updateDraft],
  );

  const setSelectedOtherAuthorId = useCallback(
    (id: string | null) => {
      setSelectedOtherAuthorIdState(id);
      updateDraft({ selectedOtherAuthorId: id });
    },
    [updateDraft],
  );

  const setOtherAuthorName = useCallback(
    (name: string) => {
      setOtherAuthorNameState(name);
      updateDraft({ otherAuthorName: name });
    },
    [updateDraft],
  );

  const setOtherAuthorSource = useCallback(
    (source: ArtworkOtherAuthorSource) => {
      setOtherAuthorSourceState(source);
      updateDraft({ otherAuthorSource: source });
    },
    [updateDraft],
  );

  const setTitle = useCallback(
    (value: string) => {
      setIsTitleTouched(true);
      setValue('title', value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      setTitleState(value);
      updateDraft({ title: value });
    },
    [setValue, updateDraft],
  );

  const setDescription = useCallback(
    (value: string) => {
      setValue('intro', value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      setDescriptionState(value);
      updateDraft({ description: value });
    },
    [setValue, updateDraft],
  );

  const setField = useCallback(
    (value: string) => {
      setValue('field', value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      setFieldState(value);
      updateDraft({ field: value });
    },
    [setValue, updateDraft],
  );

  const setYear = useCallback(
    (value: string) => {
      setIsYearTouched(true);
      setValue('year', value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      void trigger('year');
      setYearState(value);
      updateDraft({ year: value });
    },
    [setValue, trigger, updateDraft],
  );

  const setMedium = useCallback(
    (value: string) => {
      setIsMediumTouched(true);
      setValue('material', value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      setMediumState(value);
      updateDraft({ medium: value });
    },
    [setValue, updateDraft],
  );

  const setSize = useCallback(
    (value: string) => {
      setValue('size', value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      setSizeState(value);
      updateDraft({ size: value });
    },
    [setValue, updateDraft],
  );

  const setPoint = useCallback(
    (value: string) => {
      setValue('thoughts', value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      setPointState(value);
      updateDraft({ point: value });
    },
    [setValue, updateDraft],
  );

  const setCollaborators = useCallback(
    (
      updater: (
        prev: { id: string; name: string; account: string; userId?: number }[],
      ) => { id: string; name: string; account: string; userId?: number }[],
    ) => {
      setCollaboratorsState((prev) => {
        const next = updater(prev);
        updateDraft({ collaborators: next });
        return next;
      });
    },
    [updateDraft],
  );

  const setQnaAssigneeIds = useCallback(
    (nextValue: string[] | ((prev: string[]) => string[])) => {
      setQnaAssigneeIdsState((prev) => {
        const next = typeof nextValue === 'function' ? nextValue(prev) : nextValue;
        updateDraft({ qnaAssigneeIds: next });
        return next;
      });
    },
    [updateDraft],
  );

  useEffect(() => {
    if (artworkImages.length === 0 && draft.artworkImageUrls.length > 0) {
      setUploadedArtworkImages(draft.artworkImageUrls);
    }
  }, [artworkImages.length, setUploadedArtworkImages, draft.artworkImageUrls]);

  useEffect(() => {
    if (processImages.length === 0 && draft.processImageUrls.length > 0) {
      setUploadedProcessImages(draft.processImageUrls);
    }
  }, [processImages.length, setUploadedProcessImages, draft.processImageUrls]);

  useEffect(() => {
    if (isEditMode) return;

    const nextStep = routeStep ?? 'choice';

    if (nextStep === step) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStepState(nextStep);
    updateDraft({ step: nextStep });
  }, [isEditMode, routeStep, step, updateDraft]);

  useEffect(() => {
    if (!isEditMode || !artworkDetail) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(artworkDetail.artworkName || '');

    setDescription(artworkDetail.content || '');

    const fieldLabel =
      Object.entries(ARTWORK_FIELD_MAP).find(([, value]) => value === artworkDetail.type)?.[0] ??
      '';

    setField(fieldLabel);

    setYear(artworkDetail.productionYear ? String(artworkDetail.productionYear) : '');

    setMedium(artworkDetail.materialMedia || '');

    setSize(artworkDetail.size || '');

    setPoint(artworkDetail.point || '');
  }, [
    isEditMode,
    artworkDetail,
    setDescription,
    setField,
    setMedium,
    setPoint,
    setSize,
    setTitle,
    setYear,
  ]);

  /*
   * 전시 팀원 목록. 초대를 수락한 팀원만 작가로 지정할 수 있습니다.
   * 스웨거 TeamMemberResponse에는 작가 인증 여부가 없어 초대 수락 여부로 대신 판정합니다.
   */
  const userId = useUserStore((s) => s.userId);
  const accountId = useUserStore((s) => s.accountId);
  const setDisplayArtistName = useUserStore((s) => s.setDisplayArtistName);
  const { data: memberList } = useDisplayMembers(displayId);
  const { data: artworkList } = useDisplayArtworks(displayId);
  const { data: display } = useDisplayDetail(displayId);

  /* 작가 인증 + 전시 소속인만 전시작을 등록할 수 있습니다. */
  const artworkPolicy = useArtworkPolicy(display);
  const canCreateArtwork = hasPermission(artworkPolicy, 'create');

  const exhibition = useMemo(
    () => ({
      title: display?.title ?? '',
      org: display?.organization ?? display?.department ?? '',
      period: display
        ? `${formatMonthDay(display.period?.startDate)} - ${formatMonthDay(display.period?.endDate)}`
        : '',
      place: display?.location?.placeName ?? '',
      thumbnail: display?.images?.[0]?.imageUrl,
    }),
    [display],
  );

  const teamAuthorOptions = useMemo(() => {
    const members = (memberList?.members ?? []).map((member) => ({
      id: String(member.teamMemberId),
      userId: member.userId,
      name: member.displayNickname,
      account: member.displayNickname,
      verified: member.accepted !== false,
      isMember: true,
    }));

    /*
     * 직접 이름으로 등록된 작가도 목록에 노출하되 계정이 없어 선택은 막습니다.
     * 작품 목록 응답(ArtworkItemResponse)에는 artistUserId가 없어
     * 팀원 닉네임에 없는 작가명을 직접 입력으로 간주합니다.
     */
    const registeredNames = new Set(members.map((member) => member.name));
    const directAuthors = (artworkList?.artworks ?? [])
      .map((artwork) => artwork.artistName)
      .filter((name): name is string => Boolean(name))
      .filter((name) => {
        if (registeredNames.has(name)) return false;
        registeredNames.add(name);
        return true;
      })
      .map((name) => ({
        id: `direct-${name}`,
        userId: undefined as number | undefined,
        name,
        account: DIRECT_INPUT_ACCOUNT,
        verified: false,
        isMember: false,
      }));

    return [...members, ...directAuthors];
  }, [memberList, artworkList]);

  const otherAuthorOptions = useMemo(
    () =>
      teamAuthorOptions.filter((author) => author.userId === undefined || author.userId !== userId),
    [teamAuthorOptions, userId],
  );

  const selectedOtherAuthor = otherAuthorOptions.find(
    (author) => author.id === selectedOtherAuthorId,
  );

  /*
   * 전시작에는 계정 닉네임이 아니라 이 전시에서 쓰는 작가명(displayNickname)을 표시합니다.
   * 팀원 목록에 내가 없을 때만 계정 정보로 대신합니다.
   */
  const myDisplayNickname = useMemo(
    () => (memberList?.members ?? []).find((member) => member.userId === userId)?.displayNickname,
    [memberList, userId],
  );

  const ownerOption = useMemo(() => {
    const ownerUserId = display?.ownerUserId;
    if (typeof ownerUserId !== 'number') return null;

    const ownerMember = (memberList?.members ?? []).find((member) => member.userId === ownerUserId);
    const isMe = ownerUserId === userId;
    const ownerName = ownerMember?.displayNickname ?? (isMe ? myDisplayNickname || accountId : '');

    return {
      id: `owner-${ownerUserId}`,
      name: ownerName || '대표자',
      account: isMe ? accountId || ownerName || '대표자' : ownerName || '대표자',
      userId: ownerUserId,
      tag: '대표자',
    };
  }, [accountId, display?.ownerUserId, memberList, myDisplayNickname, userId]);

  useEffect(() => {
    setDisplayArtistName(myDisplayNickname || accountId);
  }, [accountId, myDisplayNickname, setDisplayArtistName]);

  const displayAuthor = useMemo(() => {
    /* 본인 등록은 로그인 사용자를, 팀원 선택은 해당 팀원의 계정을 작가로 연결합니다. */
    if (registerMode === 'own') {
      return {
        id: userId ? `own-${userId}` : 'own-author',
        name: myDisplayNickname || accountId || '작가',
        account: accountId || myDisplayNickname || '계정 정보 없음',
        userId: userId ?? undefined,
        tag: '작가인증',
      };
    }
    if (otherAuthorSource === 'team' && selectedOtherAuthor) {
      return {
        id: selectedOtherAuthor.id,
        name: selectedOtherAuthor.name,
        account: selectedOtherAuthor.account,
        userId: selectedOtherAuthor.userId,
        tag: '작가인증',
      };
    }

    /* 직접 입력한 작가는 계정이 없어 이름만 전송합니다. */
    return {
      id: 'other-author-direct',
      name: otherAuthorName,
      account: DIRECT_INPUT_ACCOUNT,
      userId: undefined as number | undefined,
      tag: '대리 등록',
    };
  }, [
    myDisplayNickname,
    accountId,
    otherAuthorName,
    otherAuthorSource,
    registerMode,
    selectedOtherAuthor,
    userId,
  ]);

  /* 공동 작업자에서는 작품 작가와 실제 등록자인 나를 뺍니다. */
  const collaboratorOptions = useMemo(() => {
    const collaboratorUserIds = new Set(
      collaborators
        .map((person) => person.userId)
        .filter((personUserId): personUserId is number => typeof personUserId === 'number'),
    );
    const collaboratorIds = new Set(collaborators.map((person) => person.id));

    return teamAuthorOptions.filter(
      (author) =>
        author.userId !== userId &&
        author.id !== displayAuthor.id &&
        !collaboratorIds.has(author.id) &&
        (author.userId === undefined || author.userId !== displayAuthor.userId) &&
        (author.userId === undefined || !collaboratorUserIds.has(author.userId)),
    );
  }, [teamAuthorOptions, collaborators, displayAuthor, userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollaborators((prev) => prev.filter((person) => person.userId !== userId));
  }, [setCollaborators, userId]);

  const qnaAssigneeOptions = useMemo(() => {
    /* 직접 입력한 작가는 연결할 계정이 없어 Q&A 담당자로 지정할 수 없습니다. */
    const hasAccount = (person: { userId?: number }) => person.userId !== undefined;

    const options: RegisterPerson[] = [];
    const addOption = (person: RegisterPerson) => {
      /* 같은 계정이 작가와 공동 작업자로 겹칠 수 있어 userId까지 확인합니다. */
      if (options.some((option) => option.id === person.id || option.userId === person.userId)) {
        return;
      }
      options.push(person);
    };

    if (ownerOption) {
      addOption(ownerOption);
    }

    if (hasAccount(displayAuthor)) {
      addOption({
        id: displayAuthor.id,
        name: displayAuthor.name,
        account: displayAuthor.account,
        userId: displayAuthor.userId,
        tag: displayAuthor.tag,
      });
    }

    collaborators.filter(hasAccount).forEach((person) => {
      addOption(person);
    });

    return options;
  }, [collaborators, displayAuthor, ownerOption]);
  const ownerQnaAssigneeId = ownerOption?.id;
  const selectedQnaAssigneeIds = qnaAssigneeIds.filter((id) =>
    qnaAssigneeOptions.some((person) => person.id === id),
  );
  const effectiveQnaAssigneeIds = ownerQnaAssigneeId
    ? [ownerQnaAssigneeId, ...selectedQnaAssigneeIds.filter((id) => id !== ownerQnaAssigneeId)]
    : selectedQnaAssigneeIds;

  useEffect(() => {
    if (!isEditMode || !artworkDetail?.qaHandlers || qnaAssigneeOptions.length === 0) return;

    const handlerIds = artworkDetail.qaHandlers
      .map((handler) => qnaAssigneeOptions.find((person) => person.userId === handler.userId)?.id)
      .filter((id): id is string => Boolean(id));

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQnaAssigneeIds(handlerIds);
  }, [isEditMode, artworkDetail?.qaHandlers, qnaAssigneeOptions, setQnaAssigneeIds]);

  const handleBack = () => {
    if (activeSheet) {
      setActiveSheet(null);
      return;
    }
    // If we are on the participants step, go back to basic (artwork info) step regardless of edit mode
    if (step === 'participants') {
      setStep('basic', { replace: true });
      return;
    }
    // When editing an existing artwork and we are on the basic step, navigate back to the artworks list (replace history)
    if (isEditMode && step === 'basic') {
      navigate(`/exhibition/${displayId}/artworks`, { replace: true });
      return;
    }
    // For other steps in edit or create flow, keep existing navigation logic
    if (step === 'basic') {
      setStep(
        registerMode === 'other'
          ? otherAuthorSource === 'team'
            ? 'otherTeamAuthor'
            : 'otherAuthor'
          : 'choice',
        { replace: true },
      );
      return;
    }
    if (step === 'otherTeamAuthor') {
      setStep('choice', { replace: true });
      return;
    }
    flowBack();
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const syncImageDraft = async () => {
    const [artworkImageUrls, processImageUrls] = await Promise.all([
      artworkUpload.images.length > 0 ? artworkUpload.uploadImages() : Promise.resolve([]),
      processUpload.images.length > 0 ? processUpload.uploadImages() : Promise.resolve([]),
    ]);

    updateDraft({ artworkImageUrls, processImageUrls });
    artworkUpload.setUploadedImages(artworkImageUrls);
    processUpload.setUploadedImages(processImageUrls);

    return { artworkImageUrls, processImageUrls };
  };

  /* 이미지를 업로드한 뒤 작품을 등록합니다. */
  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (isEditMode) {
      navigate(`/exhibition/${displayId}/artworks`, { replace: true });
      return;
    }

    if (!canCreateArtwork) {
      setSubmitError('작품을 등록할 권한이 없어요.');
      return;
    }

    setSubmitError(null);

    let artworkImageUrls: string[] = [];
    let processImageUrls: string[] = [];
    try {
      ({ artworkImageUrls, processImageUrls } = await syncImageDraft());
    } catch {
      setSubmitError('이미지 업로드에 실패했어요. 잠시 후 다시 시도해주세요.');
      return;
    }

    const artistUserId = displayAuthor.userId;
    /*
     * 선택한 담당자를 모두 보냅니다.
     * 서버가 최소 한 명을 요구해서 고르지 않았으면 등록을 막습니다.
     */
    const qaHandlerUserIds = Array.from(
      new Set(
        effectiveQnaAssigneeIds
          .map((id) => qnaAssigneeOptions.find((person) => person.id === id)?.userId)
          .filter((userId): userId is number => typeof userId === 'number'),
      ),
    );

    const submitResult = artworkRegisterSubmitSchema.safeParse({
      ...basicFormValue,
      artistName: displayAuthor.name,
      qaHandlerUserIds,
    });

    if (!submitResult.success) {
      setSubmitError(submitResult.error.issues[0]?.message ?? '작품 정보를 확인해주세요.');
      return;
    }

    const artworkType = ARTWORK_FIELD_MAP[field];

    if (!artworkType) {
      setSubmitError('작품분야를 선택해주세요.');
      return;
    }

    createArtwork.mutate(
      {
        displayId,
        artworkName: title.trim(),
        content: description.trim(),
        type: artworkType,
        productionYear: toArtworkRegisterProductionYear(year),
        materialMedia: medium.trim(),
        size: size.trim(),
        point: point.trim(),
        /*
         * 작품 이미지와 작업과정 이미지를 imageType으로 구분해 보냅니다.
         * 서버가 width/height를 @Positive 원시 int로 받아 0이나 누락은 거절되어 고정값을 씁니다.
         */
        images: [
          ...artworkImageUrls.map((imageUrl, index) => ({
            imageUrl,
            /* 대표 이미지는 작품 이미지 중 첫 장만 지정합니다. */
            isThumbnail: index === 0,
            imageType: 'ARTWORK',
            width: DEFAULT_ARTWORK_IMAGE_WIDTH,
            height: DEFAULT_ARTWORK_IMAGE_HEIGHT,
            sortOrder: index + 1,
          })),
          ...processImageUrls.map((imageUrl, index) => ({
            imageUrl,
            isThumbnail: false,
            imageType: 'WORK_PROCESS',
            width: DEFAULT_ARTWORK_IMAGE_WIDTH,
            height: DEFAULT_ARTWORK_IMAGE_HEIGHT,
            sortOrder: index + 1,
          })),
        ],
        artistName: displayAuthor.name.trim(),
        artistUserId,
        /* 계정이 연결된 팀원은 userIds로, 직접 입력한 작가는 rawNames로 보냅니다. */
        coAuthors: {
          userIds: collaborators
            .map((person) => person.userId)
            .filter((coAuthorUserId) => coAuthorUserId !== userId)
            .filter((userId): userId is number => typeof userId === 'number'),
          rawNames: collaborators
            .filter((person) => typeof person.userId !== 'number')
            .map((person) => person.name),
        },
        qaHandlerUserIds,
      },
      {
        onSuccess: () => {
          const primaryQnaAssignee =
            qnaAssigneeOptions.find((person) => person.id === effectiveQnaAssigneeIds[0]) ??
            qnaAssigneeOptions[0];

          resetDraft();
          completeFlow();
          navigate(`/exhibition/${displayId}/complete`, {
            state: {
              type: 'artwork',
              title: title.trim(),
              artistName: displayAuthor.name.trim(),
              registrantName: myDisplayNickname || accountId,
              registrantAccount: accountId,
              qnaAssigneeName: primaryQnaAssignee?.name,
              qnaAssigneeAccount: primaryQnaAssignee?.account,
            },
          });
        },
        onError: () => setSubmitError('작품 등록에 실패했어요. 잠시 후 다시 시도해주세요.'),
      },
    );
  };

  const handleChoiceNext = () => {
    if (registerMode === 'other') {
      completeStep('artwork-choice');
      setOtherAuthorSource('team');
      setActiveSheet('otherAuthorMethod');
      return;
    }

    completeStep('artwork-choice');
    setStep('basic');
  };

  const selectTeamOtherAuthor = () => {
    setOtherAuthorSource('team');
    setActiveSheet(null);
    setStep('otherTeamAuthor');
  };

  const selectDirectOtherAuthor = () => {
    setOtherAuthorSource('direct');
    setActiveSheet(null);
    setStep('otherAuthor', { replace: false });
  };

  const submitTeamOtherAuthor = () => {
    if (!selectedOtherAuthor?.verified) return;

    setOtherAuthorName(selectedOtherAuthor.name);
    setOtherAuthorSource('team');
    completeStep('artwork-author');
    setStep('basic');
  };

  const submitOtherAuthorName = () => {
    const trimmedAuthorName = otherAuthorName.trim();
    if (!trimmedAuthorName) return;

    setOtherAuthorName(trimmedAuthorName);
    setOtherAuthorSource('direct');
    completeStep('artwork-author');
    setStep('basic');
  };

  const handleBasicNext = async () => {
    if (isSubmitting) return;

    setSubmitError(null);

    try {
      await syncImageDraft();
      completeStep('artwork-basic');
      setStep('participants');
    } catch {
      setSubmitError('이미지 업로드에 실패했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  const openTeamCollaboratorSheet = () => {
    setActiveSheet('collaboratorTeam');
  };

  const openDirectCollaboratorSheet = () => {
    setDirectCollaboratorName('');
    setActiveSheet('collaboratorDirect');
  };

  const toggleQnaAssignee = (id: string) => {
    if (id === ownerQnaAssigneeId) return;

    setQnaAssigneeIds((prev) => {
      /* 자동 선택을 하지 않으므로 사용자가 고른 값만 유지합니다. */
      const baseIds = prev.filter((personId) =>
        qnaAssigneeOptions.some((person) => person.id === personId),
      );

      if (baseIds.includes(id)) {
        /* 담당자 0명은 제출 시점에 막으므로 마지막 한 명도 해제할 수 있습니다. */
        return baseIds.filter((personId) => personId !== id);
      }

      return [...baseIds, id];
    });
  };

  const addTeamCollaborator = (person: AuthorOption) => {
    if (!person.verified) return;

    setCollaborators((prev) => {
      if (prev.some((item) => item.id === person.id)) return prev;
      return [
        ...prev,
        { id: person.id, name: person.name, account: person.account, userId: person.userId },
      ];
    });
    setActiveSheet(null);
  };

  const submitDirectCollaborator = () => {
    const trimmedName = directCollaboratorName.trim();
    if (!trimmedName) return;

    setCollaborators((prev) => {
      const id = `direct-${trimmedName}`;
      if (prev.some((person) => person.id === id)) return prev;
      return [...prev, { id, name: trimmedName, account: DIRECT_INPUT_ACCOUNT }];
    });
    setActiveSheet(null);
  };

  return (
    <>
      {step === 'choice' && (
        <AddArtworkPage
          registerMode={registerMode}
          onBack={handleBack}
          onChangeRegisterMode={setRegisterMode}
          onNext={handleChoiceNext}
        />
      )}
      {step === 'otherTeamAuthor' && (
        <SelectArtistPage
          selectedOtherAuthorId={selectedOtherAuthorId}
          teamAuthorOptions={otherAuthorOptions}
          onBack={handleBack}
          onChangeSelectedOtherAuthorId={setSelectedOtherAuthorId}
          onSubmit={submitTeamOtherAuthor}
        />
      )}
      {step === 'otherAuthor' && (
        <EnterArtistNamePage
          otherAuthorName={otherAuthorName}
          onBack={handleBack}
          onChangeOtherAuthorName={setOtherAuthorName}
          onSubmit={submitOtherAuthorName}
        />
      )}
      {step === 'basic' && (
        <RegisterArtworkPage
          isEditMode={isEditMode}
          title={title}
          description={description}
          field={field}
          year={year}
          medium={medium}
          size={size}
          point={point}
          artworkImages={artworkImages}
          processImages={processImages}
          canProceed={canProceedBasic}
          titleError={titleError ?? errors.title?.message}
          yearError={yearError ?? errors.year?.message}
          mediumError={mediumError ?? errors.material?.message}
          yearInputProps={yearInputProps}
          onBack={handleBack}
          onChangeTitle={setTitle}
          onChangeDescription={setDescription}
          onChangeField={setField}
          onChangeMedium={setMedium}
          onChangeSize={setSize}
          onChangePoint={setPoint}
          onAddArtworkImages={artworkUpload.addImages}
          onRemoveArtworkImage={artworkUpload.removeImage}
          onAddProcessImages={processUpload.addImages}
          onRemoveProcessImage={processUpload.removeImage}
          onNext={handleBasicNext}
        />
      )}
      {step === 'participants' && (
        <RegisterCollaboratorsPage
          isEditMode={isEditMode}
          exhibition={exhibition}
          displayAuthor={displayAuthor}
          collaborators={collaborators}
          qnaAssigneeOptions={qnaAssigneeOptions}
          selectedQnaAssigneeIds={effectiveQnaAssigneeIds}
          ownerQnaAssigneeId={ownerQnaAssigneeId}
          submitError={submitError}
          isSubmitting={isSubmitting}
          onBack={handleBack}
          onOpenCollaboratorMethod={() => setActiveSheet('collaboratorMethod')}
          onRemoveCollaborator={(person: RegisterPerson) => {
            setCollaborators((prev) => prev.filter((item) => item.id !== person.id));
            setQnaAssigneeIds((prev) => prev.filter((id) => id !== person.id));
          }}
          onToggleQnaAssignee={toggleQnaAssignee}
          onSubmit={handleSubmit}
        />
      )}
      <ArtworkRegisterSheets
        activeSheet={activeSheet}
        collaboratorOptions={collaboratorOptions}
        directCollaboratorName={directCollaboratorName}
        onClose={() => setActiveSheet(null)}
        onOpenOtherTeamAuthor={selectTeamOtherAuthor}
        onOpenOtherDirectAuthor={selectDirectOtherAuthor}
        onOpenTeamCollaboratorSheet={openTeamCollaboratorSheet}
        onOpenDirectCollaboratorSheet={openDirectCollaboratorSheet}
        onAddTeamCollaborator={addTeamCollaborator}
        onChangeDirectCollaboratorName={setDirectCollaboratorName}
        onSubmitDirectCollaborator={submitDirectCollaborator}
      />
    </>
  );
}
