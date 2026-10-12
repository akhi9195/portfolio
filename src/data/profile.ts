import type { Profile } from './types';

export const profile: Profile = {
  name: 'Akhilesh Bashettiwar',
  handle: 'akhilesh',
  title: 'Senior Software Engineer',
  location: 'Hyderabad, India',
  yearsOfExperience: '12+ years',
  summary:
    'Senior full-stack engineer: React and TypeScript on the front end, Spring Boot and Express on the back end.',
  bio: "I'm a Senior Software Engineer with 12 years of experience building web applications across the stack. On the front end I work with React and TypeScript. On the back end I build secure REST APIs with Spring Boot and services with Node.js and Express. Lately I've been building AI-powered features, including a video generation pipeline that runs long jobs reliably in the background. I'm looking for senior full-stack roles where I can own features end to end.",
  email: 'akhi9195@gmail.com',
  links: [
    { label: 'GitHub', url: 'https://github.com/akhi9195' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/akhileshb1991' },
  ],
  // Add your resized photo at public/images/avatar.webp. Until then, initials are shown.
  avatar: '/images/avatar.webp',
  initials: 'AB',
  resumeUrl: '/resume.pdf',
};
