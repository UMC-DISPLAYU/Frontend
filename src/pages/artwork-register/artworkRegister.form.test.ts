import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { createFormControl } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import {
  type ArtworkRegisterDraft,
  INITIAL_ARTWORK_REGISTER_DRAFT,
} from '@/contexts/artworkRegisterDraftState';

import {
  shouldInitializeArtworkRegister,
  toArtworkRegisterDraft,
  toArtworkRegisterFormValues,
} from './artworkRegister.form';
import {
  type ArtworkRegisterFormValues,
  artworkRegisterSchema,
  sanitizeArtworkRegisterYearInput,
} from './artworkRegister.schema';

const draft: ArtworkRegisterDraft = {
  ...INITIAL_ARTWORK_REGISTER_DRAFT,
  title: '작품명',
  description: '작품 설명',
  field: '회화',
  year: '2026',
  medium: '아크릴',
  size: '90 × 120 cm',
  point: '감상 포인트',
  artworkImageUrls: ['second.jpg', 'first.jpg'],
  processImageUrls: ['process.jpg'],
  collaborators: [{ id: '3', name: '공동 작가', account: 'artist', userId: 3 }],
  qnaAssigneeIds: ['owner-1', '3'],
};

const createForm = (savedDraft: ArtworkRegisterDraft) =>
  createFormControl<ArtworkRegisterFormValues>({
    defaultValues: toArtworkRegisterFormValues(savedDraft),
    resolver: zodResolver(artworkRegisterSchema),
    mode: 'onChange',
  });

