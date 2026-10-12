import type { ReactNode } from 'react';

export function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      className="font-medium text-mint-400 underline decoration-mint-400/40 underline-offset-2 hover:decoration-mint-400"
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children}
    </a>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-md border border-slate-600/60 bg-slate-800/60 px-2 py-0.5 text-xs text-slate-200">
      {children}
    </span>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">{children}</h3>;
}
