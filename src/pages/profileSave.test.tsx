import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/apiError';
import { ErrorView } from '@/components/common';

import { ArtistVerificationPage } from './artist-verification/ArtistVerificationPage';
import { EditArtistProfilePage } from './artist-verification/EditArtistProfilePage';
import { EditBasicInfoPage } from './EditBasicInfoPage';

const h = vi.hoisted(() => ({
  states: [] as unknown[],
  refs: [] as { current: unknown }[],
  si: 0,
  ri: 0,
  save: vi.fn(),
  upload: vi.fn(),
  back: vi.fn(),
  setError: vi.fn(),
  toast: vi.fn(),
  fresh: true,
  queryError: false,
}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useEffect: () => {},
  useCallback: (callback: unknown) => callback,
  useState: (initial: unknown) => {
    const i = h.si++;
    if (!(i in h.states)) h.states[i] = initial;
    return [
      h.states[i],
      (value: unknown) => {
        h.states[i] = typeof value === 'function' ? value(h.states[i]) : value;
      },
    ];
  },
  useRef: (initial: unknown) => h.refs[h.ri++] ?? (h.refs[h.ri - 1] = { current: initial }),
  useReducer: () => [
    {
      school: '학교',
      email: 'a@school.kr',
      code: '123456',
      completedSteps: new Set(['email', 'code']),
    },
    vi.fn(),
  ],
}));
vi.mock('react-hook-form', () => ({
  Controller: () => null,
  useForm: () => ({
    register: () => ({}),
    handleSubmit: (handler: unknown) => handler,
    control: {},
    setValue: vi.fn(),
    setError: h.setError,
    clearErrors: vi.fn(),
    formState: { errors: {}, isValid: true, isDirty: true, isSubmitting: false },
  }),
  useWatch: ({ name }: { name: string }) =>
    ({
      nickname: '작가',
      artistName: '작가',
      introduction: '소개',
      fields: ['PAINTING'],
      univName: '학교',
      instagram: '',
      portfolio: '',
    })[name as 'nickname'],
}));
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));
vi.mock('@/hooks/useFlowBack', () => ({ useFlowBack: () => h.back }));
vi.mock('@/hooks/queries/useFile', () => ({
  useUploadImage: () => ({ mutateAsync: h.upload, isPending: false }),
}));
vi.mock('@/hooks/useFetchedSinceMount', () => ({ useFetchedSinceMount: () => h.fresh }));
vi.mock('@/hooks/queries/useUserProfile', () => ({
  useUserMe: () => ({ data: { id: 1, nickname: '작가' }, isError: h.queryError }),
  useMyArtistProfile: () => ({
    data: { artistName: '작가', fields: ['PAINTING'] },
    isError: h.queryError,
  }),
  useUpdateUserMe: () => ({ mutateAsync: h.save, isPending: false }),
  useUpdateMyArtistProfile: () => ({ mutateAsync: h.save, isPending: false }),
  useCreateMyArtistProfile: () => ({ mutateAsync: h.save, isPending: false }),
  useCheckNickname: () => ({ isPending: false }),
}));
vi.mock('@/hooks/queries/useSchoolEmailVerification', () => ({
  useSearchSchools: () => ({ data: [] }),
  useSendVerificationEmail: () => ({}),
  useResendVerificationEmail: () => ({}),
  useConfirmVerificationEmail: () => ({}),
}));
vi.mock('@/components/common', () => ({
  BottomButton: () => null,
  ConfirmDialog: () => null,
  ErrorView: () => null,
  LinkInputField: () => null,
  ProfileAvatar: () => null,
  ProfilePhotoField: () => null,
}));
vi.mock('@/components/ui', () => ({
  ChipGroup: () => null,
  Skeleton: () => null,
  SkeletonText: () => null,
}));
vi.mock('@/stores/toastStore', () => ({ toast: h.toast }));
vi.mock('@/components/artist-verification', () => ({
  ArtistFieldSelector: () => null,
  ArtistProfileSection: () => null,
  ArtistVerificationBottomButton: () => null,
  ArtistVerificationComplete: () => null,
  ArtistVerificationHeader: () => null,
  CodeVerificationField: () => null,
  EmailVerificationField: () => null,
  SchoolSearchField: () => null,
}));

type Element = ReactElement<Record<string, unknown>>;
const nodes = (node: ReactNode): Element[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<Record<string, unknown>>(child)
      ? [child, ...nodes(child.props.children as ReactNode)]
      : [],
  );
const render = (page: () => ReactElement, nested = true) => {
  h.si = 0;
  h.ri = 0;
  const root = page();
  return nodes(nested ? (root.type as (props: unknown) => ReactNode)(root.props) : root);
};
const form = (tree: Element[]) =>
  tree.find((node) => node.type === 'form')!.props.onSubmit as (
    data: Record<string, unknown>,
  ) => Promise<void>;
const values = {
  nickname: '작가',
  artistName: '작가',
  fields: ['PAINTING'],
  introduction: '소개',
  instagram: '',
  portfolio: '',
};
const failure = new ApiError('server', { status: 500 });

