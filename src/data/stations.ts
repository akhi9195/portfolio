export type StationId = 'about' | 'skills' | 'experience' | 'projects' | 'contact' | 'terminal' | 'resume';

export type StationInfo = {
  id: StationId;
  number?: 1 | 2 | 3 | 4 | 5;
  label: string;
  hint: string;
};

/** Numbered stations go clockwise around the room from the spawn point. */
export const stations: StationInfo[] = [
  { id: 'about', number: 1, label: 'About', hint: 'Who I am' },
  { id: 'skills', number: 2, label: 'Skills', hint: 'What I work with' },
  { id: 'experience', number: 3, label: 'Experience', hint: 'Where I have worked' },
  { id: 'projects', number: 4, label: 'Projects', hint: 'Four things I built' },
  { id: 'contact', number: 5, label: 'Contact', hint: 'Get in touch' },
  { id: 'terminal', label: 'Terminal', hint: 'Explore by typing commands' },
  { id: 'resume', label: 'Résumé', hint: 'Download or print' },
];

export const numberedStations = stations.filter((s) => s.number !== undefined);

export const stationInfo = (id: StationId) => stations.find((s) => s.id === id)!;

export const stationTitle = (id: StationId) => {
  const s = stationInfo(id);
  return s.number ? `${s.number} · ${s.label}` : s.label;
};
