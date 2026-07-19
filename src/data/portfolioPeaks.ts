export type Skill = {
  name: string;
  level: number; // retained for type-compat with existing components; no longer rendered as dots — see PeakDetailOverlay skills block
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
  xPercent: number; // 0–100 horizontal % in the mountain scene
  eagleX: number; // eagle X at this peak (viewport %)
  eagleY: number; // eagle Y at this peak (viewport %)
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
      tagline: 'Turning Figma specs into production interfaces, end to end.',
      bio: `Hi, I'm Alisha — a frontend-focused engineer with over a year of experience building production web applications in React and TypeScript. I've owned features solo, from Figma spec through deployment, and collaborated effectively inside cross-functional Agile teams. I work across state management (Redux, Context API, React Query), REST API integration, and modern UI systems including Ant Design, Tailwind CSS and shadcn/ui. I recently completed Google's 5-Day AI Agents Intensive Course (Kaggle) — I'm actively building toward AI-integrated product development.`,
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
        // Core Stack — daily-driver
        { name: 'React (JSX/TSX)', level: 5, category: 'Core Stack' },
        { name: 'TypeScript', level: 5, category: 'Core Stack' },
        { name: 'JavaScript', level: 5, category: 'Core Stack' },
        { name: 'Redux / Redux Toolkit', level: 5, category: 'Core Stack' },
        { name: 'Context API', level: 5, category: 'Core Stack' },
        { name: 'React Query', level: 5, category: 'Core Stack' },

        // Ecosystem & Tooling
        { name: 'Ant Design', level: 4, category: 'Ecosystem & Tooling' },
        { name: 'Tailwind CSS', level: 4, category: 'Ecosystem & Tooling' },
        { name: 'shadcn/ui', level: 4, category: 'Ecosystem & Tooling' },
        { name: 'Bootstrap', level: 4, category: 'Ecosystem & Tooling' },
        { name: 'React Hook Form', level: 4, category: 'Ecosystem & Tooling' },
        { name: 'Zod', level: 4, category: 'Ecosystem & Tooling' },
        { name: 'Axios', level: 4, category: 'Ecosystem & Tooling' },
        { name: 'Chart.js', level: 4, category: 'Ecosystem & Tooling' },
        { name: 'Day.js / date-fns', level: 4, category: 'Ecosystem & Tooling' },
        { name: 'Mermaid', level: 4, category: 'Ecosystem & Tooling' },
        { name: 'Postman', level: 4, category: 'Ecosystem & Tooling' },
        { name: 'Git', level: 4, category: 'Ecosystem & Tooling' },

        // Practices
        { name: 'Agile / Scrum', level: 4, category: 'Practices' },
        { name: 'Release-based QA Coordination', level: 4, category: 'Practices' },
        { name: 'Version Control Workflows', level: 4, category: 'Practices' },
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
          company: 'IMS Nucleii (IMS Group)',
          duration: 'June 2025 – Present',
          highlights: [
            'Develop frontend modules for agreements, billing, reporting, masters, templates and rate-management workflows using React.js, TypeScript, React Query, Redux and Axios.',
            'Translate Figma designs into responsive, production-ready interfaces using React.js, TypeScript and Ant Design.',
            'Verify feature functionality through self-testing prior to handoff to QA.',
            'Coordinate with backend and QA teams across sprint cycles to validate API behavior, resolve UI defects and deliver release-ready frontend features.',
            'Prepare technical interview material and conduct screening interviews for fresher/junior frontend candidates.',
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
          id: 'ai-recruitment',
          title: 'AI Recruitment Automation Platform',
          problem:
            'Recruiters needed a streamlined, AI-driven way to move candidates through the hiring pipeline, with both a candidate-facing experience and an internal admin view.',
          role: 'Built both the candidate-facing and admin-facing interfaces as part of the frontend team.',
          tech: ['React', 'TypeScript', 'React Hook Form', 'Zod', 'shadcn/ui'],
          features: [
            'Handled streamed LLM responses on the frontend, including chunked reasoning output, for a real-time AI-assisted flow',
            'Dynamic, schema-driven forms across 7+ modules built with React Hook Form and Zod',
            'shadcn/ui components used throughout for a consistent, accessible design system',
            'Standardized API request handling across the application for reliability',
          ],
          impact:
            'Powered a real-time, AI-assisted recruitment journey end to end — one of the first frontend surfaces on the team to handle live streamed model output.',
        },
        {
          id: 'ai-chatbot',
          title: 'AI Assistant & Chatbot Platform',
          problem:
            'The product needed a chatbot experience capable of handling streamed responses smoothly, plus a way to generate diagrams from conversation content.',
          role: 'Developed and maintained the chatbot feature and reusable common components across 3+ design iterations.',
          tech: ['React (JSX)', 'Redux Toolkit', 'Mermaid', 'Axios'],
          features: [
            'Streamed response handling for a responsive, real-time chat feel',
            'Mermaid-based diagram generation feature',
            'Implemented authentication, including automatic access-token refresh',
            'Centralized token and error handling across the application via Axios interceptors',
          ],
          impact:
            'Resolved critical bugs in the authentication flow and shipped through 3+ iterations as the product design evolved.',
        },
        {
          id: 'agreements-erp',
          title: 'Enterprise Agreements ERP Platform',
          problem:
            'The business needed ERP-style master and transaction data flows implemented directly from SRS/documentation specifications, with several requirement ambiguities to resolve along the way.',
          role: 'Implemented data flows and coordinated directly with the tech lead to resolve requirement ambiguities.',
          tech: ['React (TSX)', 'React Query', 'Ant Design'],
          features: [
            'Managed client lifecycle functionality: agreement records, master billing, templates and rate structures',
            'Designed dynamic templates to support configurable enterprise workflows',
            'Data-heavy agreement screens with tables, filters, forms, validations and conditional workflows',
            'Streamlined request handling to keep API logic consistent across modules',
          ],
          impact:
            'Delivered a configurable workflow system that kept API and UI logic consistent across multiple enterprise modules.',
        },
        {
          id: 'employee-hierarchy',
          title: 'Employee Hierarchy & Directory Platform',
          problem:
            'HR had no live, navigable view of the company-wide reporting structure, and needed a way to search, filter and export it securely.',
          role: 'Sole frontend developer — matched Figma specifications precisely with live data syncing.',
          tech: ['React', 'TypeScript'],
          features: [
            'Multi-filter search system for navigating employee data',
            'Role-based access control for secure HR management',
            'File export supporting standard, tree-structured and Excel formats',
          ],
          impact:
            'Delivered a reusable module that was later integrated into the broader ERP platform — built once, adopted company-wide.',
        },
        {
          id: 'asset-management',
          title: 'Asset Management System (AMS)',
          problem:
            'Internal asset tracking needed secure, role-gated access as the system grew to support more workflows.',
          role: 'Owned the authentication and role-based authorization module.',
          tech: ['React (TSX)', 'Redux', 'Tailwind CSS'],
          features: [
            'Login flows and permission-based access control across 4+ user roles',
            'Extended the system with additional frontend modules for asset tracking',
          ],
          impact:
            'Established the access-control foundation the rest of the AMS frontend was built on.',
        },
        {
          id: 'id-card-system',
          title: 'Employee ID Card & Print Management System',
          problem:
            'HR needed an in-app way to generate, print and manage employee ID cards without relying on external tools.',
          role: 'Engineered dynamic card templates and the printer-integrated system.',
          tech: ['React (TSX)', 'Redux', 'Axios', 'Chart.js'],
          features: [
            'Dynamic, templated card generation',
            'In-app printing integration',
            'Record maintenance and data updates',
          ],
          impact:
            'Gave HR direct, self-serve control over card generation and record updates.',
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
          icon: '🏗️',
          title: 'End-to-End Ownership',
          description:
            'Sole frontend owner of the Employee Hierarchy platform — from Figma spec through to live data syncing.',
        },
        {
          icon: '♻️',
          title: 'Built for Reuse',
          description:
            'Delivered a module that was later adopted into the broader company ERP platform, not just a one-off feature.',
        },
        {
          icon: '🤖',
          title: 'Real-Time AI Integration',
          description:
            'Handled streamed, chunked LLM reasoning output on the frontend to power a live AI-assisted recruitment flow.',
        },
        {
          icon: '🔐',
          title: 'Owned Production Auth',
          description:
            'Implemented automatic access-token refresh and resolved critical bugs in a live authentication flow.',
        },
        {
          icon: '🧩',
          title: 'Systems Thinking',
          description:
            'Built 7+ schema-driven dynamic forms on a consistent design system, rather than one-off screens per module.',
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
        { label: 'Download Resume', url: '#', icon: '📄' }, // TODO: wire up real resume link later
        { label: 'LinkedIn Profile', url: 'https://linkedin.com/in/alisha-pathan', icon: '💼' },
        { label: 'GitHub Profile', url: 'https://github.com/alisha-pathan', icon: '🐙' },
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
      email: '[email protected]',
      linkedin: 'https://linkedin.com/in/alisha-pathan',
      github: 'https://github.com/alisha-pathan',
      message:
        "I'm open to frontend engineering roles and interesting React/TypeScript projects. If you're building something great, let's talk.",
    },
  },
];