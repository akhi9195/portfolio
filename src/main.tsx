import React from 'react';
import ReactDOM from 'react-dom/client';
import Terminal from './components/Terminal';
import './index.css';

// Deep link: /?cmd=cd%20helpdesk-api runs that command on load.
const initial = new URLSearchParams(window.location.search).get('cmd') ?? undefined;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Terminal initial={initial} />
  </React.StrictMode>,
);
