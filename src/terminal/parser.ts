// Splits a raw input line into a command name and arguments.
// Respects double and single quotes, so: ask "what is your stack"
export function parse(input: string): { name: string; args: string[] } {
  const tokens = input.trim().match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  const clean = tokens.map((t) => (/^(["']).*\1$/.test(t) ? t.slice(1, -1) : t));
  const [name = '', ...args] = clean;
  return { name: name.toLowerCase(), args };
}
