import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { profile } from '../../data/profile';
import { useCommandHistory } from '../../hooks/useCommandHistory';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import { storage } from '../../lib/storage';
import { parse } from '../../terminal/parser';
import { allNames, complete, findCommand } from '../../terminal/registry';
import { RunContext } from '../../terminal/runContext';
import { suggest } from '../../terminal/suggest';
import { Cmd, Dim, Err } from '../../terminal/Out';
import { THEMES, type Ctx, type Theme } from '../../terminal/types';

type Line = { id: number; input?: string; output?: ReactNode };

const PROMPT = `${profile.handle}@portfolio:~$`;
const QUICK = ['about', 'projects', 'experience', 'skills', 'contact', 'resume', 'help'];
const BOOT = [
  'Booting portfolio v2.0 …',
  'Loading profile ............ ok',
  'Mounting /projects ......... 4 found',
  'Starting command engine .... ok',
  'Ready.',
];

type Props = {
  /** When set, the terminal is an overlay inside the 3D room and `exit` closes it. */
  onExit?: () => void;
  initialCmd?: string;
};

export default function Terminal({ onExit, initialCmd }: Props) {
  const navigate = useNavigate();
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [theme, setThemeState] = useState<Theme>(() => {
    const t = storage.get('term.theme') as Theme | null;
    return t && THEMES.includes(t) ? t : 'green';
  });
  const [boot, setBoot] = useState<string[] | null>(null);
  const history = useCommandHistory();
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const started = useRef(false);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    storage.set('term.theme', t);
  }, []);

  const runRef = useRef<(raw: string, opts?: { typing?: boolean; silent?: boolean }) => void>(() => {});

  const run = useCallback(
    (raw: string, opts: { typing?: boolean; silent?: boolean } = {}) => {
      const text = raw.trim();
      const id = nextId.current++;
      if (!text) {
        setLines((l) => [...l, { id, input: '' }]);
        return;
      }
      if (!opts.silent) history.push(text);
      const { name, args } = parse(text);
      // `ls projects` and `ls` both list projects.
      const cmd = findCommand(name);
      if (!cmd) {
        const guess = suggest(name, allNames());
        setLines((l) => [
          ...l,
          {
            id,
            input: text,
            output: (
              <span>
                <Err>command not found: {name}.</Err>{' '}
                {guess ? (
                  <>
                    <Dim>Did you mean </Dim>
                    <Cmd cmd={guess} />
                    <Dim>?</Dim>
                  </>
                ) : (
                  <>
                    <Dim>Type </Dim>
                    <Cmd cmd="help" />
                    <Dim> to see all commands.</Dim>
                  </>
                )}
              </span>
            ),
          },
        ]);
        return;
      }
      let cleared = false;
      const ctx: Ctx = {
        run: (c) => runRef.current(c),
        clear: () => {
          cleared = true;
          setLines([]);
        },
        theme,
        setTheme,
        navigate: (p) => navigate(p),
        exit: onExit,
        typing: opts.typing,
      };
      const output = cmd.run(args, ctx);
      if (!cleared) setLines((l) => [...l, { id, input: text, output: output ?? undefined }]);
    },
    [history, navigate, onExit, setTheme, theme],
  );
  runRef.current = run;

  // First load: boot sequence on the first ever visit, then `whoami`. Deep links run their command.
  // Scheduled with a timeout so React StrictMode's mount/unmount/mount in dev doesn't run it twice.
  const isOverlay = !!onExit;
  useEffect(() => {
    let timer = 0;
    let finished = false;
    const finishBoot = () => {
      if (finished) return;
      finished = true;
      window.clearInterval(timer);
      setBoot(null);
      runRef.current('whoami', { typing: true, silent: true });
    };
    const skip = () => finishBoot();
    const start = window.setTimeout(() => {
      if (started.current) return;
      started.current = true;
      const cmd = initialCmd ?? new URLSearchParams(window.location.search).get('cmd') ?? undefined;
      const firstVisit = !storage.get('term.booted');
      storage.set('term.booted', '1');
      if (cmd) {
        runRef.current(cmd, { silent: true });
        return;
      }
      if (!firstVisit || prefersReducedMotion() || isOverlay) {
        runRef.current('whoami', { silent: true });
        return;
      }
      let i = 0;
      setBoot([]);
      timer = window.setInterval(() => {
        i++;
        setBoot(BOOT.slice(0, i));
        if (i >= BOOT.length) {
          window.clearInterval(timer);
          window.setTimeout(finishBoot, 250);
        }
      }, 280);
      window.addEventListener('keydown', skip, { once: true });
      window.addEventListener('pointerdown', skip, { once: true });
    }, 0);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [initialCmd, isOverlay]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [lines, boot]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const v = history.step(-1);
      if (v !== undefined) setInput(v);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const v = history.step(1);
      if (v !== undefined) setInput(v);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setInput((v) => complete(v));
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === 'Escape' && onExit) {
      onExit();
    }
  };

  const quick = (c: string) => {
    run(c);
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <RunContext.Provider value={(c) => quick(c)}>
      <div
        className="term flex h-full flex-col font-mono text-[13px] leading-relaxed sm:text-sm"
        data-theme={theme}
        style={{ background: 'var(--term-bg)', color: 'var(--term-fg)' }}
      >
        <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: 'color-mix(in srgb, var(--term-fg) 20%, transparent)' }}>
          <span className="h-3 w-3 rounded-full bg-red-400/80" aria-hidden />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" aria-hidden />
          <span className="h-3 w-3 rounded-full bg-green-400/80" aria-hidden />
          <span className="ml-2 truncate" style={{ color: 'var(--term-dim)' }}>{PROMPT.replace(':~$', '')} — terminal</span>
          <span className="flex-1" />
          {onExit ? (
            <button type="button" onClick={onExit} className="rounded px-2 py-0.5 hover:underline" style={{ color: 'var(--term-link)' }}>
              ✕ Close
            </button>
          ) : (
            <nav className="flex gap-3 text-xs sm:text-sm">
              <a href="/" style={{ color: 'var(--term-link)' }}>3D ride</a>
              <a href="/resume" style={{ color: 'var(--term-link)' }}>Plain résumé</a>
            </nav>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-5" onClick={(e) => {
          if ((e.target as HTMLElement).closest('a,button')) return;
          if (window.getSelection()?.toString()) return;
          inputRef.current?.focus({ preventScroll: true });
        }}>
          {boot && (
            <div aria-hidden>
              {boot.map((b) => <div key={b} style={{ color: 'var(--term-dim)' }}>{b}</div>)}
              <div style={{ color: 'var(--term-dim)' }} className="mt-1 text-xs">(press any key to skip)</div>
            </div>
          )}
          <div role="log" aria-live="polite" aria-label="Terminal output" data-testid="term-output">
            {lines.map((l) => (
              <div key={l.id} className="mb-3">
                {l.input !== undefined && (
                  <div>
                    <span style={{ color: 'var(--term-accent)' }}>{PROMPT}</span> {l.input}
                  </div>
                )}
                {l.output && <div className="mt-1">{l.output}</div>}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="term-input" className="shrink-0" style={{ color: 'var(--term-accent)' }}>
              {PROMPT}
              <span className="sr-only"> Type a command</span>
            </label>
            <input
              id="term-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              className="min-w-0 flex-1 bg-transparent outline-none focus-visible:outline-none"
              style={{ color: 'var(--term-fg)', caretColor: 'var(--term-accent)' }}
            />
          </div>
          <div ref={endRef} />
        </div>
        <div className="flex gap-2 overflow-x-auto border-t px-3 py-2" style={{ borderColor: 'color-mix(in srgb, var(--term-fg) 20%, transparent)' }}>
          {QUICK.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => quick(c)}
              className="shrink-0 rounded border px-3 py-1.5"
              style={{ borderColor: 'color-mix(in srgb, var(--term-fg) 35%, transparent)', color: 'var(--term-fg)' }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </RunContext.Provider>
  );
}
