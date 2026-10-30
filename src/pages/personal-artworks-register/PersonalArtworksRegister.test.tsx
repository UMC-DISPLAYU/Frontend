import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import type { createFormControl, UseFormProps } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PersonalArtworkResponseDataDto } from '@/api/dto';
import type { ImageUploadItem } from '@/hooks/useImageUpload';

import { PersonalArtworksRegister } from './PersonalArtworksRegister';
import type { PersonalArtworkRegisterFormValues } from './personalArtworksRegister.schema';

function createUpload() {
  let images: ImageUploadItem[] = [];
  return {
    get images() {
      return images;
    },
    setUploadedImages: vi.fn((urls: string[]) => {
      images = urls.map((url) => ({ id: url, previewUrl: url, uploadedUrl: url }));
    }),
    addImages: (files: File[]) => {
      images.push(...files.map((file) => ({ id: file.name, previewUrl: file.name, file })));
    },
    removeImage: (id: string) => {
      images = images.filter((image) => image.id !== id);
    },
    uploadImages: vi.fn(async () => images.map((image) => image.uploadedUrl ?? image.file!.name)),
  };
}

const mocks = vi.hoisted(() => ({
  form: null as ReturnType<typeof createFormControl<PersonalArtworkRegisterFormValues>> | null,
  refs: [] as { current: unknown }[],
  refIndex: 0,
  uploadIndex: 0,
  uploads: [] as ReturnType<typeof createUpload>[],
  artwork: undefined as PersonalArtworkResponseDataDto | undefined,
  isFetching: false,
  isFetchedAfterMount: true,
  id: 1,
  allowed: true,
  setError: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: (value: unknown) => [value, mocks.setError],
  useRef: (current: unknown) => (mocks.refs[mocks.refIndex++] ??= { current }),
  useEffect: (effect: () => void) => effect(),
}));

vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hook-form')>();
  return {
    ...actual,
    useForm: (options: UseFormProps<PersonalArtworkRegisterFormValues>) => {
      if (!mocks.form) {
        mocks.form = actual.createFormControl<PersonalArtworkRegisterFormValues>(options);
        mocks.form.subscribe({ formState: { isValid: true }, callback: () => {} });
      }
      return { ...mocks.form, formState: mocks.form.control._formState };
    },
    useWatch: ({ name }: { name: (keyof PersonalArtworkRegisterFormValues)[] }) =>
      mocks.form!.getValues(name),
  };
});

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
  useSearchParams: () => [new URLSearchParams({ id: String(mocks.id) })],
}));
vi.mock('@/components/common', () => ({
  BottomFixedBar: 'BottomFixedBar',
  ImageUploader: 'ImageUploader',
  LoadingView: 'LoadingView',
}));
vi.mock('@/components/ui', () => ({
  ChipGroup: 'ChipGroup',
  ExhibitionHeader: 'ExhibitionHeader',
  RequiredLabel: 'RequiredLabel',
}));
vi.mock('@/hooks/useImageUpload', () => ({
  useImageUpload: () => mocks.uploads[mocks.uploadIndex++],
}));
vi.mock('@/hooks/usePolicy', () => ({
  usePersonalArtworkPolicy: () => ({ create: () => mocks.allowed, edit: () => mocks.allowed }),
}));
vi.mock('@/hooks/queries/usePersonalArtwork', () => ({
  usePersonalArtwork: () => ({
    data: mocks.artwork,
    isFetching: mocks.isFetching,
    isFetchedAfterMount: mocks.isFetchedAfterMount,
  }),
  useCreatePersonalArtwork: () => ({ mutateAsync: mocks.create }),
  useUpdatePersonalArtwork: () => ({ mutateAsync: mocks.update }),
}));

function elements(node: ReactNode): ReactElement[] {
  return Children.toArray(node).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child)
      ? [child, ...elements(child.props.children)]
      : [],
  );
}

function renderForm() {
  mocks.refIndex = 0;
  mocks.uploadIndex = 0;
  const page = PersonalArtworksRegister();
  return elements(page.type(page.props));
}

const submit = () =>
  renderForm()
    .find((element) => element.type === 'button')!
    .props.onClick();

beforeEach(() => {
  vi.clearAllMocks();
  mocks.form = null;
  mocks.refs = [];
  mocks.id = 1;
  mocks.allowed = true;
  mocks.isFetching = false;
  mocks.isFetchedAfterMount = true;
  mocks.uploads = [createUpload(), createUpload()];
  mocks.artwork = {
    personalArtworkId: 1,
    userId: 1,
    artworkName: '기존 작품',
    type: 'PAINTING',
    productionYear: 2026,
    materialMedia: '캔버스',
    createdAt: '',
    images: [
      { imageUrl: 'second', imageType: 'ARTWORK', sortOrder: 2 },
      { imageUrl: 'process', imageType: 'WORK_PROCESS', sortOrder: 1 },
      { imageUrl: 'first', imageType: 'ARTWORK', sortOrder: 1 },
    ].map((image, imageId) => ({
      ...image,
      imageId,
      isThumbnail: image.imageUrl === 'first',
      caption: '',
      width: 800,
      height: 600,
    })),
  };
});

