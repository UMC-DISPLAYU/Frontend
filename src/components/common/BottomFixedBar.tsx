interface BottomFixedBarProps {
  children: React.ReactNode;
}

export function BottomFixedBar({ children }: BottomFixedBarProps) {
  return (
    <footer className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-line bg-card">
      <div className="px-5 pt-4 pb-safe-bottom">{children}</div>
    </footer>
  );
}
