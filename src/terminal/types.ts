import type { ReactNode } from 'react';

export const CLEAR = Symbol('clear');

export type Theme = 'green' | 'amber' | 'light';

export type Ctx = {
  run: (line: string) => void;
  setTheme: (theme: Theme) => void;
};

export type Command = {
  name: string;
  aliases?: string[];
  usage?: string;
  description: string;
  run: (args: string[], ctx: Ctx) => ReactNode | typeof CLEAR;
};
