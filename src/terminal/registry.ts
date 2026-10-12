import type { Command } from './types';
import { infoCommands } from './commands/info';
import { projectCommands } from './commands/projects';
import { systemCommands } from './commands/system';

export const commands: Command[] = [...infoCommands, ...projectCommands, ...systemCommands];

export function findCommand(name: string): Command | undefined {
  const n = name.toLowerCase();
  return commands.find((c) => c.name === n || c.aliases?.includes(n));
}

export const visibleNames = () => commands.filter((c) => !c.hidden).map((c) => c.name);

export const allNames = () => commands.flatMap((c) => [c.name, ...(c.aliases ?? [])]);

/** Tab completion: completes the command name, or the first argument if a space was typed. */
export function complete(input: string): string {
  const hasSpace = /\s/.test(input);
  if (!hasSpace) {
    const matches = visibleNames().filter((n) => n.startsWith(input.toLowerCase()));
    if (matches.length === 1) return matches[0] + ' ';
    return commonPrefix(matches) || input;
  }
  const [name, ...rest] = input.split(/\s+/);
  const cmd = findCommand(name);
  const partial = rest.join(' ');
  const options = cmd?.complete?.() ?? [];
  const matches = options.filter((o) => o.startsWith(partial.toLowerCase()));
  if (matches.length === 1) return `${name} ${matches[0]}`;
  const prefix = commonPrefix(matches);
  return prefix ? `${name} ${prefix}` : input;
}

function commonPrefix(words: string[]): string {
  if (!words.length) return '';
  let p = words[0];
  for (const w of words) while (!w.startsWith(p)) p = p.slice(0, -1);
  return p;
}
