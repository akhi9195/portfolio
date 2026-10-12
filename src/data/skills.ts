import type { SkillGroup } from './types';

export const skills: SkillGroup[] = [
  { area: 'Languages', items: ['Java', 'JavaScript', 'TypeScript', 'SQL', 'Python (basic)'] },
  {
    area: 'Frontend',
    items: [
      'React', 'Redux', 'React Query', 'React Hooks', 'Context API', 'React Router',
      'React Hook Form', 'HTML5', 'CSS3', 'ServiceNow Seismic', 'Chakra UI',
      'styled-components', 'Framer Motion',
    ],
  },
  {
    area: 'Backend & APIs',
    items: [
      'Spring Boot', 'Spring MVC', 'Spring Security (JWT)', 'Hibernate / JPA', 'JDBC',
      'REST APIs', 'Node.js', 'Express', 'J2EE',
    ],
  },
  {
    area: 'AI engineering',
    items: [
      'AI agents', 'Agent orchestration', 'Now Assist Platform (NAP)', 'Knowledge base retrieval',
      'AI-assisted development (Windsurf)', 'Google Veo', 'Inngest background jobs',
    ],
  },
  { area: 'Databases', items: ['PostgreSQL', 'Oracle', 'MongoDB', 'Prisma', 'Flyway', 'Supabase'] },
  {
    area: 'Testing',
    items: ['JUnit 5', 'Mockito', 'Testcontainers', 'Playwright', 'Selenium', 'TestNG', 'REST Assured'],
  },
  {
    area: 'DevOps & tools',
    items: ['Git', 'Jenkins', 'Maven', 'Docker', 'CI/CD', 'Vercel', 'Render', 'Sentry', 'Postman'],
  },
];
