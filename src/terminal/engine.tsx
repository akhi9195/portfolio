import type { ReactNode } from 'react';
import { commands } from './commands';
import { parse } from './parser';
import { suggest } from './suggest';
import { CLEAR, type Ctx } from './types';

// Runs one input line and returns what to print, or CLEAR.
export function execute(line: string, ctx: Ctx): ReactNode | typeof CLEAR {
  const { name, args } = parse(line);
  const cmd = commands.find((c) => c.name === name || c.aliases?.includes(name));

  if (!cmd) {
    const names = commands.flatMap((c) => [c.name, ...(c.aliases ?? [])]);
    const near = suggest(name, names);
    return (
      <span className="text-red-400">
        command not found: {name}
        {near ? `. Did you mean "${near}"?` : '. Type help to see commands.'}
      </span>
    );
  }
  return cmd.run(args, ctx);
}
