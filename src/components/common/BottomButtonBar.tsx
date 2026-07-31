interface BottomButtonBarProps {
  children: React.ReactNode;
  withBorder?: boolean;
}

export function BottomButtonBar({ children, withBorder = true }: BottomButtonBarProps) {
  return (
    <div
      className={`sticky bottom-0 bg-card px-5 pt-4 pb-8 ${
        withBorder ? 'border-t border-line shadow-[0px_-4px_18px_0px_rgba(4,0,250,0.06)]' : ''
      }`}
    >
      {children}
    </div>
  );
}
