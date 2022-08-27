import { createReactQueryHooks } from '@trpc/react';
import type { AppRouter } from '@/backend/rounter';

export const trpc = createReactQueryHooks<AppRouter>();
