import type { Role } from './types';

export const roles: Role[] = [
  {
    company: 'ServiceNow',
    title: 'Senior Software Engineer',
    start: 'Oct 2022',
    end: 'Present',
    product: 'Instance Observer',
    highlights: [
      'Built and deployed two production AI agents on the Now Assist Platform: IO Help Agent, which answers user questions from the product knowledge base, and IO Alert Toggle Agent, which pauses, resumes, enables or disables monitoring alerts through the IO Agent Orchestrator.',
      'Built an AI workflow that turns acceptance criteria and test cases into framework-compliant Playwright scripts; it generated 300+ scripts and was adopted by other engineers.',
      'Built an AI failure-analysis agent that matches team-wide test reports against historical error buckets to find probable root causes.',
      'Developed frontend features with ServiceNow Seismic and a Spring Boot REST endpoint, from requirements through merge.',
    ],
  },
  {
    company: 'Apple Online Store (via TCS)',
    title: 'Senior Software Engineer',
    start: 'Mar 2021',
    end: 'Oct 2022',
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
    start: 'Dec 2016',
    end: 'Feb 2021',
    product: 'Oracle Textura Construction Management',
    tech: ['React', 'Java', 'Spring Boot', 'Selenium', 'Jenkins', 'REST Assured'],
    highlights: [
      'Built and maintained web application features with React on the front end and Java and Spring Boot on the back end.',
      'Designed and enhanced RESTful APIs and service-layer business logic, and integrated them with React components.',
      'Wrote unit tests to prevent regressions, and supported releases and production issue resolution.',
    ],
  },
  {
    company: 'Wells Fargo',
    title: 'Senior Quality Analyst',
    start: 'Jun 2014',
    end: 'Dec 2016',
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
