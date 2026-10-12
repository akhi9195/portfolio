import { useEffect, useState } from 'react';

/** Types text out once. Used only for the first automatic `whoami`. */
export default function Typewriter({ text, speed = 18 }: { text: string; speed?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= text.length) return;
    const id = window.setTimeout(() => setN((v) => v + 1), speed);
    return () => window.clearTimeout(id);
  }, [n, text, speed]);
  return (
    <span>
      <span aria-hidden>{text.slice(0, n)}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
