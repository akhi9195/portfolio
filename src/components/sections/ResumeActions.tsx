import { Link } from 'react-router-dom';
import { profile } from '../../data/profile';

export default function ResumeActions() {
  return (
    <div>
      <p className="text-slate-300">Prefer a standard résumé? Download the PDF, or open the plain page, which prints cleanly.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href={profile.resumeUrl} download className="rounded-lg bg-mint-400 px-4 py-2 font-semibold text-ink-950 hover:bg-mint-500">
          Download PDF
        </a>
        <Link to="/resume" className="rounded-lg border border-slate-500 px-4 py-2 font-semibold hover:bg-slate-800">
          Open plain résumé
        </Link>
      </div>
    </div>
  );
}
