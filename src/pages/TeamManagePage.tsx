import { useEffect, useState } from 'react';

import { ChevronLeft, Copy, Link2, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useHeaderContext } from '@/components/layout/headerContext';

type MemberStatus = 'owner' | 'verified' | 'unverified' | 'pending';

interface Member {
  id: string;
  name: string;
  nickname: string;
  status: MemberStatus;
}

const STATUS_LABEL: Record<MemberStatus, string> = {
  owner: '대표자',
  verified: '작가 인증 완료',
  unverified: '작가 미인증',
  pending: '초대대기',
};

/** 대표자·인증완료는 파란 뱃지, 나머지는 회색 뱃지 */
const isAccent = (status: MemberStatus) => status === 'owner' || status === 'verified';

const MEMBERS: Member[] = [
  { id: '1', name: '최유성', nickname: 'quietroom', status: 'owner' },
  { id: '2', name: '이정우', nickname: 'quietroom', status: 'verified' },
  { id: '3', name: '이정우', nickname: 'quietroom', status: 'unverified' },
  { id: '4', name: '이정우', nickname: 'quietroom', status: 'pending' },
];

const INVITE_LINK = 'displayu.kr/invite/exhibition/abcd123';

function StatusBadge({ status }: { status: MemberStatus }) {
  const accent = isAccent(status);
  return (
    <span
      className={`typo-body-xs-regular shrink-0 rounded-sm px-2.5 py-1 text-center ${
        accent ? 'bg-tag-gray text-link' : 'bg-box200 text-main'
      }`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function MemberRow({ member }: { member: Member }) {
  return (
    <li className="flex items-center gap-3 rounded-[20px] bg-card px-3 py-5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-box outline outline-[1.6px] outline-offset-[-1.6px] outline-line">
          <User className="size-7 translate-y-1 text-white" strokeWidth={1.5} />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <span className="typo-body-sm-bold truncate text-main">{member.name}</span>
          <span className="typo-body-xs-regular truncate text-hint">{member.nickname}</span>
        </div>
      </div>
      <StatusBadge status={member.status} />
    </li>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="초대 링크 활성화"
      onClick={() => onChange(!checked)}
      className={`flex h-5 w-11 items-center rounded-full p-1 transition-colors ${
        checked ? 'bg-dark' : 'bg-box200'
      }`}
    >
      <span
        className={`size-4 rounded-full shadow-[0px_1px_4px_0px_rgba(38,0,255,0.3)] transition-transform ${
          checked
            ? 'translate-x-6 bg-gradient-to-b from-white/60 to-white'
            : 'translate-x-0 bg-dark'
        }`}
      />
    </button>
  );
}

export function TeamManage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useHeaderContext();
  const [query, setQuery] = useState('');
  const [linkEnabled, setLinkEnabled] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setHeader({ title: '' });
    return () => resetHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const members = MEMBERS.filter(
    (m) => m.name.includes(query.trim()) || m.nickname.includes(query.trim()),
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${INVITE_LINK}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 클립보드 권한이 없으면 조용히 무시 */
    }
  };

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-page flex flex-col">
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 pt-14.5 pb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="-ml-1"
        >
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <div className="typo-body-xl-bold text-center text-main">팀원 초대/관리</div>
        <div className="size-7" />
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-3 pb-8">
        {/* 닉네임 검색 */}
        <div className="flex h-10 items-center gap-2 rounded-xl bg-box px-5 shadow-[inset_1px_1px_1px_0px_rgba(0,0,0,0.10),inset_-1px_-1px_1px_0px_rgba(255,255,255,1)]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="닉네임 검색"
            className="typo-body-sm-semibold w-full bg-transparent text-main outline-none placeholder:text-faint"
          />
          <Search className="size-5 shrink-0 text-hint" strokeWidth={1.5} />
        </div>

        {/* 초대 링크 */}
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="typo-body-sm-regular text-main">초대 링크 활성화</span>
            <Toggle checked={linkEnabled} onChange={setLinkEnabled} />
          </div>

          {linkEnabled && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1">
                <span className="grid h-4 w-7 shrink-0 place-items-center rounded-sm bg-card outline outline-1 outline-offset-[-1px] outline-line-soft">
                  <Link2 className="size-3 text-main" strokeWidth={2} />
                </span>
                <span className="typo-body-xs-regular truncate text-main">{INVITE_LINK}</span>
              </div>
              <button
                type="button"
                onClick={copyLink}
                className="flex shrink-0 items-center gap-0.5"
              >
                <Copy className="size-3 text-main" strokeWidth={1} />
                <span className="typo-body-xs-regular text-main">
                  {copied ? '복사됨' : '복사'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* 팀원 목록 */}
        <div className="mt-6 flex flex-col gap-3">
          <span className="typo-body-sm-bold text-main">팀원</span>
          <ul className="flex flex-col gap-2.5">
            {members.map((m) => (
              <MemberRow key={m.id} member={m} />
            ))}
          </ul>
          {members.length === 0 && (
            <p className="typo-body-xs-regular py-8 text-center text-faint">
              검색 결과가 없어요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
