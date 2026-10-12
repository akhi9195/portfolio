import { profile } from '../../data/profile';
import Avatar from './Avatar';

export default function AboutSection() {
  return (
    <div>
      <div className="flex items-center gap-4">
        <Avatar size={80} />
        <div>
          <p className="text-xl font-semibold">{profile.name}</p>
          <p className="text-slate-300">{profile.title}</p>
          <p className="text-sm text-slate-400">
            {profile.location} · {profile.yearsOfExperience}
          </p>
        </div>
      </div>
      <p className="mt-4 font-medium text-slate-100">{profile.summary}</p>
      <p className="mt-3 leading-relaxed text-slate-300">{profile.bio}</p>
    </div>
  );
}
