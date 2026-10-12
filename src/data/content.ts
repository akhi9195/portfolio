// All portfolio text lives here. Edit this file to change content; no UI code needs touching.

export const profile = {
  name: 'Akhilesh Bashettiwar',
  handle: 'akhilesh@portfolio',
  title: 'Senior Software Engineer',
  location: 'Hyderabad, India',
  experience: '12+ years',
  summary:
    'Senior full-stack engineer: React and TypeScript on the front end, Spring Boot and Express on the back end.',
  bio:
    "I'm a Senior Software Engineer with 12 years of experience building web applications across the stack. On the front end I work with React and TypeScript. On the back end I build secure REST APIs with Spring Boot and services with Node.js and Express. Lately I've been building AI-powered features, including a video generation pipeline that runs long jobs reliably in the background. I'm looking for senior full-stack roles where I can own features end to end.",
  email: 'akhi9195@gmail.com',
  github: 'https://github.com/akhi9195',
  linkedin: 'https://www.linkedin.com/in/akhileshb1991',
  avatar: '/avatar.webp',
  resume: '/resume.pdf',
};

export const skills: { area: string; items: string[] }[] = [
  { area: 'Languages', items: ['Java', 'JavaScript', 'TypeScript', 'SQL', 'Python (basic)'] },
  {
    area: 'Frontend',
    items: [
      'React',
      'Redux',
      'React Query',
      'React Hooks',
      'Context API',
      'React Router',
      'React Hook Form',
      'HTML5',
      'CSS3',
      'Chakra UI',
      'styled-components',
      'ServiceNow Seismic',
    ],
  },
  {
    area: 'Backend & APIs',
    items: ['Spring Boot', 'Spring MVC', 'Spring Security (JWT)', 'Hibernate / JPA', 'JDBC', 'REST APIs', 'Node.js', 'Express', 'J2EE'],
  },
  {
    area: 'AI engineering',
    items: ['AI agents', 'Agent orchestration', 'Now Assist Platform', 'Knowledge base retrieval', 'AI-assisted development (Windsurf)', 'Google Veo', 'Inngest'],
  },
  { area: 'Databases', items: ['PostgreSQL', 'Oracle', 'MongoDB', 'Prisma', 'Flyway', 'Supabase'] },
  { area: 'Testing', items: ['JUnit 5', 'Mockito', 'Testcontainers', 'Playwright', 'Selenium', 'TestNG', 'REST Assured'] },
  { area: 'DevOps & tools', items: ['Git', 'Jenkins', 'Maven', 'Docker', 'CI/CD', 'Vercel', 'Render', 'Sentry', 'Postman'] },
];

export type Role = {
  company: string;
  title: string;
  period: string;
  product?: string;
  highlights: string[];
};

export const experience: Role[] = [
  {
    company: 'ServiceNow',
    title: 'Senior Software Engineer',
    period: 'Oct 2022 – Present',
    product: 'Instance Observer',
    highlights: [
      'Built and deployed two production AI agents on the Now Assist Platform: a help agent that answers product questions from the knowledge base, and an alert agent that pauses, resumes, enables or disables monitoring alerts.',
      'Built an AI workflow that turns acceptance criteria and test cases into framework-compliant Playwright scripts. It generated 300+ scripts and was adopted by other engineers.',
      'Built an AI failure-analysis agent that matches team-wide test reports against historical error buckets to find probable root causes.',
      'Developed frontend features with ServiceNow Seismic and a Spring Boot REST endpoint, from requirements through merge.',
    ],
  },
  {
    company: 'Apple Online Store (via TCS)',
    title: 'Senior Software Engineer',
    period: 'Mar 2021 – Oct 2022',
    product: 'EVA: internal microservices health dashboard',
    highlights: [
      'Designed and built the frontend for EVA, an internal dashboard for monitoring microservice health.',
      'Built reusable React components with Hooks, Context, React Query and Redux, and integrated them with backend APIs.',
      'Turned UI/UX designs and requirements into features, working with tech leads and backend engineers.',
    ],
  },
  {
    company: 'Oracle India',
    title: 'Software Engineer',
    period: 'Dec 2016 – Feb 2021',
    product: 'Oracle Textura Construction Management',
    highlights: [
      'Built and maintained web application features with React on the front end and Java and Spring Boot on the back end.',
      'Designed and enhanced RESTful APIs and service-layer business logic, and integrated them with React components.',
      'Wrote unit tests to prevent regressions, and supported releases and production issue resolution.',
    ],
  },
  {
    company: 'Wells Fargo',
    title: 'Senior Quality Analyst',
    period: 'Jun 2014 – Dec 2016',
    product: 'Offers module, online banking',
    highlights: [
      'Built a reusable Selenium automation framework that was later adopted by other teams.',
      'Wrote Core Java and JDBC utilities for the Offers application.',
      'Ran and analysed a 2,000+ test case regression suite.',
    ],
  },
];

export const recognition: string[] = [
  'Lama Award, ServiceNow',
  'SPOT Award and Achieving Excellence Award, Oracle',
  'Achieving Excellence Award, Wells Fargo',
];

export const education: string[] = [
  'B.Tech, Electronics & Communications Engineering · Arkay College of Engineering, 2011',
  'OCJP: Oracle Certified Java Programmer (Java SE 6)',
];

export type Project = {
  slug: string;
  name: string;
  pitch: string;
  tags: string[];
  problem?: string;
  built: string[];
  challenge?: { title: string; body: string };
  stack: string[];
  role: string;
  repo: string;
  live?: string;
  demo?: { user: string; password: string };
  note?: string;
};

