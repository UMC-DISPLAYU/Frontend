---
description: Update UI instantly before server confirms (Optimistic UI)
---

# Optimistic UI Pattern (React Query)

Use this concise pattern to instantly update the UI (0ms delay) on user actions (e.g., bookmark, like, toggle) and automatically rollback on error.

## 1. Setup Optimistic Mutation

```tsx
const useToggleItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleItemApi,
    onMutate: async (newItem) => {
      // 1) Cancel ongoing queries to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['items'] });

      // 2) Snapshot previous data for rollback
      const previous = queryClient.getQueryData(['items']);

      // 3) Instantly update cache (0ms UX reaction)
      queryClient.setQueryData(['items'], (old: any) => [...(old ?? []), newItem]);

      return { previous };
    },
    onError: (_err, _newItem, context) => {
      // 4) Rollback to previous snapshot on error
      if (context?.previous) {
        queryClient.setQueryData(['items'], context.previous);
      }
    },
    onSettled: () => {
      // 5) Final background sync with server
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};
```

## 2. Key Rules

- Keep `onMutate` concise (only insert/update the required ID/fields).
- Always return `{ previous }` for rollback.
- Invalidate queries in `onSettled` for final server sync.
