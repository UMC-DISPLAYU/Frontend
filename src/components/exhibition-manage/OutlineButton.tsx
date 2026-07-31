interface OutlineButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  weight?: 'bold' | 'semibold';
}

export function OutlineButton({ children, onClick, weight = 'bold' }: OutlineButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 w-full rounded-xl outline outline-1 outline-offset-[-1px] outline-faint text-main ${
        weight === 'bold' ? 'typo-body-sm-bold' : 'typo-body-sm-semibold'
      }`}
    >
      {children}
    </button>
  );
}
