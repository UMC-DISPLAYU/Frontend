import { useEffect, useMemo, useState } from 'react';

import { Check, ChevronLeft, Info, Plus, UserRound, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { BottomButtonBar, ImageUploader } from '@/components/common';
import { useHideFooter } from '@/components/layout';
import { ChipGroup } from '@/components/ui';
import {
  ARTWORK_FIELD_MAP,
  DEFAULT_ARTWORK_IMAGE_HEIGHT,
  DEFAULT_ARTWORK_IMAGE_WIDTH,
} from '@/constants';
import { MAX_ARTWORK_PROGRESS_IMAGES, MAX_ARTWORK_UPLOAD_IMAGES } from '@/constants/exhibition';
import { useCreateDisplayArtwork, useDisplayArtworks } from '@/hooks/queries/useDisplayArtworks';
import { useDisplayMembers } from '@/hooks/queries/useDisplayMembers';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/utils/cn';
import { toProductionYear } from '@/utils/date';

type RegisterStep = 'choice' | 'proxyTeamAuthor' | 'proxyAuthor' | 'basic' | 'participants';
type RegisterMode = 'own' | 'proxy';
type ProxyAuthorSource = 'team' | 'direct';
type RegisterSheet =
  'proxyAuthorMethod' | 'collaboratorMethod' | 'collaboratorTeam' | 'collaboratorDirect' | null;

const DEFAULT_EXHIBITION = {
  title: '형태의 침묵',
  org: '중앙대학교 디자인학부',
  period: '05.28 - 06.05',
  place: '중앙대학교 310관 갤러리',
  thumbnail: 'https://placehold.co/130x162',
};

const REPRESENTATIVE = { id: 'owner', name: '최유성', account: 'quietroom' };
const DIRECT_INPUT_ACCOUNT = '직접입력';

function ArtworkRegisterHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="flex items-center gap-3 px-5 pt-14.5 pb-3">
      <button type="button" onClick={onBack} aria-label="뒤로가기" className="-ml-1">
        <ChevronLeft className="size-7 text-main" strokeWidth={2} />
      </button>
      <h1 className="typo-body-xl-bold text-main">{title}</h1>
    </header>
  );
}

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="flex items-center gap-1">
      <span className="typo-body-sm-bold text-main">{children}</span>
      {required && <span className="typo-body-xs-regular text-red-400">*</span>}
    </label>
  );
}

function UnderlineInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="typo-body-xs-regular w-full border-b border-line bg-transparent px-3 py-2.5 text-main outline-none placeholder:text-faint"
    />
  );
}

function UnderlineTextarea({
  value,
  onChange,
  placeholder,
  maxLength = 1500,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
}) {
  return (
    <div className="flex flex-col border-b border-line px-3 py-2.5">
      <textarea
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="typo-body-xs-regular min-h-[92px] resize-none bg-transparent text-main outline-none placeholder:text-faint"
      />
      <span className="typo-body-xxs-regular text-right text-faint">
        {value.length}/{maxLength}
      </span>
    </div>
  );
}

function ChoiceCard({
  title,
  description,
  helper,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  helper?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-xl bg-card px-4 py-3.5 text-left shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]',
        selected && 'outline outline-1 outline-line-active',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="typo-body-md-bold text-main">{title}</p>
          <p className="typo-body-xs-regular mt-2.5 text-sub700">{description}</p>
          {helper && <div className="typo-body-sm-regular mt-4">{helper}</div>}
        </div>
        {selected && <Check className="size-5 shrink-0 text-line-active" strokeWidth={2} />}
      </div>
    </button>
  );
}

function SheetOption({
  title,
  description,
  helper,
  onClick,
  disabled = false,
}: {
  title: string;
  description: string;
  helper: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full rounded-xl border border-line bg-card px-4 py-3.5 text-left shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      <p className="typo-body-md-bold text-main">{title}</p>
      <p className="typo-body-xs-regular mt-2.5 text-main">{description}</p>
      <p className="typo-body-xs-regular mt-1 text-faint">{helper}</p>
    </button>
  );
}

function RegisterActionSheet({
  open,
  title,
  subtitle,
  onClose,
  children,
  bodyClassName = 'mt-7 flex flex-col gap-3',
}: {
  open: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
  bodyClassName?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-96 items-end bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="h-[402px] w-full rounded-t-xl bg-card px-5 pt-6 pb-11 shadow-[0px_-8px_30px_0px_rgba(4,0,250,0.10)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="typo-body-xl-bold text-main">{title}</h2>
            <p className="typo-body-xs-regular mt-1 text-faint">{subtitle}</p>
          </div>
          <button type="button" aria-label="닫기" onClick={onClose} className="-mr-1 p-1">
            <X className="size-6 text-main" strokeWidth={1.5} />
          </button>
        </div>
        <div className={bodyClassName}>{children}</div>
      </div>
    </div>
  );
}

