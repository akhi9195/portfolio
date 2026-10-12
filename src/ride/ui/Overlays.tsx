import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import ExperienceSection from '../../components/sections/ExperienceSection';
import ProjectCard from '../../components/sections/ProjectCard';
import SkillsSection from '../../components/sections/SkillsSection';
import Avatar from '../../components/sections/Avatar';
import { roles } from '../../data/experience';
import { profile } from '../../data/profile';
import { projects } from '../../data/projects';
import { skills } from '../../data/skills';
import { SECTIONS, currentBillboard, sectionAnchor, sectionAt, sectionLocal, starsCollected, type SectionId } from '../route';
import { useRide } from '../store';

/** Move the ride to a scroll position (0..1). The ride glides there. */
export function scrollToProgress(p: number) {
  useRide.getState().setTarget(Math.min(1, Math.max(0, p)));
}
export const goTo = (id: SectionId) => scrollToProgress(sectionAnchor(id));

/** Opacity for a section's overlay: fades in over the first 12% and out over the last 12% of its range. */
function useFade(id: SectionId) {
  return useRide((s) => {
    const l = sectionLocal(s.progress, id);
    const inside = sectionAt(s.progress) === id;
    if (!inside) return 0;
    // Home is fully visible at the very top; the others fade in and out.
    const v = id === 'home' ? Math.min(1, (1 - l) / 0.5) : Math.min(1, l / 0.12, (1 - l) / 0.12);
    return Math.round(Math.max(0, v) * 50) / 50;
  });
}

function Fade({ id, children, className = '', style }: { id: SectionId; children: ReactNode; className?: string; style?: CSSProperties }) {
  const o = useFade(id);
  if (o <= 0) return null;
  return (
    <section
      aria-label={SECTIONS.find((s) => s.id === id)!.label}
      data-section={id}
      className={`pointer-events-auto ${className}`}
      // `translate` (not `transform`) so it doesn't cancel Tailwind's centring transforms.
      style={{ opacity: o, translate: `0 ${(1 - o) * 14}px`, ...style }}
    >
      {children}
    </section>
  );
}

const glass = 'rounded-2xl border border-white/25 bg-[rgba(70,40,60,0.38)] text-white shadow-2xl backdrop-blur-md';

function Hero() {
  return (
    <Fade id="home" className="absolute inset-x-0 top-[12vh] text-center !pointer-events-none">
      <h1 className="px-4 text-4xl font-light tracking-[0.1em] text-white drop-shadow-[0_2px_12px_rgba(80,30,40,0.6)] sm:text-6xl sm:tracking-[0.18em]">
        {profile.name}
      </h1>
      <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/85 sm:text-base sm:tracking-[0.5em]">{profile.title}</p>
      <p className="mt-2 text-sm tracking-wide text-white/75">Hussain Sagar · Hyderabad</p>
    </Fade>
  );
}

function ScrollHint() {
  const show = useRide((s) => s.progress < 0.02);
  if (!show) return null;
  return (
    <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-white/90" aria-hidden>
      <span className="text-xs uppercase tracking-[0.4em]">Scroll to ride</span>
      <span className="grid h-9 w-6 place-items-start justify-center rounded-full border-2 border-white/80 pt-1.5">
        <span className="h-2 w-1 animate-bounce rounded-full bg-white motion-reduce:animate-none" />
      </span>
    </div>
  );
}

function About() {
  return (
    <Fade id="about" className={`absolute left-4 right-4 top-[14vh] max-w-xl p-6 sm:left-10 sm:right-auto sm:p-8 ${glass}`}>
      <div className="flex items-center gap-4">
        <Avatar size={64} />
        <div>
          <h2 className="text-2xl font-semibold tracking-wide">About me</h2>
          <p className="text-sm text-white/80">
            {profile.location} · {profile.yearsOfExperience}
          </p>
        </div>
      </div>
      <p className="mt-4 font-medium">{profile.summary}</p>
      <p className="mt-3 text-sm leading-relaxed text-white/90">{profile.bio}</p>
      <p className="mt-4 text-sm text-white/70">Keep scrolling to ride on →</p>
    </Fade>
  );
}

