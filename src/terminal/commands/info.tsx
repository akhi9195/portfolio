import { education } from '../../data/education';
import { recognition, roles } from '../../data/experience';
import { profile } from '../../data/profile';
import { skills } from '../../data/skills';
import Avatar from '../../components/sections/Avatar';
import { A, Accent, Block, Cmd, Dim, Heading } from '../Out';
import Typewriter from '../Typewriter';
import type { Command } from '../types';

export const infoCommands: Command[] = [
  {
    name: 'whoami',
    description: 'Name, title and a one-line summary',
    run: (_a, ctx) => (
      <div className="flex items-start gap-4">
        <Avatar size={64} />
        <Block>
          <div><Accent>{profile.name}</Accent></div>
          <div>{profile.title} · {profile.location} · {profile.yearsOfExperience}</div>
          <div>{ctx.typing ? <Typewriter text={profile.summary} /> : profile.summary}</div>
          <div><Dim>Type </Dim><Cmd cmd="help" /><Dim> to see what you can do, or try </Dim><Cmd cmd="projects" /><Dim>.</Dim></div>
        </Block>
      </div>
    ),
  },
  {
    name: 'about',
    description: 'Short bio',
    run: () => <Block>{profile.bio}</Block>,
  },
  {
    name: 'skills',
    description: 'Skills grouped by area',
    run: () => (
      <div className="grid gap-x-4 gap-y-1 sm:grid-cols-[11rem_1fr]">
        {skills.map((g) => (
          <div key={g.area} className="contents">
            <Accent>{g.area}</Accent>
            <span>{g.items.join(', ')}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    name: 'experience',
    aliases: ['work'],
    description: 'Roles, highlights and recognition',
    run: () => (
      <Block>
        {roles.map((r) => (
          <div key={r.company} className="mb-3">
            <Heading>{r.company} · {r.title}</Heading>
            <Dim>{r.start} – {r.end}{r.product ? ` · ${r.product}` : ''}</Dim>
            {r.tech && <div><Dim>Tech: {r.tech.join(', ')}</Dim></div>}
            {r.highlights.map((h) => (
              <div key={h} className="pl-4 -indent-4">• {h}</div>
            ))}
          </div>
        ))}
        <Heading>Recognition</Heading>
        {recognition.map((r) => <div key={r}>★ {r}</div>)}
        <div className="mt-2"><Dim>See also </Dim><Cmd cmd="education" /></div>
      </Block>
    ),
  },
  {
    name: 'education',
    description: 'Degree and certification',
    run: () => (
      <Block>
        {education.map((e) => (
          <div key={e.title}>
            <Accent>{e.title}</Accent>
            {e.detail && <Dim> · {e.detail}</Dim>}
          </div>
        ))}
      </Block>
    ),
  },
  {
    name: 'contact',
    description: 'Email, GitHub and LinkedIn',
    run: () => (
      <Block>
        <div><Dim>email    </Dim><A href={`mailto:${profile.email}`}>{profile.email}</A></div>
        {profile.links.map((l) => (
          <div key={l.label}>
            <Dim>{l.label.toLowerCase().padEnd(9, ' ')}</Dim>
            <A href={l.url}>{l.url.replace(/^https?:\/\/(www\.)?/, '')}</A>
          </div>
        ))}
      </Block>
    ),
  },
  {
    name: 'resume',
    aliases: ['cv'],
    description: 'Download the PDF or open the plain résumé',
    run: () => (
      <Block>
        <div><A href={profile.resumeUrl}>↓ Download résumé (PDF)</A></div>
        <div><A href="/resume">Open the plain, printable résumé page</A></div>
      </Block>
    ),
  },
];
