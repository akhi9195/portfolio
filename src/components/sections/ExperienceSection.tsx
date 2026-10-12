import { education } from '../../data/education';
import { recognition, roles } from '../../data/experience';
import { SubHeading } from './Ui';

export default function ExperienceSection() {
  return (
    <div>
      <ol className="space-y-6 border-l border-slate-700 pl-5">
        {roles.map((r) => (
          <li key={r.company} className="relative">
            <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-ink-900 bg-mint-400" aria-hidden />
            <p className="font-semibold">
              {r.company} <span className="font-normal text-slate-400">· {r.title}</span>
            </p>
            <p className="text-sm text-slate-400">
              {r.start} – {r.end}
              {r.product ? ` · ${r.product}` : ''}
            </p>
            {r.tech && <p className="mt-1 text-xs text-slate-400">Tech: {r.tech.join(', ')}</p>}
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-slate-300">
              {r.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <SubHeading>Recognition</SubHeading>
      <ul className="list-disc space-y-1 pl-4 text-sm text-slate-300">
        {recognition.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <SubHeading>Education & certification</SubHeading>
      <ul className="space-y-1 text-sm text-slate-300">
        {education.map((e) => (
          <li key={e.title}>
            <span className="font-medium text-slate-100">{e.title}</span>
            {e.detail ? ` · ${e.detail}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