function Skills() {
  const local = useRide((s) => Math.round(sectionLocal(s.progress, 'skills') * 40) / 40);
  const setModal = useRide((s) => s.setModal);
  return (
    <Fade
      id="skills"
      className="absolute right-4 top-[10vh] max-w-md rounded-2xl bg-[radial-gradient(ellipse_at_right,rgba(60,25,45,0.55),rgba(60,25,45,0)_70%)] p-4 text-right sm:right-24"
    >
      <h2 className="mb-3 text-sm uppercase tracking-[0.4em] text-white/80">Skills</h2>
      <ul className="space-y-1.5">
        {skills.map((g, i) => {
          const appear = Math.min(1, Math.max(0, (local - i * 0.07) / 0.1));
          return (
            <li key={g.area} style={{ opacity: appear, transform: `translateX(${(1 - appear) * 30}px)` }}>
              <p className="text-2xl font-semibold tracking-wide text-white drop-shadow-[0_2px_10px_rgba(80,30,40,0.7)] sm:text-3xl">{g.area}</p>
              <p className="text-xs text-white/85 drop-shadow sm:text-sm">{g.items.slice(0, 6).join(' · ')}</p>
            </li>
          );
        })}
      </ul>
      <button type="button" onClick={() => setModal({ kind: 'skills' })} className="mt-4 rounded-full border border-white/60 px-4 py-1.5 text-sm text-white hover:bg-white/15">
        All skills
      </button>
    </Fade>
  );
}

