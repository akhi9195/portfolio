import { findProject, projects } from '../../data/projects';
import { A, Accent, Block, Cmd, Dim, Err, Heading } from '../Out';
import type { Command } from '../types';

const slugs = () => projects.map((p) => p.slug);

const list = () => (
  <Block>
    {projects.map((p) => (
      <div key={p.slug} className="flex flex-wrap gap-x-3">
        <span className="inline-block min-w-[9.5rem]"><Cmd cmd={`cd ${p.slug}`}>{p.slug}/</Cmd></span>
        <Dim>{p.tags.join(' · ')}</Dim>
      </div>
    ))}
    <div className="mt-2"><Dim>Open one with </Dim><Accent>cd &lt;project&gt;</Accent><Dim>, or click its name.</Dim></div>
  </Block>
);

const show = (slug: string) => {
  const p = findProject(slug);
  if (!p) {
    return (
      <Block>
        <Err>cd: no such project: {slug}</Err>
        <div><Dim>Try one of: </Dim>{slugs().join(', ')}</div>
      </Block>
    );
  }
  return (
    <Block>
      <Accent>{p.name}</Accent>
      <div>{p.pitch}</div>
      {p.note && <div style={{ color: 'var(--term-accent)' }}>⏳ {p.note}</div>}
      {p.problem && (<><Heading>Problem</Heading><div>{p.problem}</div></>)}
      <Heading>What I built</Heading>
      {p.built.map((b) => <div key={b} className="pl-4 -indent-4">• {b}</div>)}
      {p.challenge && (<><Heading>Hardest problem: {p.challenge.title}</Heading><div>{p.challenge.body}</div></>)}
      {p.metrics && (<><Heading>By the numbers</Heading><div>{p.metrics.join(' · ')}</div></>)}
      <Heading>Stack</Heading>
      <div>{p.stack.join(', ')}</div>
      <Heading>Role</Heading>
      <div>{p.role}</div>
      <Heading>Links</Heading>
      {p.liveUrl && <div><Dim>live  </Dim><A href={p.liveUrl}>{p.liveUrl}</A></div>}
      <div><Dim>code  </Dim><A href={p.repoUrl}>{p.repoUrl}</A></div>
      {p.demo && <div><Dim>demo  </Dim>{p.demo.user} / {p.demo.password}</div>}
      <div className="mt-2"><Dim>Back to the list: </Dim><Cmd cmd="projects" /></div>
    </Block>
  );
};

export const projectCommands: Command[] = [
  {
    name: 'projects',
    aliases: ['ls'],
    description: 'List my projects',
    usage: 'projects  (or: ls projects)',
    run: () => list(),
  },
  {
    name: 'cd',
    aliases: ['open'],
    description: 'Open a project',
    usage: 'cd <project>',
    complete: slugs,
    run: (args) => {
      const target = (args[0] ?? '').replace(/^projects\//, '');
      if (!target) return <Block><Dim>usage: cd &lt;project&gt;. Projects: </Dim>{slugs().join(', ')}</Block>;
      if (target === '..' || target === '~' || target === '/') return <Dim>You're already home.</Dim>;
      if (target === 'projects' || target === 'projects/') return list();
      return show(target);
    },
  },
];