export const projects: Project[] = [
  {
    slug: 'helpdesk-api',
    name: 'HelpDesk API',
    pitch: 'Spring Boot REST API for IT support tickets, with JWT security and role-based access.',
    tags: ['Spring Boot', 'JWT', 'PostgreSQL'],
    problem:
      'IT issues get reported by email or spreadsheet, so requests get lost and nobody can see a ticket’s status or owner. The API serves employees, support staff and admins.',
    built: [
      'Ticket lifecycle (OPEN → IN_PROGRESS → RESOLVED → CLOSED) enforced by a single policy class; support staff are auto-assigned when they start a ticket.',
      'Stateless JWT authentication with role checks (USER, SUPPORT, ADMIN). Users only see their own tickets; other users’ tickets return 404.',
      'Ticket list with status filtering, paging and sorting, with no N+1 queries.',
      'One consistent error format with error codes, plus a trace ID on every response that also appears in the logs.',
      'Demo mode with seeded accounts and a guided walkthrough in Swagger UI.',
    ],
    challenge: {
      title: 'Concurrent updates.',
      body:
        'Two people could act on the same ticket at once, so a stale change could silently overwrite a newer one. I added optimistic locking with a @Version column. A stale update returns 409 CONCURRENT_MODIFICATION, so the client re-reads and retries. I chose this over pessimistic locking because it holds no database locks and avoids deadlocks.',
    },
    stack: [
      'Java 25',
      'Spring Boot 4.1',
      'Spring Security 7',
      'Spring Data JPA',
      'PostgreSQL',
      'Flyway',
      'Testcontainers',
      'Docker',
      'Render',
      'Neon',
    ],
    role: 'Solo. Designed, built, tested and deployed.',
    repo: 'https://github.com/akhi9195/helpdesk-api',
    live: 'https://helpdesk-api-wrlm.onrender.com/swagger-ui/index.html',
    demo: { user: 'user@demo.dev', password: 'User12345' },
    note: 'Free tier: the first request can take about 50 seconds while the server wakes up.',
  },
  {
    slug: 'loopmotion',
    name: 'LoopMotion',
    pitch: 'Demo web app that generates images and videos with AI, with long video jobs handled in the background.',
    tags: ['React', 'Express', 'AI', 'Inngest'],
    problem:
      'Video generation takes 1 to 6 minutes, and simple demos usually skip how to handle that on serverless hosting.',
    built: [
      'AI image generation and AI video generation (Google Veo) from the web interface.',
      'Credit system that deducts credits before each generation starts.',
      'Background pipeline: Inngest runs generation as small steps, and the frontend polls until the video is ready.',
      'Gallery of past generations.',
      'Production deployment on Vercel, with separate API and frontend projects.',
    ],
    challenge: {
      title: 'Jobs longer than the request limit.',
      body:
        'Vercel cuts off requests after 60 seconds. I moved generation into Inngest background steps, so the API responds in under a second, and the frontend checks every 10 seconds until the video is ready.',
    },
    stack: ['React', 'Vite', 'React Router', 'Node.js', 'Express', 'TypeScript', 'PostgreSQL', 'Prisma', 'Google Veo', 'Inngest', 'Sentry', 'Vercel'],
    role: 'Solo. Frontend, backend, background jobs and deployment.',
    repo: 'https://github.com/akhi9195/ugcai',
    live: 'https://ak-loopmotion.vercel.app/',
    note: 'Demo access on request, because each generation uses paid AI credits.',
  },
  {
    slug: 'wild-oasis',
    name: 'The Wild Oasis',
    pitch: 'Internal hotel management app for staff to manage cabins, bookings and guest check-ins.',
    tags: ['React', 'React Query', 'Supabase'],
    problem:
      'Small boutique hotels need one tool where front-desk staff can see bookings, manage cabins and check guests in and out.',
    built: [
      'Staff login, employee-only sign-up, and account settings (name, password, avatar).',
      'Cabin management: create, edit and delete cabins with photo upload, capacity, price and discount.',
      'Filterable, sortable bookings table (All, Unconfirmed, Checked in, Checked out).',
      'Check-in and check-out flow with payment confirmation and optional breakfast add-on.',
      'Staff can book cabins for guests.',
    ],
    challenge: {
      title: 'Keeping views in sync.',
      body:
        'Checking a guest in changes the booking status, which affects the table, its filters and the dashboard. React Query invalidates the affected queries after each change, so the UI refetches fresh data without manual state syncing.',
    },
    stack: ['React', 'React Router', 'React Query', 'React Hook Form', 'Context API', 'styled-components', 'Supabase (Postgres, Auth, Storage)', 'Vercel'],
    role: 'Solo. App flows, React frontend and Supabase integration.',
    repo: 'https://github.com/akhi9195/ak-wild-oasis',
    live: 'https://ak-wild-oasis.vercel.app/',
    demo: { user: 'user2@test.com', password: 'password' },
    note: 'Demo data: 8 cabins and 24 bookings.',
  },
  {
    slug: 'game-hub',
    name: 'Game Hub',
    pitch: 'Video game discovery app for finding games by platform and genre.',
    tags: ['React', 'TypeScript', 'Chakra UI'],
    problem:
      'Gamers who want something new to play often have to search several sites to compare platforms and genres. Game Hub puts those filters in one place.',
    built: [
      'Browsable game list with cover images and details.',
      'Filters by platform and genre.',
      'Search by game name.',
      'Responsive UI with Chakra UI and Framer Motion animations.',
    ],
    stack: ['React 18', 'TypeScript', 'Vite', 'Chakra UI', 'Emotion', 'Framer Motion', 'Axios'],
    role: 'Solo, built as a guided project from Mosh Hamedani’s Ultimate React course.',
    repo: 'https://github.com/akhi9195/game-hub',
    live: 'https://ak-game-hub-react.vercel.app/',
    note: 'A learning project, so there are no user metrics.',
  },
];