function Experience() {
  const idx = useRide((s) => currentBillboard(s.progress));
  const setModal = useRide((s) => s.setModal);
  const ordered = [...roles].reverse();
  const r = ordered[Math.max(0, idx)];
  return (
    <Fade id="experience" className={`absolute left-3 right-3 top-16 max-w-lg p-4 sm:bottom-10 sm:left-10 sm:right-auto sm:top-auto sm:p-5 ${glass}`}>
      <h2 className="text-xs uppercase tracking-[0.4em] text-white/75">Experience · {Math.max(1, idx + 1)} of {ordered.length}</h2>
      <p className="mt-2 text-xl font-semibold">
        {r.company} <span className="font-normal text-white/80">· {r.title}</span>
      </p>
      <p className="text-sm text-white/75">
        {r.start} – {r.end}
        {r.product ? ` · ${r.product}` : ''}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-white/90">
        {r.highlights.slice(0, 2).map((h, i) => (
          <li key={h} className={i > 0 ? 'hidden sm:list-item' : undefined}>
            {h}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setModal({ kind: 'experience' })} className="mt-3 rounded-full border border-white/60 px-4 py-1.5 text-sm hover:bg-white/15">
        Full experience & education
      </button>
    </Fade>
  );
}

function Projects() {
  const got = useRide((s) => starsCollected(s.progress));
  const setModal = useRide((s) => s.setModal);
  const p = got > 0 ? projects[got - 1] : null;
  return (
    <>
      <Fade id="projects" className="absolute bottom-6 left-1/2 -translate-x-1/2 sm:bottom-auto sm:top-20">
        <p className="flex items-center gap-2 whitespace-nowrap rounded-full bg-[rgba(30,20,40,0.55)] px-4 py-2 text-sm font-semibold text-white backdrop-blur" data-testid="stars">
          <span className="text-amber-300">★</span> {got} / {projects.length} projects collected
        </p>
      </Fade>
      <Fade id="projects" className={`absolute left-3 right-3 top-16 max-w-lg p-4 sm:bottom-10 sm:left-auto sm:right-10 sm:top-auto sm:p-5 ${glass}`}>
        {p ? (
          <>
            <h2 className="text-xs uppercase tracking-[0.4em] text-amber-200">Project {got} unlocked</h2>
            <p className="mt-2 text-2xl font-semibold">{p.name}</p>
            <p className="mt-1 text-sm text-white/90">{p.pitch}</p>
            <p className="mt-2 text-xs text-white/75">{p.tags.join(' · ')}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <button type="button" onClick={() => setModal({ kind: 'project', index: got - 1 })} className="rounded-full bg-amber-300 px-4 py-1.5 font-semibold text-slate-900 hover:bg-amber-200">
                Open project
              </button>
              {p.liveUrl && (
                <a href={p.liveUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/60 px-4 py-1.5 hover:bg-white/15">
                  Live ↗
                </a>
              )}
              <a href={p.repoUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/60 px-4 py-1.5 hover:bg-white/15">
                Code ↗
              </a>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xs uppercase tracking-[0.4em] text-amber-200">Projects</h2>
            <p className="mt-2 text-lg">Ride through the gold stars to unlock my four projects.</p>
          </>
        )}
      </Fade>
    </>
  );
}

function Contact() {
  return (
    <Fade id="contact" className={`absolute left-1/2 top-[8vh] w-[min(92vw,30rem)] -translate-x-1/2 p-7 text-center sm:left-auto sm:right-[9vw] sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0 ${glass}`}>
      <h2 className="text-3xl font-light tracking-[0.12em]">Let's talk</h2>
      <p className="mt-2 text-white/85">I'm looking for senior full-stack roles. Email is the quickest way to reach me.</p>
      <a href={`mailto:${profile.email}`} className="mt-5 block rounded-xl bg-white px-4 py-3 text-lg font-semibold text-[#5a2c43] hover:bg-amber-50">
        {profile.email}
      </a>
      <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
        {profile.links.map((l) => (
          <a key={l.label} href={l.url} target="_blank" rel="noreferrer" className="rounded-full border border-white/60 px-4 py-1.5 hover:bg-white/15">
            {l.label} ↗
          </a>
        ))}
        <a href={profile.resumeUrl} download className="rounded-full border border-white/60 px-4 py-1.5 hover:bg-white/15">
          Résumé PDF
        </a>
      </div>
      <button type="button" onClick={() => scrollToProgress(0)} className="mt-5 text-sm text-white/80 underline underline-offset-4 hover:text-white">
        ↺ Ride again
      </button>
    </Fade>
  );
}

/** Right-edge rail: where you are, and a click to jump anywhere. */
function ProgressRail() {
  const progress = useRide((s) => Math.round(s.progress * 200) / 200);
  const current = useRide((s) => sectionAt(s.progress));
  return (
    <nav aria-label="Sections" className="pointer-events-auto absolute right-3 top-1/2 hidden -translate-y-1/2 sm:block">
      <div className="relative h-72 w-1 rounded-full bg-white/30">
        <div className="absolute left-0 top-0 w-1 rounded-full bg-white" style={{ height: `${progress * 100}%` }} />
        {SECTIONS.map((s) => {
          const at = sectionAnchor(s.id);
          const active = current === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(s.id)}
              className="group absolute -left-2 flex -translate-y-1/2 items-center"
              style={{ top: `${at * 100}%` }}
              aria-label={`Go to ${s.label}`}
              aria-current={active ? 'true' : undefined}
            >
              <span className={`block h-5 w-5 rounded-full border-2 ${active ? 'border-white bg-amber-300' : 'border-white bg-[rgba(60,30,50,0.6)]'}`} />
              <span className={`absolute right-7 whitespace-nowrap rounded-full bg-[rgba(30,20,40,0.6)] px-2.5 py-1 text-xs text-white backdrop-blur ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function Menu() {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <div className="pointer-events-auto absolute right-3 top-3 z-30 flex items-start gap-2">
      <Link to="/resume" className="rounded-full bg-[rgba(30,20,40,0.45)] px-3.5 py-2 text-sm text-white backdrop-blur hover:bg-[rgba(30,20,40,0.65)]">
        Plain view
      </Link>
      <div className="relative">
        <button
          ref={btn}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="ride-menu"
          className="flex items-center gap-2 rounded-full bg-[rgba(30,20,40,0.45)] px-3.5 py-2 text-sm text-white backdrop-blur hover:bg-[rgba(30,20,40,0.65)]"
        >
          <span aria-hidden>☰</span> Menu
        </button>
        {open && (
          <ul id="ride-menu" className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-white/20 bg-[rgba(30,20,40,0.85)] py-1 text-sm text-white shadow-2xl backdrop-blur">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-white/10"
                  onClick={() => {
                    setOpen(false);
                    goTo(s.id);
                  }}
                >
                  {s.label}
                </button>
              </li>
            ))}
            <li className="my-1 border-t border-white/15" />
            <li>
              <Link to="/terminal" className="block px-4 py-2 hover:bg-white/10">
                Terminal
              </Link>
            </li>
            <li>
              <Link to="/resume" className="block px-4 py-2 hover:bg-white/10">
                Plain résumé
              </Link>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

function Modal() {
  const modal = useRide((s) => s.modal);
  const setModal = useRide((s) => s.setModal);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!modal) return;
    const prev = document.activeElement as HTMLElement | null;
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setModal(null);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [modal, setModal]);
  if (!modal) return null;
  const title = modal.kind === 'project' ? 'Project' : modal.kind === 'experience' ? 'Experience' : 'Skills';
  return (
    <div className="pointer-events-auto fixed inset-0 z-40 grid place-items-center bg-black/40 p-3 backdrop-blur-sm" onClick={() => setModal(null)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-testid="modal"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88dvh] w-[min(96vw,44rem)] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-ink-900 text-slate-100 shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-3">
          <h2 className="flex-1 text-lg font-semibold">{title}</h2>
          {modal.kind === 'project' && (
            <span className="flex gap-2">
              <button type="button" className="rounded-lg border border-slate-600 px-3 py-1 text-sm" onClick={() => setModal({ kind: 'project', index: (modal.index + projects.length - 1) % projects.length })}>
                ← Prev
              </button>
              <button type="button" className="rounded-lg border border-slate-600 px-3 py-1 text-sm" onClick={() => setModal({ kind: 'project', index: (modal.index + 1) % projects.length })}>
                Next →
              </button>
            </span>
          )}
          <button ref={close} type="button" onClick={() => setModal(null)} className="rounded-lg px-3 py-1 text-sm text-slate-300 hover:bg-ink-800" aria-label="Close (Esc)">
            ✕ Close
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4" data-own-scroll>
          {modal.kind === 'project' && <ProjectCard project={projects[modal.index]} headingLevel={2} />}
          {modal.kind === 'experience' && <ExperienceSection />}
          {modal.kind === 'skills' && <SkillsSection />}
        </div>
      </div>
    </div>
  );
}

export default function Overlays() {
  const target = useRide((s) => Math.round(s.target * 1000) / 1000);
  return (
    <div className="pointer-events-none fixed inset-0 z-10 select-none [&_a]:select-auto [&_p]:select-text" data-progress={target}>
      <div className="pointer-events-auto absolute left-3 top-3">
        <button type="button" onClick={() => scrollToProgress(0)} className="rounded-full bg-[rgba(30,20,40,0.45)] px-3.5 py-2 text-sm font-semibold tracking-wide text-white backdrop-blur">
          {profile.initials} <span className="hidden font-normal text-white/80 sm:inline">· {profile.name}</span>
        </button>
      </div>
      <Menu />
      <Hero />
      <ScrollHint />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Contact />
      <ProgressRail />
      <Modal />
      <p className="pointer-events-auto absolute bottom-1 left-2 text-[10px] text-white/60">
        Motorbike: “Cafe Racer” by{' '}
        <a href="https://sketchfab.com/milinam2002" target="_blank" rel="noreferrer" className="underline">
          Milin Andrei
        </a>{' '}
        (CC-BY 4.0) · Character: Mixamo
      </p>
    </div>
  );
}
