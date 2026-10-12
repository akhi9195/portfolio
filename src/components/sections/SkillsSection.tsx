import { skills } from '../../data/skills';
import { Tag } from './Ui';

export default function SkillsSection() {
  return (
    <div className="space-y-4">
      {skills.map((g) => (
        <section key={g.area}>
          <h3 className="mb-1.5 text-sm font-semibold text-slate-200">{g.area}</h3>
          <ul className="flex flex-wrap gap-1.5">
            {g.items.map((s) => (
              <li key={s}>
                <Tag>{s}</Tag>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
