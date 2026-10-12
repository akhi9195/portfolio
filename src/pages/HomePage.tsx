import { Suspense, lazy, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { profile } from '../data/profile';
import { hasWebGL } from '../hooks/useWebGL';
import { useRide } from '../ride/store';

const RideExperience = lazy(() => import('../ride/RideExperience'));

/** Line drawing of Hyderabad: Buddha statue, Charminar, Cyber Towers, Golconda-style dome. */
function Skyline() {
  return (
    <svg viewBox="0 0 360 120" className="mx-auto w-[min(86vw,420px)]" fill="none" stroke="#6b4b5c" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
      {/* Buddha on pedestal */}
      <path d="M40 112 h28 M44 112 v-8 h20 v8 M47 104 q7 -5 14 0" />
      <path d="M48 99 q-2 -22 2 -40 q4 -6 8 0 q4 18 2 40 z" />
      <circle cx="54" cy="53" r="4.5" />
      <path d="M59 70 l7 -9" />
      {/* Charminar */}
      <path d="M120 112 v-62 M128 112 v-62 M200 112 v-62 M208 112 v-62" />
      <path d="M118 50 h12 M198 50 h12 M119 72 h10 M199 72 h10 M119 90 h10 M199 90 h10" />
      <path d="M121 50 q3 -12 3 -14 q0 2 3 14 M201 50 q3 -12 3 -14 q0 2 3 14" />
      <path d="M124 36 v-4 M204 36 v-4" />
      <path d="M128 112 h72 M128 78 h72 M128 66 h72 M128 58 h72" />
      <path d="M148 112 v-20 q16 -22 32 0 v20" />
      <path d="M134 74 q4 -6 8 0 M146 74 q4 -6 8 0 M158 74 q4 -6 8 0 M170 74 q4 -6 8 0 M182 74 q4 -6 8 0" />
      {/* Cyber Towers */}
      <path d="M250 112 v-50 q30 -12 60 0 v50" />
      <path d="M250 74 q30 -12 60 0 M250 86 q30 -12 60 0 M250 98 q30 -12 60 0" />
      <path d="M280 56 v-16" />
      {/* Golconda dome */}
      <path d="M325 112 v-18 h22 v18 M326 94 q10 -18 20 0" />
      <path d="M10 112 h340" />
    </svg>
  );
}

export default function HomePage() {
  const [webgl] = useState(hasWebGL);
  const [failed, setFailed] = useState(false);
  const loaded = useRide((s) => s.loaded);
  const started = useRide((s) => s.started);
  const start = useRide((s) => s.start);
  const ready = loaded >= 100;
  const can3D = webgl && !failed;

  useEffect(() => {
    document.title = `${profile.name} · ${profile.title}`;
  }, []);

  // Debug/deep link: ?start skips the Start screen, ?p=0.5 jumps to a scroll position.
  useEffect(() => {
    if (!ready) return;
    const q = new URLSearchParams(window.location.search);
    if (q.has('start') || q.has('p')) start();
    const p = q.get('p');
    if (p !== null) useRide.getState().setTarget(Math.min(1, Math.max(0, Number(p) || 0)));
  }, [ready, start]);

  return (
    <>
      {can3D && (
        <Suspense fallback={null}>
          <RideExperience onFail={() => setFailed(true)} />
        </Suspense>
      )}
      {!started && (
        <main className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#ebe7e6] px-4 text-[#4a3442]">
          <div className="w-full max-w-lg py-10 text-center">
            <h1 className="sr-only">
              {profile.name}, {profile.title}
            </h1>
            <Skyline />
            {can3D ? (
              <>
                <p className="mt-4 font-mono text-6xl font-light tracking-[0.25em] text-[#4a3442]/25" aria-live="polite" data-testid="loader">
                  {String(Math.round(loaded)).padStart(3, '0')}
                </p>
                <button
                  type="button"
                  disabled={!ready}
                  onClick={start}
                  className="mt-4 w-64 rounded-md bg-[#6b4b5c] py-3 text-lg font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition enabled:hover:bg-[#5a3d4d] disabled:opacity-40"
                >
                  {ready ? 'Start' : 'Loading…'}
                </button>
                <p className="mt-5 text-sm tracking-wide text-[#4a3442]/80">
                  Ride through Hyderabad at sunset. Scroll or swipe to move.
                  <br />
                  Best on a laptop, works on phones too.
                </p>
              </>
            ) : (
              <p className="mt-6 text-[#4a3442]/85">
                {failed ? "The 3D ride couldn't start on this device." : 'The 3D ride needs WebGL, which isn’t available here.'} Everything is in the
                other views.
              </p>
            )}
            <p className="mt-8 text-sm text-[#4a3442]/75">
              <span className="font-semibold text-[#4a3442]">{profile.name}</span> · {profile.title}
            </p>
            <p className="mt-2 text-sm">
              Prefer reading?{' '}
              <Link to="/resume" className="font-semibold underline underline-offset-4">
                Plain résumé
              </Link>{' '}
              ·{' '}
              <Link to="/terminal" className="font-semibold underline underline-offset-4">
                Terminal
              </Link>
            </p>
          </div>
        </main>
      )}
    </>
  );
}
