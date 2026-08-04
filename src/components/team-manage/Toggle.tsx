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
      className={`flex h-5 w-11 items-center rounded-full p-1 transition-colors disabled:opacity-50 ${
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
