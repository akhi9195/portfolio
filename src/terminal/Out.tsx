import type { ReactNode } from 'react';
import { useTerminalRun } from './runContext';

/** Small building blocks for terminal output, themed through CSS variables. */
export const Dim = ({ children }: { children: ReactNode }) => <span style={{ color: 'var(--term-dim)' }}>{children}</span>;
export const Accent = ({ children }: { children: ReactNode }) => (
  <span style={{ color: 'var(--term-accent)', fontWeight: 600 }}>{children}</span>
);
export const Err = ({ children }: { children: ReactNode }) => <span style={{ color: 'var(--term-err)' }}>{children}</span>;

export function A({ href, children }: { href: string; children: ReactNode }) {
  const external = /^https?:/.test(href);
  return (
    <a href={href} style={{ color: 'var(--term-link)' }} className="underline underline-offset-2" {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {children}
    </a>
  );
}

/** A command name in the output that runs when clicked. */
export function Cmd({ cmd, children }: { cmd: string; children?: ReactNode }) {
  const run = useTerminalRun();
  return (
    <button
      type="button"
      onClick={() => run(cmd)}
      style={{ color: 'var(--term-link)' }}
      className="underline decoration-dotted underline-offset-2 hover:decoration-solid"
    >
      {children ?? cmd}
    </button>
  );
}

export function Block({ children }: { children: ReactNode }) {
  return <div className="space-y-1 whitespace-pre-wrap break-words">{children}</div>;
}

export function Heading({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2" style={{ color: 'var(--term-accent)', fontWeight: 600 }}>
      {children}
    </div>
  );
}
