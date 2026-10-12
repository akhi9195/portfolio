export type Parsed = { name: string; args: string[] };

/** Splits input into a command name and arguments. Quotes group words: ask "are you remote?" */
export function parse(input: string): Parsed {
  const tokens: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input.trim())) !== null) tokens.push(m[1] ?? m[2] ?? m[3]);
  const [name = '', ...args] = tokens;
  return { name: name.toLowerCase(), args };
}
