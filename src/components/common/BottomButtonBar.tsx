interface BottomButtonBarProps {
  children: React.ReactNode;
  withBorder?: boolean;
  withShadow?: boolean;
}

export function BottomButtonBar({
  children,
  withBorder = true,
  withShadow = true,
}: BottomButtonBarProps) {
  return (
    <div
      className={`sticky bottom-0 bg-card px-5 pt-4 pb-8 ${
        withBorder ? 'border-t border-line' : ''
      } ${withBorder && withShadow ? 'shadow-[0px_-4px_18px_0px_rgba(4,0,250,0.06)]' : ''}`}
    >
      {children}
    </div>
  );
}