describe('개인 작품 폼', () => {
  it('캐시 갱신 중에는 입력을 기다리고 최초 GET의 최신 값을 복원한다', () => {
    mocks.isFetching = true;
    mocks.isFetchedAfterMount = false;
    expect(renderForm().some((element) => element.type === 'input')).toBe(false);
    expect(mocks.uploads[0].setUploadedImages).not.toHaveBeenCalled();
    expect(mocks.form!.getValues('title')).toBe('');

    mocks.isFetching = false;
    mocks.isFetchedAfterMount = true;
    mocks.artwork = { ...mocks.artwork!, artworkName: '서버의 최신 작품' };
    renderForm();
    expect(mocks.form!.getValues('title')).toBe('서버의 최신 작품');
    mocks.form!.setValue('title', '작성 중');
    mocks.isFetching = true;
    expect(renderForm().some((element) => element.type === 'input')).toBe(true);
    mocks.isFetching = false;
    mocks.artwork = { ...mocks.artwork!, artworkName: '후속 재조회' };
    renderForm();
    expect(mocks.form!.getValues('title')).toBe('작성 중');
    expect(mocks.uploads[0].setUploadedImages).toHaveBeenCalledOnce();
  });

  it('수정 값을 한 번 복원하고 같은 작품 재조회에서 입력과 이미지 변경을 유지한다', () => {
    renderForm();
    expect(mocks.form!.getValues()).toMatchObject({
      title: '기존 작품',
      year: '2026',
      field: '회화',
    });
    expect(mocks.uploads[0].images.map((image) => image.id)).toEqual(['first', 'second']);
    mocks.form!.setValue('title', '수정 중');
    mocks.uploads[0].removeImage('first');
    mocks.artwork = { ...mocks.artwork!, artworkName: '재조회된 제목' };
    renderForm();
    expect(mocks.form!.getValues()).toMatchObject({ title: '수정 중', artworkImageCount: 1 });
    expect(mocks.uploads[0].setUploadedImages).toHaveBeenCalledOnce();
    expect(mocks.uploads[0].images.map((image) => image.id)).toEqual(['second']);
    mocks.id = 2;
    expect(PersonalArtworksRegister().key).toBe('2');
  });

  it('RHF의 최신 입력과 기존·신규 이미지 순서로 수정 요청을 보낸다', async () => {
    renderForm();
    mocks.form!.setValue('title', ' 새 제목 ');
    mocks.form!.setValue('intro', ' 설명 ');
    mocks.form!.setValue('size', ' 90 × 120 ');
    mocks.form!.setValue('thoughts', ' 감상 ');
    mocks.uploads[0].removeImage('first');
    mocks.uploads[0].addImages([{ name: 'new-photo' } as File]);
    await submit();
    expect(mocks.update).toHaveBeenCalledWith({
      personalArtworkId: 1,
      body: expect.objectContaining({
        artworkName: '새 제목',
        content: '설명',
        size: '90 × 120',
        point: '감상',
        productionYear: 2026,
        images: [
          expect.objectContaining({
            imageUrl: 'second',
            imageType: 'ARTWORK',
            sortOrder: 1,
            isThumbnail: true,
          }),
          expect.objectContaining({
            imageUrl: 'new-photo',
            imageType: 'ARTWORK',
            sortOrder: 2,
            isThumbnail: false,
          }),
          expect.objectContaining({
            imageUrl: 'process',
            imageType: 'WORK_PROCESS',
            sortOrder: 1,
            isThumbnail: false,
          }),
        ],
      }),
    });
    expect(mocks.navigate).toHaveBeenCalledWith('/personal-artworks/1', { replace: true });
  });

  it('이미지 삭제와 잘못된 연도를 검증하고 권한이 없으면 제출하지 않는다', async () => {
    renderForm();
    mocks.uploads[0].removeImage('first');
    mocks.uploads[0].removeImage('second');
    await submit();
    expect(mocks.update).not.toHaveBeenCalled();
    mocks.uploads[0].addImages([{ name: 'new-photo' } as File]);
    const year = renderForm().find((element) => element.props.id === 'artwork-year')!;
    const target = { name: 'year', value: '20a2' };
    year.props.onChange({ target, type: 'change' });
    expect(target.value).toBe('202');
    await submit();
    expect(mocks.update).not.toHaveBeenCalled();
    mocks.form!.setValue('year', '2026');
    mocks.allowed = false;
    await submit();
    expect(mocks.uploads[0].uploadImages).not.toHaveBeenCalled();
  });

  it('업로드와 등록 실패 후 입력을 보존해 재시도할 수 있다', async () => {
    mocks.id = 0;
    mocks.artwork = undefined;
    renderForm();
    mocks.form!.setValue('title', '새 작품');
    mocks.form!.setValue('year', '2026');
    mocks.form!.setValue('material', '캔버스');
    mocks.uploads[0].addImages([{ name: 'new-photo' } as File]);
    mocks.uploads[0].uploadImages.mockRejectedValueOnce(new Error('upload failed'));
    await submit();
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.setError).toHaveBeenLastCalledWith(
      '이미지 업로드에 실패했어요. 잠시 후 다시 시도해주세요.',
    );
    mocks.create.mockRejectedValueOnce(new Error('create failed'));
    await submit();
    expect(mocks.form!.getValues('title')).toBe('새 작품');
    expect(mocks.uploads[0].images).toHaveLength(1);
    expect(mocks.navigate).not.toHaveBeenCalled();
    await submit();
    expect(mocks.create).toHaveBeenCalledTimes(2);
    expect(mocks.navigate).toHaveBeenCalledWith('/personal-artworks/complete', {
      state: { type: 'personalArtwork' },
    });
  });

  it('연속 클릭에도 업로드와 수정 요청은 한 번만 실행한다', async () => {
    renderForm();
    await Promise.all([submit(), submit()]);
    expect(mocks.uploads[0].uploadImages).toHaveBeenCalledOnce();
    expect(mocks.update).toHaveBeenCalledOnce();
  });
});
