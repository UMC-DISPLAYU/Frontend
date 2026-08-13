interface InviteButtonProps {
  label: '초대' | '초대 대기' | '초대완료' | '팀원';
  onClick: () => void;
  disabled?: boolean;
}

export function InviteButton({ label, onClick, disabled = false }: InviteButtonProps) {
  if (label === '초대') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="typo-body-xs-regular shrink-0 rounded-sm bg-dark px-2.5 py-1 text-center text-white"
      >
        초대
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="typo-body-xs-regular shrink-0 rounded-sm bg-bt-gray px-2.5 py-1 text-center text-main"
    >
      {label}
    </button>
  );
}