beforeEach(() => {
  h.states = [];
  h.refs = [];
  h.fresh = true;
  h.queryError = false;
  vi.clearAllMocks();
  h.save.mockResolvedValue(undefined);
  h.upload.mockResolvedValue('https://example.com/photo.png');
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
});

it.each([
  ['기본 정보 수정', EditBasicInfoPage],
  ['작가 프로필 수정', EditArtistProfilePage],
])('%s: 업로드 실패·저장 실패는 사진을 유지하고 알리며, 성공만 이동한다', async (_, page) => {
  let tree = render(page);
  const photo = () => tree.find((node) => 'src' in node.props && 'onChange' in node.props)!;
  (photo().props.onChange as (file: File) => void)({ name: 'photo.jpg' } as File);

  h.upload.mockRejectedValueOnce(failure);
  await form(render(page))(values);
  expect(h.save).not.toHaveBeenCalled();
  expect(h.back).not.toHaveBeenCalled();
  expect(h.toast).toHaveBeenLastCalledWith(expect.stringContaining('서버'));
  tree = render(page);
  expect(photo().props.src).toBe('blob:preview');

  h.save.mockRejectedValueOnce(failure);
  await form(tree)(values);
  expect(h.back).not.toHaveBeenCalled();

  await form(render(page))(values);
  expect(h.back).toHaveBeenCalledTimes(1);
  expect(h.save).toHaveBeenLastCalledWith(
    expect.objectContaining({ profileImageUrl: 'https://example.com/photo.png' }),
  );
});

it('중복 닉네임을 필드에 안내하며 이동하지 않는다', async () => {
  h.save.mockRejectedValueOnce(
    new ApiError('이미 사용 중인 닉네임입니다.', { status: 409, code: 'DUPLICATE_NICKNAME' }),
  );
  await form(render(EditBasicInfoPage))(values);
  expect(h.setError).toHaveBeenCalledWith(
    'nickname',
    expect.objectContaining({ type: 'server', message: '이미 사용 중인 닉네임입니다.' }),
  );
  expect(h.back).not.toHaveBeenCalled();
});

it('연속 제출을 한 번만 저장하고 실패 후 잠금을 해제한다', async () => {
  let reject!: (error: Error) => void;
  h.save.mockImplementationOnce(
    () =>
      new Promise((_, fail) => {
        reject = fail;
      }),
  );
  const submit = form(render(EditBasicInfoPage));
  const pending = submit(values);
  await submit(values);
  expect(h.save).toHaveBeenCalledTimes(1);
  expect(render(EditBasicInfoPage).find((node) => node.type === 'fieldset')!.props.disabled).toBe(
    true,
  );
  reject(failure);
  await pending;
  await form(render(EditBasicInfoPage))(values);
  expect(h.save).toHaveBeenCalledTimes(2);
  expect(h.back).toHaveBeenCalledTimes(1);
});

it('최종 작가 프로필 실패 후 인증 단계와 활동 분야를 유지해 재시도한다', async () => {
  let tree = render(ArtistVerificationPage, false);
  (
    tree.find((node) => 'selectedFields' in node.props)!.props.onChange as (
      fields: string[],
    ) => void
  )(['PAINTING']);
  h.save.mockRejectedValueOnce(failure);
  await form(render(ArtistVerificationPage, false))(values);
  tree = render(ArtistVerificationPage, false);
  expect(tree.find((node) => node.props.confirmed === true)).toBeDefined();
  expect(tree.find((node) => 'selectedFields' in node.props)!.props.selectedFields).toEqual([
    'PAINTING',
  ]);
  expect(tree.find((node) => node.props.role === 'alert')!.props.children).toContain('서버');
  await form(tree)(values);
  expect(render(ArtistVerificationPage, false).some((node) => 'onDone' in node.props)).toBe(true);
});

describe.each([
  ['기본 정보 수정', EditBasicInfoPage, 'EditBasicInfoForm'],
  ['작가 프로필 수정', EditArtistProfilePage, 'EditArtistProfileForm'],
])('%s: 받아 둔 예전 값으로 폼을 채우지 않는다', (_, page, formName) => {
  const root = () => {
    h.si = 0;
    h.ri = 0;
    return page() as Element;
  };
  const rootName = () => {
    const { type } = root();
    return typeof type === 'function' ? type.name : type;
  };
  const tree = () => nodes(root());

  it('이 화면에서 새로 받기 전에는 받아 둔 값이 있어도 폼 대신 스켈레톤을 그린다', () => {
    h.fresh = false;
    expect(rootName()).not.toBe(formName);
    expect(root().type).not.toBe(ErrorView);
    expect(tree().some((node) => node.props['aria-hidden'] === 'true')).toBe(true);
  });

  it('새로 받은 뒤에만 폼을 그린다', () => {
    expect(rootName()).toBe(formName);
  });

  it('새로 받기에 실패하면 받아 둔 값으로 폼을 그리지 않고 다시 시도를 안내한다', () => {
    h.fresh = false;
    h.queryError = true;
    expect(root().type).toBe(ErrorView);
  });

  it('폼을 그린 뒤 다시 받기만 실패하면 입력 중인 폼을 유지한다', () => {
    h.queryError = true;
    expect(rootName()).toBe(formName);
  });
});
