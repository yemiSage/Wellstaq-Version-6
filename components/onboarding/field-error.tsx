// path: components/onboarding/field-error.tsx
interface FieldErrorProps {
  errors?: Record<string, string[]>;
  field: string;
}

export function FieldError({ errors, field }: FieldErrorProps) {
  const messages = errors?.[field];
  if (!messages || messages.length === 0) return null;

  return <p className="text-sm text-red-600 mt-1">{messages[0]}</p>;
}