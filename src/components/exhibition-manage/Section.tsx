interface SectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function Section({ title, description, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="typo-body-sm-bold text-main">{title}</span>
        <span className="typo-body-xs-regular text-hint">{description}</span>
      </div>
      {children}
    </section>
  );
}
