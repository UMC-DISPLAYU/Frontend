interface LabelProps {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}

export function Label({ children, required, htmlFor }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className="flex items-center gap-1">
      <span className="typo-body-sm-bold text-main">{children}</span>
      {required && <span className="typo-body-xs-regular text-error">*</span>}
    </label>
  );
}
