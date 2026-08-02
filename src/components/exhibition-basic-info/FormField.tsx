import { Label } from './Label';

interface FormFieldProps {
  label: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

export function FormField({ label, required, description, children, htmlFor }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <Label required={required} htmlFor={htmlFor}>
        {label}
      </Label>
      {children}
      {description && <p className="typo-body-xxs-regular text-faint">{description}</p>}
    </div>
  );
}
