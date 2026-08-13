import { useCallback, useMemo, useState } from 'react';

import type { z } from 'zod';

export function useZodFieldError<TSchema extends z.ZodTypeAny>({
  schema,
  value,
  field,
}: {
  schema: TSchema;
  value: z.input<TSchema>;
  field: string;
}) {
  const [isTouched, setIsTouched] = useState(false);
  const markTouched = useCallback(() => setIsTouched(true), []);

  const error = useMemo(() => {
    if (!isTouched) return undefined;

    const parsed = schema.safeParse(value);
    if (parsed.success) return undefined;

    return parsed.error.issues.find((issue) => issue.path[0] === field)?.message;
  }, [field, isTouched, schema, value]);

  return { error, markTouched };
}
