interface BottomButtonBarProps {
  children: React.ReactNode;
}

export function BottomButtonBar({ children }: BottomButtonBarProps) {
  return (
    <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 py-4 bg-card border-t border-line z-50">
      {children}
    </footer>
  );
}
