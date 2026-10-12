import type { ReactNode } from 'react';

export type Theme = 'green' | 'amber' | 'light';
export const THEMES: Theme[] = ['green', 'amber', 'light'];

export type Ctx = {
  /** Run another command as if the visitor typed it. */
  run: (input: string) => void;
  clear: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  navigate: (path: string) => void;
  /** Set when the terminal is open as an overlay inside the 3D room. */
  exit?: () => void;
  /** True only for the first automatic `whoami`, which types itself out. */
  typing?: boolean;
};

export type Command = {
  name: string;
  aliases?: string[];
  description: string;
  usage?: string;
  /** Hidden commands work but are not listed in `help`. */
  hidden?: boolean;
  /** Values for tab completion of the first argument. */
  complete?: () => string[];
  run: (args: string[], ctx: Ctx) => ReactNode | void;
};
