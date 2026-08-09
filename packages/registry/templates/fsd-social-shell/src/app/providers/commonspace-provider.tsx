import type { PropsWithChildren } from 'react';
import { CommonspaceProvider } from '@commonspace/theme';
import { FeedbackProvider } from '@commonspace/ui';

export function ApplicationProviders({ children }: PropsWithChildren) {
  return <CommonspaceProvider scope="document"><FeedbackProvider>{children}</FeedbackProvider></CommonspaceProvider>;
}
