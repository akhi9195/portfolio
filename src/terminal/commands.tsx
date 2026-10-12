import type { ReactNode } from 'react';
import { education, experience, profile, projects, recognition, skills, type Project } from '../data/content';
import { CLEAR, type Command, type Ctx, type Theme } from './types';

const THEMES: Theme[] = ['green', 'amber', 'light'];

// Canned answers for `ask` until the chatbot backend exists.
const answers: [RegExp, string][] = [
  [/\b(stack|tech|language|languages)\b/i, 'Mostly React, TypeScript, Java and Spring Boot. Type skills for the full list.'],
  [/\b(hire|hiring|available|looking|open to|job|role)\b/i, 'I am looking for senior full-stack roles. Type contact to get in touch.'],
  [/\b(experience|years|worked)\b/i, 'Over 12 years, from QA automation to senior full-stack engineering. Type experience.'],
  [/\b(ai|llm|agent|agents)\b/i, 'I built two production AI agents at ServiceNow and a video generation pipeline (LoopMotion). Type cd loopmotion.'],
];

const Ext = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:opacity-80">
    {children}
  </a>
);

function ProjectCard({ p }: { p: Project }) {
  return (
    <div className="space-y-2 border-l-2 border-line pl-4">
      <div className="text-lg font-bold text-accent">{p.name}</div>
      <div className="text-dim">{p.pitch}</div>
      {p.problem && (
        <p>
          <span className="text-accent">problem: </span>
          {p.problem}
        </p>
      )}
      <div>
        <span className="text-accent">built:</span>
        <ul className="ml-5 list-disc">
          {p.built.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>
      {p.challenge && (
        <p>
          <span className="text-accent">challenge: </span>
          <b>{p.challenge.title}</b> {p.challenge.body}
        </p>
      )}
      <p>
        <span className="text-accent">stack: </span>
        {p.stack.join(' · ')}
      </p>
      <p>
        <span className="text-accent">role: </span>
        {p.role}
      </p>
      <p className="flex flex-wrap gap-x-4">
        {p.live && <Ext href={p.live}>live ↗</Ext>}
        <Ext href={p.repo}>code ↗</Ext>
      </p>
      {p.demo && (
        <p>
          demo login: <code>{p.demo.user}</code> / <code>{p.demo.password}</code>
        </p>
      )}
      {p.note && <p className="text-dim">note: {p.note}</p>}
    </div>
  );
}

function ProjectList({ ctx }: { ctx: Ctx }) {
  return (
    <div className="space-y-3">
      {projects.map((p) => (
        <div key={p.slug}>
          <button onClick={() => ctx.run(`cd ${p.slug}`)} className="underline underline-offset-2 text-accent">
            {p.slug}/
          </button>{' '}
          <span className="text-dim">{p.tags.join(' · ')}</span>
          <div>{p.pitch}</div>
        </div>
      ))}
      <div className="text-dim">Click a project, or type cd &lt;project&gt;.</div>
    </div>
  );
}

// Filled in after the list is declared, so `help` always shows every command.
export const commands: Command[] = [
  {
    name: 'help',
    usage: 'help',
    description: 'List all commands',
    run: () => (
      <div className="space-y-1">
        {commands.map((c) => (
          <div key={c.name}>
            <span className="inline-block w-56 text-accent">{c.usage ?? c.name}</span>
            <span className="text-dim">{c.description}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    name: 'whoami',
    description: 'Who I am',
    run: () => (
      <div className="flex items-center gap-4">
        <img src={profile.avatar} alt={profile.name} className="h-20 w-20 rounded-md border border-line object-cover" />
        <div>
          <div className="text-lg font-bold text-accent">{profile.name}</div>
          <div className="text-dim">
            {profile.title} · {profile.location}
          </div>
          <div className="mt-1">{profile.summary}</div>
        </div>
      </div>
    ),
  },
  {
    name: 'about',
    description: 'Bio',
    run: () => <p>{profile.bio}</p>,
  },
  {
    name: 'skills',
    description: 'Skills by area',
    run: () => (
      <div className="space-y-1">
        {skills.map((g) => (
          <div key={g.area}>
            <span className="inline-block w-40 text-accent">{g.area}</span>
            {g.items.join(', ')}
          </div>
        ))}
      </div>
    ),
  },
  {
    name: 'experience',
    description: 'Work history and recognition',
    run: () => (
      <div className="space-y-5">
        {experience.map((r) => (
          <div key={r.company}>
            <div className="font-bold">
              {r.company} · <span className="font-normal">{r.title}</span>
            </div>
            <div className="text-dim">
              {r.period}
              {r.product ? ` · ${r.product}` : ''}
            </div>
            <ul className="ml-5 list-disc">
              {r.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <span className="text-accent">recognition:</span>
          <ul className="ml-5 list-disc">
            {recognition.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    name: 'education',
    description: 'Education and certification',
    run: () => (
      <ul className="ml-5 list-disc">
        {education.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    ),
  },
  {
    name: 'projects',
    aliases: ['ls'],
    usage: 'ls projects/',
    description: 'List projects',
    run: (_args, ctx) => <ProjectList ctx={ctx} />,
  },
  {
    name: 'cd',
    aliases: ['open'],
    usage: 'cd <project>',
    description: 'Open one project in detail',
    run: (args) => {
      const p = projects.find((x) => x.slug === args[0]);
      if (!p) {
        return <span>cd: no such project: {args[0] ?? '(none)'}. Try ls projects/</span>;
      }
      return <ProjectCard p={p} />;
    },
  },
  {
    name: 'contact',
    description: 'Email, GitHub and LinkedIn',
    run: () => (
      <div className="space-y-1">
        <div>
          email: <a href={`mailto:${profile.email}`} className="underline underline-offset-2">{profile.email}</a>
        </div>
        <div>
          github: <Ext href={profile.github}>{profile.github}</Ext>
        </div>
        <div>
          linkedin: <Ext href={profile.linkedin}>{profile.linkedin}</Ext>
        </div>
      </div>
    ),
  },
  {
    name: 'resume',
    description: 'Download resume (PDF)',
    run: () => (
      <div>
        resume: <Ext href={profile.resume}>download PDF ↓</Ext>
      </div>
    ),
  },
  {
    name: 'ask',
    usage: 'ask "<question>"',
    description: 'Ask about me (canned answers for now)',
    run: (args) => {
      const q = args.join(' ').trim();
      if (!q) return <span>usage: ask "your question"</span>;
      const hit = answers.find(([re]) => re.test(q));
      return (
        <span>
          {hit
            ? hit[1]
            : 'I can answer only a few things right now. Type help, or contact to reach me directly.'}
        </span>
      );
    },
  },
  {
    name: 'theme',
    usage: 'theme <green|amber|light>',
    description: 'Change the colour theme',
    run: (args, ctx) => {
      const t = args[0] as Theme;
      if (!THEMES.includes(t)) return <span>usage: theme &lt;green|amber|light&gt;</span>;
      ctx.setTheme(t);
      return <span>theme set to {t}</span>;
    },
  },
  {
    name: 'clear',
    description: 'Clear the screen (or press Ctrl+L)',
    run: () => CLEAR,
  },
  // Easter eggs
  {
    name: 'sudo',
    description: 'Try it',
    run: (args) =>
      args[0] === 'hire-me' ? (
        <span className="text-accent">Access granted. Let’s talk: {profile.email}</span>
      ) : (
        <span className="text-red-400">sudo: permission denied. Nice try.</span>
      ),
  },
  {
    name: 'rm',
    description: 'Try it',
    run: (args) =>
      args.includes('-rf') ? (
        <span>Nice try. Your files are safe; this is only a portfolio.</span>
      ) : (
        <span>rm: not allowed on this portfolio</span>
      ),
  },
  {
    name: 'exit',
    description: 'Try it',
    run: () => <span>There is no exit. Try contact.</span>,
  },
];
