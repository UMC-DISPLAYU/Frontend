import { useState } from 'react';

import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/common';
import { InviteLinkSection, MemberRow, type Member } from '@/components/team-manage';

const MEMBERS: Member[] = [
  { id: '1', name: '최유성', nickname: 'quietroom', status: 'owner' },
  { id: '2', name: '이정우', nickname: 'quietroom', status: 'verified' },
  { id: '3', name: '이정우', nickname: 'quietroom', status: 'unverified' },
  { id: '4', name: '이정우', nickname: 'quietroom', status: 'pending' },
];

const INVITE_LINK = 'displayu.kr/invite/exhibition/abcd123';

export function TeamManage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const members = MEMBERS.filter(
    (m) => m.name.includes(query.trim()) || m.nickname.includes(query.trim()),
  );

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-page flex flex-col">
      <PageHeader title="팀원 초대/관리" onBack={() => navigate(-1)} centered />

      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-3 pb-8">
        <div className="flex h-10 items-center gap-2 rounded-xl bg-box px-5 shadow-[inset_1px_1px_1px_0px_rgba(0,0,0,0.10),inset_-1px_-1px_1px_0px_rgba(255,255,255,1)]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="닉네임 검색"
            className="typo-body-sm-semibold w-full bg-transparent text-main outline-none placeholder:text-faint"
          />
          <Search className="size-5 shrink-0 text-hint" strokeWidth={1.5} />
        </div>

        <InviteLinkSection inviteLink={INVITE_LINK} />

        <div className="mt-6 flex flex-col gap-3">
          <span className="typo-body-sm-bold text-main">팀원</span>
          <ul className="flex flex-col gap-2.5">
            {members.map((m) => (
              <MemberRow key={m.id} member={m} />
            ))}
          </ul>
          {members.length === 0 && (
            <p className="typo-body-xs-regular py-8 text-center text-faint">검색 결과가 없어요.</p>
          )}
        </div>
      </div>
    </div>
  );
}
