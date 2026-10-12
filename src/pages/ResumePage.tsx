import { Link } from 'react-router-dom';
import AboutSection from '../components/sections/AboutSection';
import ContactSection from '../components/sections/ContactSection';
import ExperienceSection from '../components/sections/ExperienceSection';
import ProjectCard from '../components/sections/ProjectCard';
import SkillsSection from '../components/sections/SkillsSection';
import { projects } from '../data/projects';
import { profile } from '../data/profile';
import type { ReactNode } from 'react';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-slate-800 py-8 print:break-inside-avoid-page">
      <h2 className="mb-4 text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function ResumePage() {
  return (
    <div className="resume min-h-full">
      <nav className="no-print sticky top-0 z-10 border-b border-slate-800 bg-ink-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-sm">
          <Link to="/" className="font-semibold text-mint-400">← Home</Link>
          <Link to="/" className="hover:text-mint-400">3D ride</Link>
          <Link to="/terminal" className="hover:text-mint-400">Terminal</Link>
          <span className="flex-1" />
          <a href={profile.resumeUrl} download className="hover:text-mint-400">Download PDF</a>
          <button type="button" onClick={() => window.print()} className="hover:text-mint-400">Print</button>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8">
        <h1 className="sr-only">{profile.name} résumé</h1>
        <AboutSection />
        <Section title="Skills"><SkillsSection /></Section>
        <Section title="Experience"><ExperienceSection /></Section>
        <Section title="Projects">
          <div className="space-y-10">
            {projects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </Section>
        <Section title="Contact"><ContactSection /></Section>
      </main>
    </div>
  );
}
