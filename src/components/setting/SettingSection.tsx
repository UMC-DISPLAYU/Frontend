interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="typo-body-md-bold text-sub600">{title}</h2>
      <div className="overflow-hidden rounded-xl bg-card">{children}</div>
    </section>
  );
}
