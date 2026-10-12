import { profile } from '../../data/profile';
import { ExtLink } from './Ui';

export default function ContactSection() {
  return (
    <div>
      <p className="text-slate-300">I'm looking for senior full-stack roles. The quickest way to reach me is email.</p>
      <ul className="mt-4 space-y-2">
        <li>
          <span className="inline-block w-20 text-sm text-slate-400">Email</span>
          <ExtLink href={`mailto:${profile.email}`}>{profile.email}</ExtLink>
        </li>
        {profile.links.map((l) => (
          <li key={l.label}>
            <span className="inline-block w-20 text-sm text-slate-400">{l.label}</span>
            <ExtLink href={l.url}>{l.url.replace(/^https?:\/\/(www\.)?/, '')}</ExtLink>
          </li>
        ))}
        <li>
          <span className="inline-block w-20 text-sm text-slate-400">Résumé</span>
          <ExtLink href={profile.resumeUrl}>Download PDF</ExtLink>
        </li>
      </ul>
    </div>
  );
}
