import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RunContext } from './runContext';
import { parse } from './parser';
import { commands, complete, findCommand } from './registry';
import { suggest } from './suggest';
import type { Ctx } from './types';

describe('parser', () => {
  it('splits words and keeps quoted text together', () => {
    expect(parse('  cd   helpdesk-api ')).toEqual({ name: 'cd', args: ['helpdesk-api'] });
    expect(parse('ask "are you remote?"')).toEqual({ name: 'ask', args: ['are you remote?'] });
    expect(parse('HELP')).toEqual({ name: 'help', args: [] });
    expect(parse('')).toEqual({ name: '', args: [] });
  });
});

describe('registry', () => {
  it('finds commands by name and alias', () => {
    expect(findCommand('projects')?.name).toBe('projects');
    expect(findCommand('ls')?.name).toBe('projects');
    expect(findCommand('open')?.name).toBe('cd');
    expect(findCommand('nope')).toBeUndefined();
  });

  it('completes command names and project slugs', () => {
    expect(complete('sk')).toBe('skills ');
    expect(complete('cd help')).toBe('cd helpdesk-api');
    expect(complete('theme a')).toBe('theme amber');
  });
});

describe('suggest', () => {
  it('suggests close matches only', () => {
    expect(suggest('skils', ['skills', 'help'])).toBe('skills');
    expect(suggest('contcat', ['contact'])).toBe('contact');
    expect(suggest('xyz', ['skills', 'help'])).toBeUndefined();
  });
});

describe('every command', () => {
  const ctx: Ctx = { run: () => {}, clear: () => {}, theme: 'green', setTheme: () => {}, navigate: () => {} };
  it.each(commands.map((c) => [c.name, c] as const))('%s renders without crashing', (_n, c) => {
    const out = c.run(c.complete?.().slice(0, 1) ?? [], ctx);
    render(
      <MemoryRouter>
        <RunContext.Provider value={() => {}}>{out ?? null}</RunContext.Provider>
      </MemoryRouter>,
    );
  });

  it('cd shows a project and an error for unknown ones', () => {
    const cd = findCommand('cd')!;
    const ok = render(<RunContext.Provider value={() => {}}>{cd.run(['helpdesk-api'], ctx) ?? null}</RunContext.Provider>);
    expect(ok.getByText('HelpDesk API')).toBeInTheDocument();
    const bad = render(<RunContext.Provider value={() => {}}>{cd.run(['nope'], ctx) ?? null}</RunContext.Provider>);
    expect(bad.getByText(/no such project/)).toBeInTheDocument();
  });
});
