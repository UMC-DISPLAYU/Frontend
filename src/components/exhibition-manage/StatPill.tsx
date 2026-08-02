interface StatPillProps {
  label: string;
  value: string;
}

export function StatPill({ label, value }: StatPillProps) {
  return (
    <div className="flex h-11 flex-1 items-center justify-between rounded-xl bg-box200 px-3">
      <span className="typo-body-sm-regular text-main">{label}</span>
      <span className="typo-body-sm-bold text-main">{value}</span>
    </div>
  );
}