function DirectCollaboratorSheet({
  open,
  value,
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  if (!open) return null;

  const isValid = value.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-96 items-end bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="공동 작업자 이름 입력"
        className="flex h-[402px] w-full flex-col rounded-t-xl bg-card px-5 pt-6 pb-11 shadow-[0px_-8px_30px_0px_rgba(4,0,250,0.10)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="typo-body-xl-bold text-main">공동 작업자 이름 입력</h2>
            <p className="typo-body-xs-regular mt-1 text-faint">
              팀원이 아니거나 비회원인 공동 작업자는 이름만 표시돼요.
            </p>
          </div>
          <button type="button" aria-label="닫기" onClick={onClose} className="-mr-1 p-1">
            <X className="size-6 text-main" strokeWidth={1.5} />
          </button>
        </div>

        <section className="mt-8 flex flex-col gap-1">
          <label className="flex items-center gap-1">
            <span className="typo-body-sm-regular text-main">공동 작업자 이름</span>
            <span className="typo-body-xs-regular text-error">*</span>
          </label>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="typo-body-xs-regular mt-3 h-9 rounded-lg border border-line bg-card px-3 text-main outline-none focus:border-line-active"
          />
          <p className="typo-body-xs-regular text-faint">
            직접 입력한 이름은 프로필과 연결되지 않아요.
          </p>
        </section>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!isValid}
          className={cn(
            'typo-body-sm-bold mt-auto h-11 w-full rounded-xl',
            isValid ? 'bg-dark text-white' : 'bg-bt-gray text-faint',
          )}
        >
          추가하기
        </button>
      </div>
    </div>
  );
}

function AuthorSelectCard({
  name,
  account,
  verified,
  selected,
  onClick,
  isMember = true,
}: {
  name: string;
  account: string;
  verified: boolean;
  selected: boolean;
  onClick: () => void;
  /* 직접 이름으로 등록된 작가는 계정이 없어 작가로 연결할 수 없습니다. */
  isMember?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!verified}
      className={cn(
        'flex h-[88px] w-full items-center gap-3 rounded-[20px] px-3 py-5 text-left shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]',
        verified ? 'bg-card' : 'bg-bt-gray',
        selected && 'border border-line-active',
      )}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-box100">
        <UserRound className="size-6 text-line" strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="typo-body-sm-bold truncate text-main">{name}</p>
        <p className="typo-body-xs-regular mt-2 truncate text-faint">
          {verified
            ? account
            : isMember
              ? '작가 인증 후 선택할 수 있어요.'
              : '직접 입력한 작가는 선택할 수 없어요.'}
        </p>
      </div>
      {verified && (
        <span className="typo-body-xs-regular shrink-0 rounded bg-blue-100 px-2.5 py-1 text-link">
          작가인증
        </span>
      )}
    </button>
  );
}

function CollaboratorTeamCard({
  name,
  account,
  verified,
  onClick,
}: {
  name: string;
  account: string;
  verified: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!verified}
      className={cn(
        'flex h-[88px] w-full items-center gap-3 rounded-[20px] px-3 py-5 text-left shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]',
        verified ? 'border border-line bg-card' : 'bg-bt-gray',
      )}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-box100">
        <UserRound className="size-6 text-line" strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="typo-body-sm-bold truncate text-main">{name}</p>
        <p className="typo-body-xs-regular mt-2 truncate text-faint">
          {verified ? account : '작가 인증 후 선택할 수 있어요.'}
        </p>
      </div>
      {verified && (
        <span className="typo-body-xs-regular shrink-0 rounded bg-blue-100 px-2.5 py-1 text-link">
          작가인증
        </span>
      )}
    </button>
  );
}

