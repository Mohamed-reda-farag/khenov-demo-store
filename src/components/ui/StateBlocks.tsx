import { AlertTriangle, SearchX } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';

type HeadingTag = 'h1' | 'h2' | 'h3';

interface BlockProps {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: ReactNode;
  /** Heading level of the title. Use h1 when the block replaces a whole page's content. */
  as?: HeadingTag;
}

function Block({ title, body, action, icon, as: Heading = 'h3' }: BlockProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <div className="mb-6 grid size-16 place-items-center rounded-full bg-sand-100 text-ink-700">
        {icon}
      </div>
      <Heading className="font-display text-xl font-semibold">{title}</Heading>
      <p className="mt-2 text-sm text-ink-500">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function EmptyState({ title, body, action, icon, as }: BlockProps) {
  return (
    <div role="status">
      <Block
        title={title}
        body={body}
        action={action}
        as={as}
        icon={icon ?? <SearchX aria-hidden className="size-7" />}
      />
    </div>
  );
}

export function ErrorState({
  title,
  body,
  retryLabel,
  onRetry,
  as,
}: {
  title: string;
  body: string;
  retryLabel: string;
  onRetry: () => void;
  as?: HeadingTag;
}) {
  return (
    <div role="alert">
      <Block
        title={title}
        body={body}
        as={as}
        icon={<AlertTriangle aria-hidden className="size-7 text-danger-600" />}
        action={
          <Button variant="secondary" onClick={onRetry}>
            {retryLabel}
          </Button>
        }
      />
    </div>
  );
}
