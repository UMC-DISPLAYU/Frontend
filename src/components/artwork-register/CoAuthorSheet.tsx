import { type KeyboardEvent, useId, useState } from 'react';

import RemoveIcon from '@/assets/artwork-register/RemoveIcon.svg';
import CheckIcon from '@/assets/display-register/CheckIcon.svg';
import { Overlay } from '@/components/ui';
import { cn } from '@/utils/cn';

import { MAX_CO_AUTHOR_NAME_LENGTH } from './artworkRegister.constants';
import type { ArtworkPerson, ArtworkTeamCandidate } from './artworkRegister.types';
import { DIRECT_INPUT_CAPTION, toNamedCoAuthor, toTeamCoAuthor } from './artworkTeam';
import { AuthorAvatar } from './AuthorAvatar';

type CoAuthorTab = 'team' | 'name';

interface CoAuthorSheetProps {
  open: boolean;
  candidates: ArtworkTeamCandidate[];
  value: ArtworkPerson[];
  onClose: () => void;
  onDone: (next: ArtworkPerson[]) => void;
}

/** 열 때마다 key 를 바꿔 다시 마운트한다. 시트 안에서 고른 값은 완료를 눌러야 반영된다 */
export function CoAuthorSheet({ open, candidates, value, onClose, onDone }: CoAuthorSheetProps) {
  const inputId = useId();
  const helpId = useId();
  const [tab, setTab] = useState<CoAuthorTab>('team');
  const [pickedUserIds, setPickedUserIds] = useState<number[]>(() =>
    value.flatMap((person) => (person.userId === undefined ? [] : [person.userId])),
  );
  const [typedNames, setTypedNames] = useState<string[]>(() =>
    value.filter((person) => person.userId === undefined).map((person) => person.name),
  );
  const [nameInput, setNameInput] = useState('');

  const togglePick = (userId: number) =>
    setPickedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );

  const withTypedName = (names: string[]) => {
    const name = nameInput.trim();
    return name && !names.includes(name) ? [...names, name] : names;
  };

  const handleNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    setTypedNames(withTypedName);
    setNameInput('');
  };

  // 프로토타입: 탭을 바꾸면 입력 중이던 이름은 지워지고, 완료할 때는 이름 탭에 남은 입력만 함께 추가한다
  const changeTab = (next: CoAuthorTab) => {
    setTab(next);
    setNameInput('');
  };

  const handleDone = () => {
    // 팀원은 고른 순서가 아니라 팀원 목록 순서로 넣는다. 시트를 연 사이 목록에서 빠진 팀원은 지우지 않는다
    const pickedTeam = candidates
      .filter((candidate) => pickedUserIds.includes(candidate.userId))
      .map(toTeamCoAuthor);
    const keptTeam = value.filter(
      (person) =>
        person.userId !== undefined &&
        pickedUserIds.includes(person.userId) &&
        !candidates.some((candidate) => candidate.userId === person.userId),
    );
    const names = tab === 'name' ? withTypedName(typedNames) : typedNames;

    onDone([...pickedTeam, ...keptTeam, ...names.map(toNamedCoAuthor)]);
  };

  return (
    <Overlay
      open={open}
      onClose={onClose}
      title="공동 작가 추가"
      showCloseButton={false}
      footer={
        <button
          type="button"
          onClick={handleDone}
          className="typography-body-lg-semibold h-11 w-full rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
        >
          {tab === 'team' ? '완료' : '추가하기'}
        </button>
      }
    >
      <div role="tablist" className="grid grid-cols-2 rounded-circle bg-secondary p-1">
        {(
          [
            ['team', '전시 팀원'],
            ['name', '이름 직접 입력'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => changeTab(key)}
            className={cn(
              'typography-body-lg-semibold h-10 rounded-circle transition duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
              tab === key ? 'bg-primary-black text-base-white' : 'text-secondary',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'team' ? (
        <div role="tabpanel">
          <p className="typography-body-lg-regular mt-4 text-tertiary">
            계정으로 추가한 팀원은 이 작품을 함께 수정·삭제할 수 있고, 작가 프로필에 작품이 연결돼요
          </p>
          <ul className="mt-2">
            {candidates.map((candidate) => {
              const isPicked = pickedUserIds.includes(candidate.userId);

              return (
                <li key={candidate.userId} className="border-b border-bg-tertiary">
                  <button
                    type="button"
                    aria-pressed={isPicked}
                    disabled={candidate.disabled}
                    onClick={() => togglePick(candidate.userId)}
                    className="flex w-full items-center gap-3 py-3 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus disabled:cursor-default disabled:opacity-45"
                  >
                    <AuthorAvatar />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="typography-body-lg-semibold truncate text-primary">
                        {candidate.name}
                      </span>
                      <span className="typography-body-md-medium truncate text-secondary">
                        {candidate.caption}
                      </span>
                    </span>
                    {!candidate.disabled && (
                      <span
                        className={cn(
                          'typography-body-md-semibold flex shrink-0 items-center gap-1 rounded-20 border px-4 py-2 transition duration-fast ease-standard',
                          isPicked
                            ? 'border-interactive-primary bg-interactive-primary text-interactive-inverse'
                            : 'border-primary text-primary',
                        )}
                      >
                        {isPicked ? '추가됨' : '추가'}
                        {isPicked && <img src={CheckIcon} alt="" className="size-4" />}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {candidates.length === 0 && (
            <p className="typography-body-lg-semibold py-7 text-center text-primary">
              선택할 수 있는 팀원이 없어요
            </p>
          )}
        </div>
      ) : (
        <div role="tabpanel">
          <div className="group mt-5 flex flex-col gap-1">
            <label htmlFor={inputId} className="flex items-center gap-1">
              <span className="typography-body-lg-semibold text-primary">공동 작가 이름</span>
              <span aria-hidden="true" className="typography-body-lg-semibold text-error">
                *
              </span>
            </label>
            <div className="border-b border-primary py-3 transition duration-fast ease-standard focus-within:border-interactive-primary">
              <input
                id={inputId}
                value={nameInput}
                maxLength={MAX_CO_AUTHOR_NAME_LENGTH}
                autoComplete="off"
                enterKeyHint="done"
                placeholder="이름을 입력해주세요"
                aria-describedby={helpId}
                onChange={(event) => setNameInput(event.target.value)}
                onKeyDown={handleNameKeyDown}
                className="typography-body-xl-regular w-full bg-transparent text-primary outline-none placeholder:text-tertiary"
              />
            </div>
            <p id={helpId} className="typography-body-md-medium text-secondary">
              이름만 표시돼요
              <br />
              프로필 연결과 편집 권한은 없어요
            </p>
          </div>
          {typedNames.length > 0 && (
            <ul className="mt-2">
              {typedNames.map((name) => (
                <li key={name} className="border-b border-bg-tertiary">
                  <button
                    type="button"
                    aria-label={`${name} 제외`}
                    onClick={() => setTypedNames((prev) => prev.filter((item) => item !== name))}
                    className="flex w-full items-center gap-3 py-3 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
                  >
                    <AuthorAvatar />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="typography-body-lg-semibold truncate text-primary">
                        {name}
                      </span>
                      <span className="typography-body-md-medium text-secondary">
                        {DIRECT_INPUT_CAPTION}
                      </span>
                    </span>
                    <img src={RemoveIcon} alt="" className="size-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Overlay>
  );
}
