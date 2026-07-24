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
      className={`h-11 w-full rounded-xl outline outline-1 outline-offset-[-1px] outline-faint typo-body-sm-${weight} text-main`}
    >
      {children}
    </button>
  );
}