function PersonCard({
  name,
  account,
  tag,
  selected = false,
  removable = false,
  onClick,
  onRemove,
}: {
  name: string;
  account: string;
  tag?: string;
  selected?: boolean;
  removable?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}) {
  const content = (
    <>
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-box100">
        <UserRound className="size-6 text-line" strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="typo-body-sm-bold truncate text-main">{name}</p>
        <p className="typo-body-xs-regular mt-2 truncate text-faint">{account}</p>
      </div>
      {tag && (
        <span className="typo-body-xs-regular shrink-0 rounded bg-blue-100 px-2.5 py-1 text-link">
          {tag}
        </span>
      )}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${name} 제거`}
          className="grid size-7 place-items-center"
        >
          <X className="size-4 text-main" strokeWidth={1.7} />
        </button>
      )}
    </>
  );

  const className = cn(
    'flex h-[88px] w-full items-center gap-3 rounded-[20px] bg-card px-3 py-5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]',
    selected && 'border border-line-active',
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(className, 'text-left')}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}

function ExhibitionSummaryCard() {
  return (
    <div className="flex h-32 gap-3 overflow-hidden rounded-[18px] bg-box100 px-4 py-3.5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04),inset_1px_1px_4px_0px_rgba(1,8,21,0.2),inset_-2px_-2px_2px_0px_rgba(255,255,255,0.9)]">
      <div className="h-[101px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-box">
        <img
          src={DEFAULT_EXHIBITION.thumbnail}
          alt="전시 포스터"
          className="size-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="typo-body-md-bold truncate text-main">{DEFAULT_EXHIBITION.title}</h2>
        <div className="mt-2.5 flex flex-col">
          <span className="typo-body-xs-regular text-sub700">{DEFAULT_EXHIBITION.org}</span>
          <span className="typo-body-xs-regular text-hint">{DEFAULT_EXHIBITION.period}</span>
        </div>
        <p className="typo-body-xxs-regular mt-4 truncate text-faint">{DEFAULT_EXHIBITION.place}</p>
      </div>
    </div>
  );
}

function InfoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded-xl bg-box100 px-4 py-4">
      <Info className="mt-0.5 size-4 shrink-0 text-faint" strokeWidth={1.6} />
      <p className="typo-body-xs-regular text-hint">{children}</p>
    </div>
  );
}

export function ArtworkRegisterPage() {
  useHideFooter();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const displayId = Number(searchParams.get('displayId') ?? 0);

  /* 작품 이미지와 작업과정 이미지를 각각 따로 모아 등록 시 순서대로 업로드합니다. */
  const artworkUpload = useImageUpload({ domain: 'artwork', maxImages: MAX_ARTWORK_UPLOAD_IMAGES });
  const processUpload = useImageUpload({
    domain: 'artwork',
    maxImages: MAX_ARTWORK_PROGRESS_IMAGES,
  });
  const createArtwork = useCreateDisplayArtwork(displayId);
  const isSubmitting =
    artworkUpload.isUploading || processUpload.isUploading || createArtwork.isPending;

  const [step, setStep] = useState<RegisterStep>('choice');
  const [registerMode, setRegisterMode] = useState<RegisterMode>('own');
  const [activeSheet, setActiveSheet] = useState<RegisterSheet>(null);
  const [selectedProxyAuthorId, setSelectedProxyAuthorId] = useState<string | null>(null);
  const [proxyAuthorName, setProxyAuthorName] = useState('');
  const [proxyAuthorSource, setProxyAuthorSource] = useState<ProxyAuthorSource>('direct');
  const [directCollaboratorName, setDirectCollaboratorName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [field, setField] = useState<string>('회화');
  const [year, setYear] = useState('2026.09.22');
  const [medium, setMedium] = useState('아크릴, 캔버스');
  const [size, setSize] = useState('90 × 120 cm');
  const [point, setPoint] = useState('');
  /* userId가 있으면 디유 계정이 연결된 팀원, 없으면 직접 이름을 입력한 작가입니다. */
  const [collaborators, setCollaborators] = useState<
    { id: string; name: string; account: string; userId?: number }[]
  >([]);
  const [qnaAssigneeIds, setQnaAssigneeIds] = useState<string[]>([REPRESENTATIVE.id]);

  /*
   * 전시 팀원 목록. 초대를 수락한 팀원만 작가로 지정할 수 있습니다.
   * 스웨거 TeamMemberResponse에는 작가 인증 여부가 없어 초대 수락 여부로 대신 판정합니다.
   */
  const { data: userMe } = useUserMe();
  const { data: memberList } = useDisplayMembers(displayId);
  const { data: artworkList } = useDisplayArtworks(displayId);

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

  const selectedProxyAuthor = teamAuthorOptions.find(
    (author) => author.id === selectedProxyAuthorId,
  );

  /*
   * 전시작에는 계정 닉네임이 아니라 이 전시에서 쓰는 작가명(displayNickname)을 표시합니다.
   * 팀원 목록에 내가 없을 때만 계정 정보로 대신합니다.
   */
  const myDisplayNickname = useMemo(
    () =>
      (memberList?.members ?? []).find((member) => member.userId === userMe?.id)?.displayNickname,
    [memberList, userMe?.id],
  );

  const displayAuthor = useMemo(() => {
    /* 본인 등록은 로그인 사용자를, 팀원 선택은 해당 팀원의 계정을 작가로 연결합니다. */
    if (registerMode === 'own') {
      return {
        ...REPRESENTATIVE,
        name: myDisplayNickname || userMe?.nickname || userMe?.name || REPRESENTATIVE.name,
        account: userMe?.nickname || REPRESENTATIVE.account,
        userId: userMe?.id,
        tag: '작가인증',
      };
    }
    if (proxyAuthorSource === 'team' && selectedProxyAuthor) {
      return {
        id: selectedProxyAuthor.id,
        name: selectedProxyAuthor.name,
        account: selectedProxyAuthor.account,
        userId: selectedProxyAuthor.userId,
        tag: '작가인증',
      };
    }

    /* 직접 입력한 작가는 계정이 없어 이름만 전송합니다. */
    return {
      id: 'proxy-author-direct',
      name: proxyAuthorName,
      account: DIRECT_INPUT_ACCOUNT,
      userId: undefined as number | undefined,
      tag: '대리 등록',
    };
  }, [
    myDisplayNickname,
    proxyAuthorName,
    proxyAuthorSource,
    registerMode,
    selectedProxyAuthor,
    userMe,
  ]);

  /*
   * 공동 작업자에서는 작품 작가만 뺍니다.
   * 본인 등록이면 내가 작가라 목록에 안 뜨고,
   * 대리 등록이면 나도 함께 작업한 팀원일 수 있어 그대로 남습니다.
   */
  const collaboratorOptions = useMemo(
    () =>
      teamAuthorOptions.filter(
        (author) =>
          author.id !== displayAuthor.id &&
          (author.userId === undefined || author.userId !== displayAuthor.userId),
      ),
    [teamAuthorOptions, displayAuthor],
  );

  const qnaAssigneeOptions = useMemo(() => {
    /* 직접 입력한 작가는 연결할 계정이 없어 Q&A 담당자로 지정할 수 없습니다. */
    const hasAccount = (person: { userId?: number }) => person.userId !== undefined;

    const options: { id: string; name: string; account: string; userId?: number }[] = hasAccount(
      displayAuthor,
    )
      ? [
          {
            id: displayAuthor.id,
            name: displayAuthor.name,
            account: displayAuthor.account,
            userId: displayAuthor.userId,
          },
        ]
      : [];
    const addOption = (person: { id: string; name: string; account: string; userId?: number }) => {
      /* 같은 계정이 작가와 공동 작업자로 겹칠 수 있어 userId까지 확인합니다. */
      if (options.some((option) => option.id === person.id || option.userId === person.userId)) {
        return;
      }
      options.push(person);
    };

    collaborators.filter(hasAccount).forEach((person) => {
      addOption(person);
    });

    return options;
  }, [collaborators, displayAuthor]);
  const selectedQnaAssigneeIds = qnaAssigneeIds.filter((id) =>
    qnaAssigneeOptions.some((person) => person.id === id),
  );
  /* 담당자는 자동으로 정하지 않고 사용자가 직접 고르게 둡니다. */
  const effectiveQnaAssigneeIds = selectedQnaAssigneeIds;

  useEffect(() => {
    if (!activeSheet) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveSheet(null);
    };

    window.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [activeSheet]);

  const handleBack = () => {
    if (activeSheet) {
      setActiveSheet(null);
      return;
    }
    if (step === 'participants') {
      setStep('basic');
      return;
    }
    if (step === 'basic') {
      setStep(
        registerMode === 'proxy'
          ? proxyAuthorSource === 'team'
            ? 'proxyTeamAuthor'
            : 'proxyAuthor'
          : 'choice',
      );
      return;
    }
    if (step === 'proxyTeamAuthor') {
      setStep('choice');
      return;
    }
    if (step === 'proxyAuthor') {
      setStep('choice');
      return;
    }
    navigate(-1);
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  /* 이미지를 업로드한 뒤 작품을 등록합니다. */
  const handleSubmit = async () => {
    if (isSubmitting) return;

    setSubmitError(null);

    const files = [...artworkUpload.files, ...processUpload.files];

    let imageUrls: string[] = [];
    try {
      imageUrls = await Promise.all(files.map((file) => artworkUpload.uploadImage(file)));
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

    if (qaHandlerUserIds.length === 0) {
      setSubmitError('Q&A 담당자를 선택해주세요.');
      return;
    }

    createArtwork.mutate(
      {
        displayId,
        artworkName: title.trim(),
        content: description.trim(),
        type: ARTWORK_FIELD_MAP[field] ?? ARTWORK_FIELD_MAP['기타'],
        productionYear: toProductionYear(year),
        materialMedia: medium.trim(),
        size: size.trim(),
        point: point.trim(),
        /*
         * 서버가 width/height를 @Positive 원시 int로 받아 0이나 누락은 거절됩니다.
         * 화면에서 실제 크기를 쓰지 않으므로 고정값을 보냅니다.
         */
        images: imageUrls.map((imageUrl, index) => ({
          imageUrl,
          /* 첫 번째 이미지를 대표 이미지로 씁니다. */
          isThumbnail: index === 0,
          imageType: 'ARTWORK',
          width: DEFAULT_ARTWORK_IMAGE_WIDTH,
          height: DEFAULT_ARTWORK_IMAGE_HEIGHT,
          sortOrder: index + 1,
        })),
        artistName: displayAuthor.name.trim(),
        artistUserId,
        /* 계정이 연결된 팀원은 userIds로, 직접 입력한 작가는 rawNames로 보냅니다. */
        coAuthors: {
          userIds: collaborators
            .map((person) => person.userId)
            .filter((userId): userId is number => typeof userId === 'number'),
          rawNames: collaborators
            .filter((person) => typeof person.userId !== 'number')
            .map((person) => person.name),
        },
        qaHandlerUserIds,
      },
      {
        onSuccess: () => navigate(`/artworks-manage?displayId=${displayId}`),
        onError: () => setSubmitError('작품 등록에 실패했어요. 잠시 후 다시 시도해주세요.'),
      },
    );
  };

  const handleChoiceNext = () => {
    if (registerMode === 'proxy') {
      setActiveSheet('proxyAuthorMethod');
      return;
    }

    setStep('basic');
  };

  const selectTeamProxyAuthor = () => {
    setProxyAuthorSource('team');
    setSelectedProxyAuthorId(null);
    setActiveSheet(null);
    setStep('proxyTeamAuthor');
  };

  const selectDirectProxyAuthor = () => {
    setProxyAuthorSource('direct');
    setProxyAuthorName('');
    setActiveSheet(null);
    setStep('proxyAuthor');
  };

  const submitTeamProxyAuthor = () => {
    if (!selectedProxyAuthor?.verified) return;

    setProxyAuthorName(selectedProxyAuthor.name);
    setProxyAuthorSource('team');
    setStep('basic');
  };

  const submitProxyAuthorName = () => {
    const trimmedAuthorName = proxyAuthorName.trim();
    if (!trimmedAuthorName) return;

    setProxyAuthorName(trimmedAuthorName);
    setProxyAuthorSource('direct');
    setStep('basic');
  };

  const openTeamCollaboratorSheet = () => {
    setActiveSheet('collaboratorTeam');
  };

  const openDirectCollaboratorSheet = () => {
    setDirectCollaboratorName('');
    setActiveSheet('collaboratorDirect');
  };

  const toggleQnaAssignee = (id: string) => {
    setQnaAssigneeIds((prev) => {
      const currentIds = prev.filter((personId) =>
        qnaAssigneeOptions.some((person) => person.id === personId),
      );
      const baseIds =
        currentIds.length > 0
          ? currentIds
          : qnaAssigneeOptions[0]?.id
            ? [qnaAssigneeOptions[0].id]
            : [];

      if (baseIds.includes(id)) {
        return baseIds.length === 1 ? baseIds : baseIds.filter((personId) => personId !== id);
      }

      return [...baseIds, id];
    });
  };

  const addTeamCollaborator = (person: (typeof teamAuthorOptions)[number]) => {
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

  const renderChoice = () => (
    <>
      <ArtworkRegisterHeader title="전시작 추가" onBack={handleBack} />
      <main className="flex-1 overflow-y-auto px-5 pt-3 pb-6">
        <section className="mb-5">
          <h2 className="typo-body-md-bold text-main">이 작품은 누구의 작품인가요?</h2>
          <p className="typo-body-xs-regular mt-1 text-hint">
            작품의 작가와 실제 등록자를 구분하기 위해 먼저 등록 방식을 선택해주세요.
          </p>
        </section>
        <div className="flex flex-col gap-3">
          <ChoiceCard
            title="내 작품 등록하기"
            description="내 전시 작가명과 프로필을 기본으로 연결해요."
            helper={<span className="text-link">고상준(sangjun24)</span>}
            selected={registerMode === 'own'}
            onClick={() => setRegisterMode('own')}
          />
          <ChoiceCard
            title="다른 사람 작품 대신 등록하기"
            description="팀원의 작가명을 입력하고, 해당 팀원의 작품을 등록해요."
            helper={
              <span className="text-error">
                팀원의 디유 계정이 존재하지 않아도 대신 등록할 수 있어요.
              </span>
            }
            selected={registerMode === 'proxy'}
            onClick={() => setRegisterMode('proxy')}
          />
        </div>
      </main>
      <BottomButtonBar>
        <button
          type="button"
          onClick={handleChoiceNext}
          className="typo-body-sm-bold h-11 w-full rounded-xl bg-dark text-white"
        >
          다음
        </button>
      </BottomButtonBar>
    </>
  );

  const renderProxyAuthor = () => {
    const isValid = proxyAuthorName.trim().length > 0;

    return (
      <>
        <ArtworkRegisterHeader title="작가명 직접 입력" onBack={handleBack} />
        <main className="flex-1 overflow-y-auto px-5 pt-3 pb-8">
          <section>
            <h2 className="typo-body-md-bold text-main">작품에 표시할 작가명을 입력해주세요</h2>
            <p className="typo-body-xs-regular mt-1 text-hint">
              입력한 이름은 작품 상세에 작가명으로 표시돼요.
            </p>
          </section>

          <section className="mt-7 flex flex-col gap-3">
            <FieldLabel required>작가명</FieldLabel>
            <UnderlineInput
              value={proxyAuthorName}
              onChange={setProxyAuthorName}
              placeholder="고상준"
            />
            <p className="typo-body-xs-regular px-3 text-hint">
              실명 또는 이 전시에서 사용할 작가명을 입력해주세요.
            </p>
          </section>

          <div className="mt-5">
            <InfoNotice>
              직접 입력한 작가는 디유 프로필과 연결되지 않아요. 작품에 대한 Q&amp;A는 실제 등록자인
              대표자가 담당하게 돼요.
            </InfoNotice>
          </div>
        </main>
        <BottomButtonBar>
          <button
            type="button"
            onClick={submitProxyAuthorName}
            disabled={!isValid}
            className={cn(
              'typo-body-sm-bold h-11 w-full rounded-xl',
              isValid ? 'bg-dark text-white' : 'bg-bt-gray text-faint',
            )}
          >
            참여 완료하기
          </button>
        </BottomButtonBar>
      </>
    );
  };

  const renderProxyTeamAuthor = () => {
    const selectedAuthor = teamAuthorOptions.find((author) => author.id === selectedProxyAuthorId);
    const canSubmit = Boolean(selectedAuthor?.verified);

    return (
      <>
        <ArtworkRegisterHeader title="작가 선택" onBack={handleBack} />
        <main className="flex-1 overflow-y-auto px-5 pt-3 pb-8">
          <section>
            <h2 className="typo-body-md-bold text-main">작품의 작가를 선택해주세요</h2>
            <p className="typo-body-xs-regular mt-1 text-hint">
              선택한 팀원의 전시 작가명으로 작품을 등록해요
            </p>
          </section>

          <div className="typo-body-xs-regular mt-4 rounded-[14px] bg-card px-4 py-3 text-hint">
            <p>작가 인증이 완료된 팀원만 선택할 수 있어요.</p>
            <p>인증이 필요한 팀원은 작품 작가로 연결할 수 없어요.</p>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {teamAuthorOptions.map((author) => (
              <AuthorSelectCard
                key={author.id}
                name={author.name}
                account={author.account}
                verified={author.verified}
                isMember={author.isMember}
                selected={selectedProxyAuthorId === author.id}
                onClick={() => setSelectedProxyAuthorId(author.id)}
              />
            ))}
            {teamAuthorOptions.length === 0 && (
              <p className="typo-body-xs-regular py-8 text-center text-faint">
                아직 전시 팀원이 없어요.
              </p>
            )}
          </div>
        </main>
        <BottomButtonBar>
          <button
            type="button"
            onClick={submitTeamProxyAuthor}
            disabled={!canSubmit}
            className={cn(
              'typo-body-sm-bold h-11 w-full rounded-xl',
              canSubmit ? 'bg-dark text-white' : 'bg-bt-gray text-faint',
            )}
          >
            다음
          </button>
        </BottomButtonBar>
      </>
    );
  };

  const renderBasic = () => (
    <>
      <ArtworkRegisterHeader title="전시작 등록" onBack={handleBack} />
      <main className="flex-1 overflow-y-auto px-5 pt-3 pb-8">
        <div className="flex justify-center">
          <ImageUploader
            images={artworkUpload.images}
            maxImages={MAX_ARTWORK_UPLOAD_IMAGES}
            emptyLabel="작품 업로드"
            onAddImages={artworkUpload.addImages}
            onRemoveImage={artworkUpload.removeImage}
          />
        </div>

        <div className="mt-6 flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <FieldLabel required>작품명</FieldLabel>
            <UnderlineInput value={title} onChange={setTitle} placeholder="작품명을 입력해주세요" />
          </section>

          <section className="flex flex-col gap-3">
            <FieldLabel>작품설명</FieldLabel>
            <UnderlineTextarea
              value={description}
              onChange={setDescription}
              placeholder="작품에 대해 소개해주세요"
            />
          </section>

          <section className="flex flex-col gap-3">
            <FieldLabel required>작품분야</FieldLabel>
            <ChipGroup
              options={Object.keys(ARTWORK_FIELD_MAP)}
              selected={[field]}
              onChange={(next) => setField(next[0] ?? field)}
              maxSelect={1}
              aria-label="작품분야"
              className="flex flex-wrap gap-2"
            />
          </section>

          <section className="flex flex-col gap-3">
            <FieldLabel required>제작 연도</FieldLabel>
            <UnderlineInput value={year} onChange={setYear} placeholder="2026.09.22" />
          </section>

          <section className="flex flex-col gap-3">
            <FieldLabel required>재료 / 매체</FieldLabel>
            <UnderlineInput value={medium} onChange={setMedium} placeholder="아크릴, 캔버스" />
          </section>

          <section className="flex flex-col gap-3">
            <FieldLabel>규격</FieldLabel>
            <UnderlineInput value={size} onChange={setSize} placeholder="90 × 120 cm" />
          </section>

          <section className="flex flex-col gap-3">
            <FieldLabel>작품과정</FieldLabel>
            <ImageUploader
              images={processUpload.images}
              maxImages={MAX_ARTWORK_PROGRESS_IMAGES}
              emptyLabel="작업과정 업로드"
              onAddImages={processUpload.addImages}
              onRemoveImage={processUpload.removeImage}
            />
          </section>

          <section className="flex flex-col gap-3">
            <FieldLabel>감상 포인트</FieldLabel>
            <UnderlineTextarea
              value={point}
              onChange={setPoint}
              placeholder="관람자가 작품을 볼 때 참고하면 좋은 내용을 적어주세요"
            />
          </section>
        </div>
      </main>
      <BottomButtonBar>
        <button
          type="button"
          onClick={() => setStep('participants')}
          className="typo-body-sm-bold h-11 w-full rounded-xl bg-dark text-white"
        >
          다음
        </button>
      </BottomButtonBar>
    </>
  );

  const renderParticipants = () => (
    <>
      <ArtworkRegisterHeader title="전시작 등록" onBack={handleBack} />
      <main className="flex-1 overflow-y-auto px-5 pt-3 pb-8">
        <ExhibitionSummaryCard />

        <section className="mt-5">
          <h2 className="typo-body-sm-bold text-main">작가정보</h2>
          <p className="typo-body-xs-regular mt-1 text-hint">
            전시작은 관람자에게 작가명으로 표시돼요.
          </p>
          <div className="mt-3">
            <PersonCard
              name={displayAuthor.name}
              account={displayAuthor.account}
              tag={displayAuthor.tag}
            />
          </div>
        </section>

        <section className="mt-5">
          <h2 className="typo-body-sm-bold text-main">공동 작업자</h2>
          <p className="typo-body-xs-regular mt-1 text-hint">
            함께 작업한 작가가 있다면 추가해주세요.
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {collaborators.map((person) => (
              <PersonCard
                key={person.id}
                name={person.name}
                account={person.account}
                removable
                onRemove={() => {
                  setCollaborators((prev) => prev.filter((item) => item.id !== person.id));
                  setQnaAssigneeIds((prev) => prev.filter((id) => id !== person.id));
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setActiveSheet('collaboratorMethod')}
            className="typo-body-xs-regular mt-5 flex h-[41px] items-center gap-1.5 rounded-[14px] bg-card px-4 text-main shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]"
          >
            <Plus className="size-3.5" strokeWidth={2} />
            공동 작업자 추가
          </button>
        </section>

        <section className="mt-5">
          <h2 className="typo-body-sm-bold text-main">내부 Q&amp;A 담당자</h2>
          <p className="typo-body-xs-regular mt-1 text-hint">
            작품 Q&amp;A에 답변할 담당자를 선택해주세요.
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {qnaAssigneeOptions.map((person) => (
              <PersonCard
                key={person.id}
                name={person.name}
                account={person.account}
                selected={effectiveQnaAssigneeIds.includes(person.id)}
                onClick={() => toggleQnaAssignee(person.id)}
              />
            ))}
            {qnaAssigneeOptions.length === 0 && (
              <p className="typo-body-xs-regular rounded-[14px] bg-card px-4 py-3 text-hint">
                직접 입력한 작가는 Q&amp;A 담당자로 지정할 수 없어요.
              </p>
            )}
          </div>
        </section>
      </main>
      <BottomButtonBar>
        {submitError && (
          <p className="typo-body-xs-regular mb-2 text-center text-error">{submitError}</p>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="typo-body-sm-bold h-11 w-full rounded-xl bg-dark text-white disabled:opacity-40"
        >
          {isSubmitting ? '등록 중' : '완료'}
        </button>
      </BottomButtonBar>
    </>
  );

  const renderActiveSheet = () => (
    <>
      <RegisterActionSheet
        open={activeSheet === 'proxyAuthorMethod'}
        onClose={() => setActiveSheet(null)}
        title="작가 정보를 어떻게 입력할까요?"
        subtitle="대신 등록할 작품의 작가 정보를 선택해주세요."
      >
        <SheetOption
          title="전시 팀원에서 선택"
          description="디유 계정이 있는 팀원의 작가명과 프로필을 불러와요."
          helper="작가 인증 완료 팀원만 선택할 수 있어요."
          onClick={selectTeamProxyAuthor}
        />
        <SheetOption
          title="직접 이름 입력"
          description="디유 계정이 없거나 전시 팀원이 아닌 작가의 이름을 직접 입력해요."
          helper="직접 입력한 작가는 프로필 연결과 Q&A 담당자 지정이 불가능해요."
          onClick={selectDirectProxyAuthor}
        />
      </RegisterActionSheet>

      <RegisterActionSheet
        open={activeSheet === 'collaboratorMethod'}
        onClose={() => setActiveSheet(null)}
        title="공동 작업자 추가"
        subtitle="함께 작업한 작가 정보를 추가해주세요."
      >
        <SheetOption
          title="전시 팀원에서 선택"
          description="디유 계정이 있는 팀원의 작가명과 프로필을 불러와요."
          helper="작가 인증 완료 팀원만 선택할 수 있어요."
          onClick={openTeamCollaboratorSheet}
        />
        <SheetOption
          title="직접 이름 입력"
          description="디유 계정이 없거나 전시 팀원이 아닌 작가의 이름을 직접 입력해요."
          helper="직접 입력한 작가는 프로필 연결과 Q&A 담당자 지정이 불가능해요."
          onClick={openDirectCollaboratorSheet}
        />
      </RegisterActionSheet>

      <RegisterActionSheet
        open={activeSheet === 'collaboratorTeam'}
        onClose={() => setActiveSheet(null)}
        title="전시 팀원에서 선택"
        subtitle="작가 인증이 완료된 팀원만 공동 작업자로 추가할 수 있어요."
        bodyClassName="mt-6 flex flex-col gap-2"
      >
        {collaboratorOptions.length === 0 && (
          <p className="typo-body-xs-regular py-8 text-center text-faint">
            아직 전시 팀원이 없어요.
          </p>
        )}
        {collaboratorOptions.map((person) => (
          <CollaboratorTeamCard
            key={person.id}
            name={person.name}
            account={person.account}
            verified={person.verified}
            onClick={() => addTeamCollaborator(person)}
          />
        ))}
      </RegisterActionSheet>

      <DirectCollaboratorSheet
        open={activeSheet === 'collaboratorDirect'}
        value={directCollaboratorName}
        onChange={setDirectCollaboratorName}
        onClose={() => setActiveSheet(null)}
        onSubmit={submitDirectCollaborator}
      />
    </>
  );

  return (
    <div className="mx-auto flex h-dvh w-96 flex-col bg-page">
      {step === 'choice' && renderChoice()}
      {step === 'proxyTeamAuthor' && renderProxyTeamAuthor()}
      {step === 'proxyAuthor' && renderProxyAuthor()}
      {step === 'basic' && renderBasic()}
      {step === 'participants' && renderParticipants()}
      {renderActiveSheet()}
    </div>
  );
}
