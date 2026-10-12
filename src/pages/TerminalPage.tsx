import { useEffect } from 'react';
import Terminal from '../components/terminal/Terminal';

export default function TerminalPage() {
  useEffect(() => {
    document.title = 'Terminal · Akhilesh Bashettiwar';
  }, []);
  return (
    <main className="h-[100dvh]">
      <h1 className="sr-only">Akhilesh Bashettiwar: terminal portfolio</h1>
      <Terminal />
    </main>
  );
}
