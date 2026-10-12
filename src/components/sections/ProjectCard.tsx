import type { Project } from '../../data/types';
import { ExtLink, SubHeading, Tag } from './Ui';

export default function ProjectCard({ project: p, headingLevel = 3 }: { project: Project; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article>
      <H className="text-lg font-semibold">{p.name}</H>
      <p className="mt-1 text-slate-300">{p.pitch}</p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {p.tags.map((t) => (
          <li key={t}>
            <Tag>{t}</Tag>
          </li>
        ))}
      </ul>
      {p.note && (
        <p className="mt-3 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">⏳ {p.note}</p>
      )}
      {p.problem && (
        <>
          <SubHeading>Problem</SubHeading>
          <p className="text-sm leading-relaxed text-slate-300">{p.problem}</p>
        </>
      )}
      <SubHeading>What I built</SubHeading>
      <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-slate-300">
        {p.built.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      {p.challenge && (
        <>
          <SubHeading>Hardest problem: {p.challenge.title}</SubHeading>
          <p className="text-sm leading-relaxed text-slate-300">{p.challenge.body}</p>
        </>
      )}
      {p.metrics && (
        <>
          <SubHeading>By the numbers</SubHeading>
          <p className="text-sm text-slate-300">{p.metrics.join(' · ')}</p>
        </>
      )}
      <SubHeading>Stack</SubHeading>
      <p className="text-sm text-slate-300">{p.stack.join(', ')}</p>
      <SubHeading>Role</SubHeading>
      <p className="text-sm text-slate-300">{p.role}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {p.liveUrl && <ExtLink href={p.liveUrl}>Live demo ↗</ExtLink>}
        <ExtLink href={p.repoUrl}>Code ↗</ExtLink>
      </div>
      {p.demo && (
        <p className="mt-2 text-sm text-slate-400">
          Demo login: <code className="text-slate-200">{p.demo.user}</code> / <code className="text-slate-200">{p.demo.password}</code>
        </p>
      )}
    </article>
  );
}
