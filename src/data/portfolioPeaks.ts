export type Skill = {
  name: string;
  level: number; // 1-5
  category: string;
};

export type Project = {
  id: string;
  title: string;
  problem: string;
  role: string;
  tech: string[];
  features: string[];
  impact: string;
};

export type PeakContent =
  | { type: 'origin'; bio: string; title: string; tagline: string }
  | { type: 'skills'; skills: Skill[] }
  | { type: 'experience'; roles: { company: string; duration: string; highlights: string[] }[] }
  | { type: 'projects'; projects: Project[] }
  | { type: 'impact'; achievements: { icon: string; title: string; description: string }[] }
  | { type: 'resume'; links: { label: string; url: string; icon: string }[] }
  | { type: 'contact'; email: string; linkedin: string; github: string; message: string };

export type Peak = {
  id: string;
  label: string;
  subtitle: string;
  xPercent: number;  // 0–100 horizontal % in the mountain scene
  eagleX: number;    // eagle X at this peak (viewport %)
  eagleY: number;    // eagle Y at this peak (viewport %)
  content: PeakContent;
};

export const PEAKS: Peak[] = [
  {
    id: 'origin',
    label: 'Origin Peak',
    subtitle: 'Who I Am',
    xPercent: 12,
    eagleX: 15,
    eagleY: 45,
    content: {
      type: 'origin',
      title: 'React & TypeScript Frontend Engineer',
      tagline: 'Building Enterprise Web Applications with precision and craft.',
      bio: `Hi, I'm Alisha — a frontend engineer specialising in React, TypeScript, and enterprise-scale UI systems. I've spent my career turning complex business requirements into clean, reliable interfaces that real users depend on daily. I thrive at the intersection of engineering rigour and great user experience.`,
    },
  },
  {
    id: 'skills',
    label: 'Skills Peak',
    subtitle: 'Technical Stack',
    xPercent: 30,
    eagleX: 78,
    eagleY: 35,
    content: {
      type: 'skills',
      skills: [
        { name: 'React', level: 5, category: 'Framework' },
        { name: 'TypeScript', level: 5, category: 'Language' },
        { name: 'JavaScript', level: 5, category: 'Language' },
        { name: 'Tailwind CSS', level: 4, category: 'Styling' },
        { name: 'Ant Design', level: 4, category: 'UI Library' },
        { name: 'React Query', level: 4, category: 'Data Fetching' },
        { name: 'Redux Toolkit', level: 4, category: 'State Management' },
        { name: 'REST APIs', level: 5, category: 'Integration' },
        { name: 'Vite', level: 4, category: 'Tooling' },
        { name: 'Git', level: 4, category: 'Version Control' },
        { name: 'Framer Motion', level: 3, category: 'Animation' },
        { name: 'Radix UI', level: 3, category: 'Components' },
      ],
    },
  },
  {
    id: 'experience',
    label: 'Experience Peak',
    subtitle: 'Production Work',
    xPercent: 50,
    eagleX: 22,
    eagleY: 40,
    content: {
      type: 'experience',
      roles: [
        {
          company: 'IMS — Enterprise Platform',
          duration: '2+ years',
          highlights: [
            'Built production-grade frontend modules for Agreement, Commercial, and Billing systems used by enterprise clients',
            'Developed complex, multi-step form workflows with advanced validation using React Hook Form and Zod',
            'Integrated 20+ REST API endpoints with React Query, ensuring optimal caching and error handling',
            'Collaborated with backend and QA teams in an Agile environment with 2-week sprint cycles',
            'Led component architecture decisions for the Billing module, reducing code duplication by ~40%',
          ],
        },
      ],
    },
  },
  {
    id: 'projects',
    label: 'Projects Peak',
    subtitle: 'Case Studies',
    xPercent: 68,
    eagleX: 72,
    eagleY: 30,
    content: {
      type: 'projects',
      projects: [
        {
          id: 'billing-wizard',
          title: 'Billing Advice Wizard',
          problem:
            'Billing advisors needed to generate complex billing advice documents through a tedious, error-prone manual process that took 45+ minutes per document.',
          role: 'Led frontend development end-to-end — architecture, implementation, and QA liaison.',
          tech: ['React', 'TypeScript', 'Ant Design', 'React Query', 'React Hook Form', 'Zod'],
          features: [
            '7-step guided wizard with conditional branching logic',
            'Real-time validation with contextual error messages',
            'Auto-save and draft recovery on session loss',
            'PDF preview generation via API integration',
            'Role-based step access control',
          ],
          impact:
            'Reduced billing document creation time from 45 minutes to under 10 minutes. Zero regression bugs reported post-launch.',
        },
        {
          id: 'commercial-rates',
          title: 'Commercial Rate Management',
          problem:
            'Rate schedules were managed in spreadsheets, making it hard to track versions, apply overrides, or audit changes.',
          role: 'Frontend engineer — built the full rate table UI and override system.',
          tech: ['React', 'TypeScript', 'Redux Toolkit', 'Ant Design', 'REST APIs'],
          features: [
            'Dynamic rate matrix table with inline editing',
            'Override management with effective date ranges',
            'Audit trail panel showing change history',
            'Bulk import from CSV with validation feedback',
            'Permission-based edit/view mode switching',
          ],
          impact:
            'Replaced a manual spreadsheet process used by 150+ users. Audit compliance improved significantly.',
        },
        {
          id: 'org-chart',
          title: 'Organisation Chart',
          problem:
            'No visual representation of the reporting structure existed, making it difficult for management to understand team hierarchy.',
          role: 'Sole frontend developer for this module.',
          tech: ['React', 'TypeScript', 'SVG', 'React Query'],
          features: [
            'Interactive SVG org chart with pan & zoom',
            'Click-to-expand node details',
            'Search and highlight path to node',
            'Export to PNG functionality',
            'Live sync with HR system via API',
          ],
          impact: 'Used weekly by 8 department heads to plan resource allocation.',
        },
        {
          id: 'work-reporting',
          title: 'Work Reporting Dashboard',
          problem:
            'Teams had no unified view of project progress, hours logged, and deliverable status.',
          role: 'Built the reporting UI layer and data visualisation components.',
          tech: ['React', 'TypeScript', 'Recharts', 'React Query', 'Ant Design'],
          features: [
            'Date-range filtered report views',
            'Bar, line, and pie chart visualisations',
            'Drill-down from summary to individual line items',
            'Export to Excel via API',
            'Scheduled email report configuration',
          ],
          impact: 'Consolidated 5 separate manual reports into one system, saving management ~3 hours per week.',
        },
        {
          id: 'masters-crud',
          title: 'Masters CRUD System',
          problem:
            'System-wide reference data (lookup tables, configuration values) had no unified admin interface.',
          role: 'Designed and built a reusable, configuration-driven CRUD framework.',
          tech: ['React', 'TypeScript', 'Ant Design', 'React Query', 'REST APIs'],
          features: [
            'Config-driven table and form generation',
            'Supports 30+ entity types from a single codebase',
            'Search, filter, paginate across all entities',
            'Bulk operations with confirmation dialogs',
            'Soft delete with restore capability',
          ],
          impact:
            'Replaced 30 separate admin screens with a single reusable framework, reducing frontend code by ~60%.',
        },
      ],
    },
  },
  {
    id: 'impact',
    label: 'Impact Peak',
    subtitle: 'What I Deliver',
    xPercent: 82,
    eagleX: 28,
    eagleY: 38,
    content: {
      type: 'impact',
      achievements: [
        {
          icon: '⚡',
          title: 'Production-Ready UI',
          description:
            'Every module I built went to production and is used by real enterprise clients with zero critical bugs reported.',
        },
        {
          icon: '♻️',
          title: 'Reusable Component Systems',
          description:
            'Built config-driven component frameworks that served 30+ entity types from a single codebase — cutting code volume by 60%.',
        },
        {
          icon: '🔗',
          title: 'Deep API Integration',
          description:
            'Integrated 20+ REST API endpoints per module with proper caching, optimistic updates, and error boundaries using React Query.',
        },
        {
          icon: '✅',
          title: 'Advanced Validation',
          description:
            'Implemented multi-step form validation with conditional logic, real-time feedback, and server-error reconciliation.',
        },
        {
          icon: '⏱️',
          title: 'Measurable Time Savings',
          description:
            'The Billing Wizard alone reduced a critical manual process from 45 minutes to under 10 — a 78% efficiency gain.',
        },
        {
          icon: '🏗️',
          title: 'Architecture Leadership',
          description:
            'Led component architecture decisions on the Billing module, establishing patterns adopted across the wider frontend team.',
        },
      ],
    },
  },
  {
    id: 'resume',
    label: 'Resume Peak',
    subtitle: 'Download & Connect',
    xPercent: 55,
    eagleX: 65,
    eagleY: 42,
    content: {
      type: 'resume',
      links: [
        { label: 'Download Resume', url: '#', icon: '📄' },
        { label: 'LinkedIn Profile', url: 'https://linkedin.com', icon: '💼' },
        { label: 'GitHub Profile', url: 'https://github.com', icon: '🐙' },
      ],
    },
  },
  {
    id: 'contact',
    label: 'Contact Peak',
    subtitle: 'Hire / Connect',
    xPercent: 75,
    eagleX: 50,
    eagleY: 50,
    content: {
      type: 'contact',
      email: 'alisha@example.com',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      message:
        "I'm open to senior frontend roles, consulting engagements, and interesting projects. If you're building something great with React and TypeScript, let's talk.",
    },
  },
];
