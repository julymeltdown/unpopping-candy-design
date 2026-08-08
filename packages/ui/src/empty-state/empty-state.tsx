import type { HTMLAttributes, ReactNode } from 'react';
import { mergeClassNames } from '../lib/merge-class-names.js';

export interface EmptyStateProps extends HTMLAttributes<HTMLElement> {
  title: ReactNode;
  description: ReactNode;
  icon?: ReactNode | undefined;
  action?: ReactNode | undefined;
  headingLevel?: 2 | 3 | 4 | undefined;
}

export function EmptyState({
  action,
  className,
  description,
  headingLevel = 2,
  icon,
  title,
  ...props
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <section {...props} className={mergeClassNames('cs-empty-state', className)} data-cs-component="empty-state">
      {icon ? <div className="cs-empty-state__icon" aria-hidden="true">{icon}</div> : null}
      <Heading>{title}</Heading>
      <div className="cs-empty-state__description">{description}</div>
      {action ? <div className="cs-empty-state__action">{action}</div> : null}
    </section>
  );
}
