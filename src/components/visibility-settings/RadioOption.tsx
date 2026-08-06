interface RadioOptionProps {
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}

export function RadioOption({
  checked,
  disabled = false,
  onSelect,
  title,
  description,
}: RadioOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onSelect}
      className="flex w-full items-start gap-2 rounded-2xl bg-card px-4 py-3.5 text-left outline outline-1 outline-offset-[-1px] outline-line-soft disabled:bg-box disabled:opacity-60"
    >
      <span
        className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${
          checked ? 'outline outline-2 outline-offset-[-2px] outline-main' : 'border-2 border-line'
        }`}
      >
        {checked && <span className="size-1.5 rounded-full bg-main" />}
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className={`typo-body-sm-semibold ${disabled ? 'text-faint' : 'text-main'}`}>
          {title}
        </span>
        <span className="typo-body-xs-regular text-faint">{description}</span>
      </span>
    </button>
  );
}
