import type { ReactNode } from 'react';
import { CheckIcon } from '@/components/ui/Icons';

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'error' | 'success'; children: ReactNode }) {
  const styles = {
    info: 'bg-petal-light/70 text-ink-soft ring-petal',
    error: 'bg-mauve-light text-ink-soft ring-mauve',
    success: 'bg-white text-ink-soft ring-plum',
  } as const;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm leading-relaxed ring-1 ${styles[tone]}`}
    >
      {tone === 'success' && <CheckIcon width={18} height={18} className="mt-0.5 shrink-0 text-plum" />}
      {tone === 'error' && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-mauve" aria-hidden="true" />}
      <div>{children}</div>
    </div>
  );
}
