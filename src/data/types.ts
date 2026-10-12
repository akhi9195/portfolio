export type Link = { label: string; url: string };

export type Profile = {
  name: string;
  handle: string;
  title: string;
  location: string;
  yearsOfExperience: string;
  summary: string;
  bio: string;
  email: string;
  links: Link[];
  avatar: string;
  initials: string;
  resumeUrl: string;
};

export type SkillGroup = { area: string; items: string[] };

export type Role = {
  company: string;
  title: string;
  start: string;
  end: string;
  product?: string;
  tech?: string[];
  highlights: string[];
};

export type Education = { title: string; detail?: string };

export type ProjectSlug = 'helpdesk-api' | 'loopmotion' | 'wild-oasis' | 'game-hub';

export type Project = {
  slug: ProjectSlug;
  name: string;
  pitch: string;
  tags: string[];
  problem?: string;
  built: string[];
  challenge?: { title: string; body: string };
  metrics?: string[];
  stack: string[];
  role: string;
  liveUrl?: string;
  repoUrl: string;
  demo?: { user: string; password: string };
  note?: string;
  media?: { src: string; alt: string }[];
};