describe('전시 작품 등록 폼', () => {
  it('변경한 폼 값을 draft로 저장하고 단계 재진입 시 이미지 순서와 참여자를 유지한다', async () => {
    const form = createForm(draft);
    const unsubscribe = form.subscribe({ formState: { values: true }, callback: () => {} });

    form.setValue('title', '변경한 작품명');
    form.setValue('intro', '변경한 설명');
    form.setValue('material', '캔버스');
    form.setValue('thoughts', '변경한 감상 포인트');

    const savedDraft = { ...draft, ...toArtworkRegisterDraft(form.getValues()) };
    const restored = createForm(savedDraft);

    expect(restored.getValues()).toEqual({
      artworkImageCount: 2,
      title: '변경한 작품명',
      intro: '변경한 설명',
      field: '회화',
      year: '2026',
      material: '캔버스',
      size: '90 × 120 cm',
      thoughts: '변경한 감상 포인트',
    });
    expect(savedDraft.artworkImageUrls).toEqual(['second.jpg', 'first.jpg']);
    expect(savedDraft.processImageUrls).toEqual(['process.jpg']);
    expect(savedDraft.collaborators).toEqual(draft.collaborators);
    expect(savedDraft.qnaAssigneeIds).toEqual(['owner-1', '3']);
    expect(await restored.trigger()).toBe(true);
    unsubscribe();
  });

  it('resolver가 입력 오류와 다음 단계 진입 여부를 판단하고 수정 데이터 reset은 touched를 지운다', async () => {
    const form = createForm(INITIAL_ARTWORK_REGISTER_DRAFT);
    const unsubscribe = form.subscribe({
      formState: { errors: true, touchedFields: true, isValid: true },
      callback: () => {},
    });

    expect(await form.trigger()).toBe(false);
    expect(form.getFieldState('title').isTouched).toBe(false);

    form.setValue('title', ' ', { shouldTouch: true });
    expect(await form.trigger('title')).toBe(false);
    expect(form.getFieldState('title')).toMatchObject({
      isTouched: true,
      error: { message: '작품명을 입력해주세요.' },
    });

    form.setValue('year', sanitizeArtworkRegisterYearInput('20a2'), { shouldTouch: true });
    expect(form.getValues('year')).toBe('202');
    expect(await form.trigger('year')).toBe(false);
    expect(form.getFieldState('year').error?.message).toBe('제작연도는 4자리 숫자로 입력해주세요.');

    form.reset(toArtworkRegisterFormValues(draft));
    expect(await form.trigger()).toBe(true);
    expect(form.getFieldState('title').isTouched).toBe(false);
    expect(form.getFieldState('year').isTouched).toBe(false);

    form.setValue('artworkImageCount', 0);
    expect(await form.trigger()).toBe(false);
    expect(form.getFieldState('artworkImageCount').error?.message).toBe(
      '작품 이미지를 1개 이상 업로드해주세요.',
    );
    unsubscribe();
  });

  it.each(['success', 'error'])(
    '첫 재조회 %s: 최신 값으로만 초기화하고 이후 입력과 이미지 삭제를 보존한다',
    async (outcome) => {
      const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      const queryKey = ['artwork', 7];
      const cachedDetail = { artworkId: 7, title: '이전 작품명', images: ['old.jpg'] };
      const serverDetail = {
        artworkId: 7,
        title: '최신 작품명',
        images: ['new.jpg', 'second.jpg'],
      };
      let resolveDetail!: (detail: typeof cachedDetail) => void;
      let rejectDetail!: (error: Error) => void;
      const response = new Promise<typeof cachedDetail>((resolve, reject) => {
        resolveDetail = resolve;
        rejectDetail = reject;
      });
      client.setQueryData(queryKey, cachedDetail);
      const observer = new QueryObserver(client, {
        queryKey,
        queryFn: () => response,
        staleTime: 0,
      });
      const form = createForm(INITIAL_ARTWORK_REGISTER_DRAFT);
      const unsubscribeForm = form.subscribe({ formState: { values: true }, callback: () => {} });
      let initializedId: number | null = null;
      let images: string[] = [];
      const unsubscribeQuery = observer.subscribe((result) => {
        if (
          !result.data ||
          !shouldInitializeArtworkRegister(
            7,
            initializedId,
            result.data.artworkId,
            result.fetchStatus,
            result.isError,
          )
        )
          return;
        form.reset({ ...toArtworkRegisterFormValues(draft), title: result.data.title });
        images = [...result.data.images];
        initializedId = 7;
      });

      try {
        expect(observer.getCurrentResult().fetchStatus).toBe('fetching');
        expect(form.getValues('title')).toBe('');
        expect(images).toEqual([]);

        if (outcome === 'error') {
          rejectDetail(new Error('Not Found'));
          await vi.waitFor(() => expect(observer.getCurrentResult().isError).toBe(true));
          expect(observer.getCurrentResult().fetchStatus).toBe('idle');
          expect(initializedId).toBeNull();
          expect(form.getValues('title')).toBe('');
          expect(images).toEqual([]);
          return;
        }

        resolveDetail(serverDetail);
        await vi.waitFor(() => expect(initializedId).toBe(7));
        expect(form.getValues('title')).toBe('최신 작품명');
        expect(images).toEqual(['new.jpg', 'second.jpg']);

        form.setValue('title', '내가 수정한 작품명', { shouldDirty: true });
        images.shift();
        client.setQueryData(queryKey, { ...serverDetail, title: '다시 조회한 작품명' });
        expect(form.getValues('title')).toBe('내가 수정한 작품명');
        expect(images).toEqual(['second.jpg']);
      } finally {
        unsubscribeQuery();
        unsubscribeForm();
        client.clear();
      }
    },
  );

  it('fresh 캐시는 즉시 초기화하되 일시 중지된 조회와 다른 작품 데이터는 기다린다', () => {
    expect(shouldInitializeArtworkRegister(7, null, 7, 'idle', false)).toBe(true);
    expect(shouldInitializeArtworkRegister(7, null, 7, 'paused', false)).toBe(false);
    expect(shouldInitializeArtworkRegister(7, null, 8, 'idle', false)).toBe(false);
    expect(shouldInitializeArtworkRegister(7, 7, 7, 'idle', false)).toBe(false);
  });
});
