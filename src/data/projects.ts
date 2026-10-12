import type { Project } from './types';

// Order matters: strongest first. The room's four cabinets use this order.
export const projects: Project[] = [
  {
    slug: 'helpdesk-api',
    name: 'HelpDesk API',
    pitch: 'A Spring Boot REST API for IT support tickets, with JWT security and role-based access.',
    tags: ['Spring Boot', 'JWT', 'Role-based access', 'Testcontainers'],
    problem:
      "Employees often report IT issues by email or spreadsheet, so requests get lost and nobody can see a ticket's status or owner. The API serves employees who raise tickets, support staff who resolve them, and admins who manage access.",
    built: [
      'A ticket lifecycle (OPEN → IN_PROGRESS → RESOLVED → CLOSED) enforced by a single policy class, with support staff auto-assigned when they start a ticket',
      "Stateless JWT authentication with role checks (USER, SUPPORT, ADMIN) and ownership rules: users only see their own tickets, and other users' tickets return 404",
      'A ticket list with status filtering, paging, and sorting, with no N+1 queries',
      'One consistent error format with error codes, plus a trace ID on every response that also appears in the logs',
      'A demo mode with seeded accounts and a guided walkthrough in Swagger UI',
    ],
    challenge: {
      title: 'Concurrent updates',
      body: 'Two people could act on the same ticket at once, so a stale status change could silently overwrite a newer one. I added optimistic locking with a @Version column. If the version has changed, the update matches zero rows and the API returns 409 CONCURRENT_MODIFICATION, so the client re-reads and retries. I chose this over pessimistic locking because it holds no database locks and avoids deadlocks; the trade-off is that clients must handle the 409.',
    },
    // TODO: confirm endpoint count (7, or 4 secured + 1 public)
    metrics: [
      '7 endpoints',
      '2 tables',
      '4 Flyway migrations',
      '10 business rules, each with at least one test',
      'Integration tests against real PostgreSQL via Testcontainers',
    ],
    stack: [
      'Java 25', 'Spring Boot 4.1', 'Spring Security 7', 'Spring Data JPA', 'Hibernate 7', 'PostgreSQL',
      'Flyway', 'MapStruct', 'Lombok', 'springdoc-openapi', 'JUnit 5', 'Mockito', 'Testcontainers',
      'Docker', 'Render', 'Neon PostgreSQL',
    ],
    role: 'Solo. Designed, built, tested, and deployed.',
    liveUrl: 'https://helpdesk-api-wrlm.onrender.com/swagger-ui/index.html',
    repoUrl: 'https://github.com/akhi9195/helpdesk-api',
    demo: { user: 'user@demo.dev', password: 'User12345' },
    note: 'Free tier: the first request may take ~50s while the server wakes up.',
  },
  {
    slug: 'loopmotion',
    name: 'LoopMotion',
    pitch: 'An AI media app that generates images and videos, with long video jobs handled reliably in the background.',
    tags: ['AI image & video', 'Express', 'Inngest background jobs'],
    problem:
      'Creative AI tools have to handle generation jobs that take minutes. Most simple demos skip this. LoopMotion shows how to run slow AI work on serverless infrastructure without timeouts.',
    built: [
      'AI image generation and AI video generation (Google Veo) from the web interface',
      'A credit system that deducts credits before each generation starts',
      'A background video pipeline: Inngest runs generation as small steps, and the frontend polls until the video is ready',
      'A gallery of past generations',
      'Production deployment on Vercel, with the API and frontend as separate projects',
    ],
    challenge: {
      title: 'Jobs longer than the request limit',
      body: 'Video generation takes 1 to 6 minutes, but Vercel cuts off requests after 60 seconds. I moved generation into Inngest background steps, so the API responds in under a second, and the frontend checks every 10 seconds until the video is ready.',
    },
    stack: [
      'React', 'Vite', 'React Router', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Prisma',
      'Google Veo', 'Inngest', 'Multer', 'Sentry', 'Vercel',
    ],
    role: 'Solo. Frontend, backend, background jobs, and deployment.',
    liveUrl: 'https://ak-loopmotion.vercel.app/',
    repoUrl: 'https://github.com/akhi9195/ugcai',
    // Demo login intentionally omitted until the demo-account decision is made.
  },
  {
    slug: 'wild-oasis',
    name: 'The Wild Oasis',
    pitch: 'An internal hotel management app for staff to manage cabins, bookings, and guest check-ins.',
    tags: ['Hotel management', 'React Query', 'Supabase'],
    problem:
      'Small boutique hotels need one internal tool where front-desk staff can see bookings, manage cabins, and check guests in and out.',
    built: [
      'Staff authentication: login, employee-only sign-up, and account settings (name, password, avatar)',
      'Cabin management: create, edit, and delete cabins with photo upload, capacity, price, and discount',
      'Booking management: a filterable, sortable table (All, Unconfirmed, Checked in, Checked out)',
      'Check-in and check-out flow with payment confirmation and optional breakfast add-on',
      'Staff can book cabins for guests',
    ],
    challenge: {
      title: 'Keeping views in sync',
      body: 'Checking a guest in changes the booking status, which affects the bookings table, its filters, and the dashboard. I used React Query for server state, so each mutation invalidates the relevant queries and the UI refetches fresh data without manual state syncing.',
    },
    metrics: ['Demo data: 8 cabins, 24 bookings'],
    stack: [
      'React', 'React Router', 'React Query', 'React Hook Form', 'Context API', 'styled-components',
      'Supabase (Postgres, Auth, Storage)', 'Vercel',
    ],
    // TODO: confirm origin wording (course project?) before launch
    role: 'Solo. App flows, React frontend, and Supabase integration.',
    liveUrl: 'https://ak-wild-oasis.vercel.app/',
    repoUrl: 'https://github.com/akhi9195/ak-wild-oasis',
    demo: { user: 'user2@test.com', password: 'password' },
  },
  {
    slug: 'game-hub',
    name: 'Game Hub',
    pitch: 'A video game discovery app for finding games by platform and genre.',
    tags: ['Game discovery', 'React', 'TypeScript', 'Chakra UI'],
    built: [
      'A browsable game list with cover images and details',
      'Filters by platform and genre',
      'Search by game name',
      'A responsive UI with Chakra UI and Framer Motion animations',
    ],
    // TODO: add the real challenge and the game data API name (likely RAWG)
    stack: ['React 18', 'TypeScript 4.9', 'Vite 4', 'Chakra UI', 'Emotion', 'Framer Motion', 'React Icons', 'Axios'],
    role: "Solo, built as a guided project from Mosh Hamedani's Ultimate React course.",
    liveUrl: 'https://ak-game-hub-react.vercel.app/',
    repoUrl: 'https://github.com/akhi9195/game-hub',
  },
];

export const findProject = (slug: string) => projects.find((p) => p.slug === slug.replace(/\/$/, ''));
