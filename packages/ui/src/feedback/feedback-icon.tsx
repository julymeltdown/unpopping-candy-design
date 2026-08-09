import { CheckCircleFilledIcon, ErrorCircleIcon, InfoCircleIcon, WarningIcon } from '@unpopping-candy/icons';
import type { FeedbackTone } from './feedback-state.js';

export function FeedbackIcon({ tone }: { tone: FeedbackTone }) {
  switch (tone) {
    case 'success': return <CheckCircleFilledIcon />;
    case 'warning': return <WarningIcon />;
    case 'critical': return <ErrorCircleIcon />;
    default: return <InfoCircleIcon />;
  }
}
