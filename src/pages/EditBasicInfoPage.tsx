import { useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '@/api/apiError';
import type { UserProfileDto } from '@/api/dto';
import {
  ArtistVerifyActionButton,
  ArtistVerifyBottomBar,
  ArtistVerifyBottomButton,
  ArtistVerifyField,
  ArtistVerifyHeader,
  ArtistVerifyInput,
} from '@/components/artist-verify';
import { ConfirmDialog, ErrorView, ProfilePhotoField } from '@/components/common';
import { PageContainer } from '@/components/layout';
import { ProfileAvatar } from '@/components/mypage';
import { Skeleton } from '@/components/ui';
import { useUploadImage } from '@/hooks/queries/useFile';
import { useCheckNickname, useUpdateUserMe, useUserMe } from '@/hooks/queries/useUserProfile';
import { useFlowBack } from '@/hooks/useFlowBack';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/error';

import {
  type EditBasicInfoFormValues,
  editBasicInfoSchema,
  NICKNAME_MAX,
} from './editBasicInfo.schema';

const FORM_ID = 'edit-basic-info-form';
const HELPER_ID = 'nickname-helper';

export function EditBasicInfoPage() {
  const { data: userMe, isPending, isError, error, refetch } = useUserMe();

  if (isError && !userMe) {
    return (
      <ErrorView
        message={getErrorMessage(error, '내 정보를 불러오지 못했어요.')}
        onRetry={() => void refetch()}
      />
    );
  }

  if (isPending || !userMe) {
    return (
      <PageContainer className="bg-primary-white" variant="form">
        <div aria-hidden="true" className="flex flex-col gap-5 pt-17">
          <Skeleton className="mx-auto size-20 rounded-circle" />
          <Skeleton className="h-16 w-full rounded-4" />
        </div>
      </PageContainer>
    );
  }

  return <EditBasicInfoForm userMe={userMe} />;
}

type NicknameCheck = { nickname: string; isAvailable: boolean };

function EditBasicInfoForm({ userMe }: { userMe: UserProfileDto }) {
  const flowBack = useFlowBack();
  const navigate = useNavigate();
  const updateUserMe = useUpdateUserMe();
  const uploadImage = useUploadImage();
  const checkNickname = useCheckNickname();

  const initialNickname = userMe.nickname || userMe.name || '';
  const initialPhotoUrl = userMe.profileImageUrl || null;
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialPhotoUrl);
  const [nicknameCheck, setNicknameCheck] = useState<NicknameCheck | null>(null);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // 상태 반영 전에 연달아 눌린 제출을 막는다
  const savingRef = useRef(false);

  useEffect(() => {
    if (!photoPreview?.startsWith('blob:')) return;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<EditBasicInfoFormValues>({
    defaultValues: { nickname: initialNickname },
    mode: 'onChange',
    resolver: zodResolver(editBasicInfoSchema),
  });

  const nickname = useWatch({ control, name: 'nickname' }) ?? '';
  const isNicknameChanged = nickname !== initialNickname;
  const isNicknameShapeValid = editBasicInfoSchema.safeParse({ nickname }).success;
  const checkedNow = nicknameCheck?.nickname === nickname ? nicknameCheck : null;
  const isChecked = checkedNow?.isAvailable === true;
  const isTaken = checkedNow?.isAvailable === false;
  // 비어 있을 때는 오류 대신 기본 안내를 보인다(프로토타입)
  const nicknameError = nickname ? errors.nickname?.message : undefined;

  const isPhotoChanged = photoPreview !== initialPhotoUrl;
  const hasChanges = isNicknameChanged || isPhotoChanged;
  const canSave =
    hasChanges && isNicknameShapeValid && (!isNicknameChanged || isChecked) && !isSaving;

  const helper = nicknameError
    ? { text: nicknameError, tone: 'error' as const }
    : isTaken
      ? { text: '이미 사용 중인 닉네임이에요', tone: 'error' as const }
      : isChecked
        ? { text: '사용할 수 있는 닉네임이에요', tone: 'success' as const }
        : isNicknameChanged && nickname.length >= 2
          ? { text: '중복 확인을 해주세요', tone: 'idle' as const }
          : { text: '한글, 영문, 숫자로 2~15자', tone: 'idle' as const };

  const handleCheck = () => {
    if (!isNicknameShapeValid || checkNickname.isPending) return;
    const target = nickname;
    checkNickname.mutate(
      { nickname: target },
      {
        onSuccess: (data) => setNicknameCheck({ nickname: target, isAvailable: data.isAvailable }),
        onError: (error) =>
          toast(getErrorMessage(error, '닉네임 중복 확인에 실패했어요. 다시 시도해주세요.')),
      },
    );
  };

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleBack = () => (hasChanges ? setIsLeaveOpen(true) : flowBack());

  const onSubmit = async (values: EditBasicInfoFormValues) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    try {
      const profileImageUrl = photoFile
        ? await uploadImage.mutateAsync({ file: photoFile, domain: 'profile' })
        : photoPreview
          ? undefined
          : null;
      await updateUserMe.mutateAsync({
        nickname: values.nickname,
        ...(isPhotoChanged ? { profileImageUrl } : {}),
      });
      toast('프로필을 저장했어요');
      flowBack();
    } catch (error) {
      if (
        error instanceof ApiError &&
        ['DUPLICATE_NICKNAME', 'INVALID_NICKNAME_FORMAT'].includes(error.code ?? '')
      ) {
        setNicknameCheck(null);
        setError('nickname', {
          type: 'server',
          message: getErrorMessage(error, '닉네임을 확인해주세요.'),
        });
      } else {
        toast(getErrorMessage(error, '프로필을 저장하지 못했어요. 다시 시도해주세요.'));
      }
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <PageContainer className="bg-primary-white" variant="form">
      <ArtistVerifyHeader onBack={handleBack} title="기본 정보 수정" />

      <form
        className="flex-1 pt-5 pb-6"
        id={FORM_ID}
        noValidate
        onSubmit={(event) => handleSubmit(onSubmit)(event)}
      >
        <fieldset className="flex flex-col gap-5" disabled={isSaving}>
          <ProfilePhotoField
            disabled={isSaving}
            onChange={handlePhotoChange}
            placeholder={<ProfileAvatar size={80} />}
            shape="circle"
            src={photoPreview}
          />

          <div className="flex items-start gap-2">
            <ArtistVerifyField className="flex-1" htmlFor="nickname" label="닉네임">
              <ArtistVerifyInput
                aria-describedby={HELPER_ID}
                autoCapitalize="none"
                autoComplete="off"
                id="nickname"
                invalid={helper.tone === 'error'}
                maxLength={NICKNAME_MAX}
                placeholder="닉네임"
                spellCheck={false}
                {...register('nickname')}
              />
              <p
                aria-live="polite"
                className={cn(
                  'typography-body-md-medium',
                  helper.tone === 'error' && 'text-error',
                  helper.tone === 'success' && 'text-success',
                  helper.tone === 'idle' && 'text-secondary',
                )}
                id={HELPER_ID}
              >
                {helper.text}
              </p>
            </ArtistVerifyField>
            <ArtistVerifyActionButton
              disabled={
                !isNicknameChanged || !isNicknameShapeValid || isChecked || checkNickname.isPending
              }
              onClick={handleCheck}
            >
              {isChecked ? '확인 완료' : '중복 확인'}
            </ArtistVerifyActionButton>
          </div>
        </fieldset>
      </form>

      <ArtistVerifyBottomBar>
        <ArtistVerifyBottomButton disabled={!canSave} form={FORM_ID} type="submit">
          {isSaving ? '저장 중' : '저장'}
        </ArtistVerifyBottomButton>
      </ArtistVerifyBottomBar>

      <ConfirmDialog
        cancelLabel="계속 수정"
        confirmLabel="나가기"
        description="바꾼 내용은 저장되지 않아요."
        onCancel={() => setIsLeaveOpen(false)}
        onConfirm={() => {
          // 확인창이 쌓은 기록과 이 화면을 함께 빠져나간다
          if (window.history.length > 2) navigate(-2);
          else navigate('/my', { replace: true });
        }}
        open={isLeaveOpen}
        title="수정을 그만할까요?"
      />
    </PageContainer>
  );
}
