import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { commands } from "../terminal/commands";
import { execute } from "../terminal/engine";
import { CLEAR, type Theme } from "../terminal/types";
import { profile, projects } from "../data/content";

type Line = { id: number; echo?: string; node?: ReactNode };

const THEMES: Theme[] = ["green", "amber", "light"];
const QUICK = [
  "about",
  "projects",
  "experience",
  "skills",
  "contact",
  "resume",
];

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem("theme");
    if (saved && (THEMES as string[]).includes(saved)) return saved as Theme;
  } catch {
    // Storage can be blocked (private mode); fall back to the default.
  }
  return "green";
}

export default function Terminal({ initial }: { initial?: string }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [focused, setFocused] = useState(false);
  const history = useRef<string[]>([]);
  const historyPos = useRef(-1);
  const nextId = useRef(0);
  const started = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Ignore: the theme still applies for this visit.
    }
  }, [theme]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [lines]);

  // Runs one line: echoes it, then prints the result (or clears the screen).
  function runLine(raw: string) {
    const text = raw.trim();
    if (text) {
      history.current.push(text);
    }
    historyPos.current = -1;

    if (!text) {
      setLines((l) => [...l, { id: ++nextId.current, echo: "" }]);
      return;
    }

    const result = execute(text, { run: runLine, setTheme });
    if (result === CLEAR) {
      setLines([]);
      return;
    }
    const echo: Line = { id: ++nextId.current, echo: text };
    const out: Line = { id: ++nextId.current, node: result };
    setLines((l) => [...l, echo, out]);
  }

  // Run the requested command (from ?cmd=) or whoami on first load only.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    runLine(initial ?? "whoami");
    // On desktop, focus the prompt so visitors can type straight away.
    // Skipped on touch screens so the keyboard doesn't pop up on load.
    if (window.matchMedia?.("(pointer: fine)").matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function complete() {
    const parts = value.split(" ");
    const word = parts[parts.length - 1].toLowerCase();
    let pool: string[] = [];
    if (parts.length === 1) {
      pool = commands.flatMap((c) => [c.name, ...(c.aliases ?? [])]);
    } else if (["cd", "open"].includes(parts[0]) && parts.length === 2) {
      pool = projects.map((p) => p.slug);
    }
    const matches = pool.filter((p) => p.startsWith(word));

    if (matches.length === 1) {
      const completed = [...parts.slice(0, -1), matches[0]].join(" ");
      setValue(parts.length === 1 ? `${completed} ` : completed);
    } else if (matches.length > 1) {
      setLines((l) => [
        ...l,
        {
          id: ++nextId.current,
          node: <span className="text-dim">{matches.join("   ")}</span>,
        },
      ]);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.current.length === 0) return;
      historyPos.current =
        historyPos.current === -1
          ? history.current.length - 1
          : Math.max(0, historyPos.current - 1);
      setValue(history.current[historyPos.current]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyPos.current === -1) return;
      historyPos.current++;
      if (historyPos.current >= history.current.length) {
        historyPos.current = -1;
        setValue("");
      } else {
        setValue(history.current[historyPos.current]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    runLine(value);
    setValue("");
  }

  return (
    <div
      className="flex min-h-screen justify-center bg-bg p-4 md:p-10"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="w-full max-w-3xl rounded-lg border border-line shadow-xl">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2 text-xs text-dim">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="ml-3">{profile.handle}:~</span>
          <label className="ml-auto flex items-center gap-2">
            <span className="sr-only">Colour theme</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              className="rounded border border-line bg-bg px-1 text-dim"
            >
              {THEMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          role="log"
          aria-live="polite"
          className="min-h-[50vh] max-h-[70vh] space-y-3 overflow-y-auto px-4 py-4 text-sm leading-relaxed md:text-base"
        >
          {lines.map((l) =>
            l.echo !== undefined ? (
              <div key={l.id}>
                <span className="text-dim">{profile.handle}:~$ </span>
                {l.echo}
              </div>
            ) : (
              <div key={l.id}>{l.node}</div>
            ),
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 border-t border-line px-4 py-3"
        >
          <label htmlFor="cmd" className="shrink-0 text-accent">
            {profile.handle}:~$
          </label>
          <div className="relative min-w-0 flex-1">
            <input
              id="cmd"
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-describedby="cmd-hint"
              className={`w-full bg-transparent text-term outline-none ${value ? "" : "caret-transparent"}`}
            />
            {/* Blinking block cursor + hint while the prompt is empty, so visitors know they can type. */}
            {!value && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-3 overflow-hidden whitespace-nowrap"
              >
                <span className="cursor-blink inline-block h-[1.15em] w-[0.15em] bg-term" />
                <span className={`text-dim ${focused ? "opacity-60" : ""}`}>
                  <span className="hidden sm:inline">
                    type a command, e.g. help, or click one below
                  </span>
                  <span className="sm:hidden">type help</span>
                </span>
              </div>
            )}
          </div>
          <span id="cmd-hint" className="sr-only">
            Type a command such as help, then press Enter.
          </span>
        </form>

        <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3 text-xs">
          <span className="text-dim">try:</span>
          {QUICK.map((c) => (
            <button
              key={c}
              onClick={() => runLine(c)}
              className="rounded border border-line px-2 py-1 hover:underline"
            >
              {c}
            </button>
          ))}
          <span className="ml-auto self-center text-dim">
            Tab completes · ↑↓ history · type help
          </span>
        </div>
      </div>
    </div>
  );
}
