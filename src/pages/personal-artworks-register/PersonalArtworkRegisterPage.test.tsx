import { renderToStaticMarkup } from 'react-dom/server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ArtworkImageUrls, ArtworkRegisterValues } from '@/components/artwork-register';

import { PersonalArtworkRegisterPage } from './PersonalArtworkRegisterPage';

type FormProps = {
  mode: 'create' | 'edit';
  leaveFallback: string;
  authorSection?: unknown;
  onSubmit: (values: ArtworkRegisterValues, images: ArtworkImageUrls) => void;
};

const h = vi.hoisted(() => ({
  params: {} as Record<string, string>,
  user: { id: 1, nickname: '디유', isVerified: true } as
    | { id: number; nickname: string; isVerified: boolean }
    | undefined,
  artwork: {
    data: undefined as unknown,
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  },
  canEdit: true,
  create: { mutate: vi.fn(), isPending: false },
  update: { mutate: vi.fn(), isPending: false },
  formProps: null as FormProps | null,
  navigate: vi.fn(),
  leave: vi.fn(),
  toast: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <i data-navigate={to} />,
  useNavigate: () => h.navigate,
  useParams: () => h.params,
}));
vi.mock('@/components/artwork-register', async () => ({
  ...(await vi.importActual<typeof import('@/components/artwork-register/artworkRequest')>(
    '@/components/artwork-register/artworkRequest',
  )),
  ...(await vi.importActual<typeof import('@/components/artwork-register/artworkRegister.schema')>(
    '@/components/artwork-register/artworkRegister.schema',
  )),
  ArtworkRegisterForm: (props: FormProps) => {
    h.formProps = props;
    return <form data-mode={props.mode} data-leave={props.leaveFallback} />;
  },
  ArtworkRegisterDone: () => <section>done</section>,
  ArtworkRegisterSkeleton: () => <p>skeleton</p>,
  useLeaveArtworkRegister: () => h.leave,
}));
vi.mock('@/components/common', () => ({ ErrorView: () => <p>error</p> }));
vi.mock('@/hooks/queries/usePersonalArtwork', () => ({
  usePersonalArtwork: () => h.artwork,
  useCreatePersonalArtwork: () => h.create,
  useUpdatePersonalArtwork: () => h.update,
}));
vi.mock('@/hooks/queries/useUserProfile', () => ({
  useUserMe: () => ({ data: h.user }),
  useIsUserMePending: () => false,
}));
vi.mock('@/hooks/usePolicy', () => ({
  usePersonalArtworkPolicy: () => ({ edit: () => h.canEdit }),
}));
vi.mock('@/stores/toastStore', () => ({ toast: h.toast }));

const values: ArtworkRegisterValues = {
  title: ' 혼자 만든 정원 ',
  intro: '',
  fieldLabels: ['회화'],
  year: '2026',
  material: '캔버스에 유채',
  size: '',
};
const images: ArtworkImageUrls = { artworkUrls: ['a.jpg'], processUrls: ['p.jpg'] };
const previous = {
  personalArtworkId: 5,
  userId: 1,
  artworkName: '이전 작품',
  content: '',
  type: 'PAINTING',
  productionYear: 2025,
  materialMedia: '유채',
  size: '',
  point: '감상 포인트',
  createdAt: '2026-01-01',
  images: [],
};

const render = () => renderToStaticMarkup(<PersonalArtworkRegisterPage />);

beforeEach(() => {
  vi.clearAllMocks();
  h.params = {};
  h.user = { id: 1, nickname: '디유', isVerified: true };
  h.artwork.data = undefined;
  h.artwork.isPending = false;
  h.canEdit = true;
  h.formProps = null;
});

describe('개인 작품 등록', () => {
  it('작가 영역 없이 등록 폼을 열고, 기록이 없으면 내 작가 프로필로 나간다', () => {
    const html = render();

    expect(html).toContain('data-mode="create"');
    expect(html).toContain('data-leave="/artist/1"');
    expect(h.formProps?.authorSection).toBeUndefined();
  });

  it('사용자 정보가 없으면 마이로 나간다', () => {
    h.user = undefined;

    expect(render()).toContain('data-leave="/my"');
  });

  it('등록하면 작가 · 공동 작가 없이 작품 정보만 보낸다', () => {
    render();
    h.formProps!.onSubmit(values, images);

    const body = h.create.mutate.mock.calls[0][0];
    expect(body).toMatchObject({ artworkName: '혼자 만든 정원', types: ['PAINTING'] });
    expect(body).not.toHaveProperty('artistName');
    expect(body).not.toHaveProperty('coAuthors');
  });
});

describe('개인 작품 수정', () => {
  beforeEach(() => {
    h.params = { personalArtworkId: '5' };
    h.artwork.data = previous;
  });

  it('불러오는 중이면 스켈레톤을 보여준다', () => {
    h.artwork.isPending = true;

    expect(render()).toContain('skeleton');
  });

  it('본인 작품이 아니면 403 으로 보낸다', () => {
    h.canEdit = false;

    expect(render()).toContain('data-navigate="/403"');
  });

  it('수정 완료하면 감상 포인트를 지키고, 토스트 후 들어온 화면(없으면 작품 상세)으로 돌아간다', () => {
    const html = render();
    expect(html).toContain('data-mode="edit"');
    expect(html).toContain('data-leave="/personal-artworks/5"');

    h.formProps!.onSubmit(values, images);
    const [{ personalArtworkId, body }, { onSuccess }] = h.update.mutate.mock.calls[0];
    expect(personalArtworkId).toBe(5);
    expect(body.point).toBe('감상 포인트');

    onSuccess();
    expect(h.toast).toHaveBeenCalledWith('작품을 수정했어요');
    expect(h.leave).toHaveBeenCalledWith('/personal-artworks/5');
  });
});
