import { AlertTriangle, SearchX } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';

interface BlockProps {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: ReactNode;
}

function Block({ title, body, action, icon }: BlockProps & { role?: 'alert' | 'status' }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <div className="mb-6 grid size-16 place-items-center rounded-full bg-sand-100 text-ink-700">
        {icon}
      </div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-ink-500">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function EmptyState({ title, body, action }: Omit<BlockProps, 'icon'>) {
  return (
    <div role="status">
      <Block
        title={title}
        body={body}
        action={action}
        icon={<SearchX aria-hidden className="size-7" />}
      />
    </div>
  );
}

export function ErrorState({
  title,
  body,
  retryLabel,
  onRetry,
}: {
  title: string;
  body: string;
  retryLabel: string;
  onRetry: () => void;
}) {
  return (
    <div role="alert">
      <Block
        title={title}
        body={body}
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
