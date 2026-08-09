import type { PropsWithChildren } from 'react';
import { UnpoppingCandyProvider } from '@unpopping-candy/theme';
import { FeedbackProvider } from '@unpopping-candy/ui';

export function ApplicationProviders({ children }: PropsWithChildren) {
  return <UnpoppingCandyProvider scope="document"><FeedbackProvider>{children}</FeedbackProvider></UnpoppingCandyProvider>;
}
