interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({
  checked,
  onChange,
  label = '초대 링크 활성화',
  disabled = false,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex h-5 w-11 items-center rounded-full p-1 transition-colors duration-200 disabled:opacity-50 ${
        checked
          ? 'bg-dark'
          : 'bg-box200 shadow-[inset_-1px_-1px_2px_0px_rgba(255,255,255,1.00),inset_1px_1px_2px_0px_rgba(17,0,116,0.15)]'
      }`}
    >
      <span
        className={`size-4 rounded-full transition-all duration-200 ${
          checked
            ? 'translate-x-5 bg-linear-to-b from-gray-200/60 to-white/40'
            : 'translate-x-0 bg-dark'
        }`}
      />
    </button>
  );
}
