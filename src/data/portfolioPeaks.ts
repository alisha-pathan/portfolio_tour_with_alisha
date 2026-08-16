//src\data\portfolioPeaks.ts

export type Skill = {
  name: string;
  level: number; // retained for type-compat with existing components; no longer rendered as dots — see PeakDetailOverlay skills block
  category: string;
};

export interface Project {
  id: string;
  title: string;
  scope: string;
  description: string;
  tech: string[];
}
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
        // { name: 'Chart.js', level: 4, category: 'Ecosystem & Tooling' },
        // { name: 'Day.js / date-fns', level: 4, category: 'Ecosystem & Tooling' },
        // { name: 'Mermaid', level: 4, category: 'Ecosystem & Tooling' },
        { name: 'Postman', level: 4, category: 'Ecosystem & Tooling' },
        { name: 'Git', level: 4, category: 'Ecosystem & Tooling' },

        // Practices
        // { name: 'Agile / Scrum', level: 4, category: 'Practices' },
        // { name: 'Release-based QA Coordination', level: 4, category: 'Practices' },
        // { name: 'Version Control Workflows', level: 4, category: 'Practices' },
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
    label: 'The Conquered Peaks',
    subtitle: 'Six Expeditions Across Production Systems',
    xPercent: 68,
    eagleX: 72,
    eagleY: 30,
    content: {
      type: 'projects',
      projects: [
        {
          id: 'ai-recruitment',
          title: 'AI Recruitment Automation Platform',
          scope: 'Team Project',
          description:
            "Owned frontend development on an AI-driven recruitment platform end-to-end — both the candidate-facing experience and the internal admin console. Architected the frontend to render streamed LLM responses in real time, including live chunked reasoning output, one of the earliest surfaces on the team to handle streaming model output on the client side. Built 7+ schema-driven modules using React Hook Form and Zod for airtight validation, with shadcn/ui powering a consistent, accessible design system throughout. Standardized API request handling across the platform, cutting down inconsistency and easing long-term maintenance.",
          tech: ['React', 'TypeScript', 'React Hook Form', 'Zod', 'shadcn/ui'],
        },
        {
          id: 'employee-hierarchy',
          title: 'Employee Hierarchy & Directory Platform',
          scope: 'Sole Frontend Owner',
          description:
            "Sole frontend developer on a company-wide employee hierarchy tool built for HR — owned the entire frontend from Figma handoff to production, matching design specs pixel-for-pixel with live data syncing. Engineered a multi-filter search system and role-based access control so HR could securely navigate and manage sensitive org data. Shipped export functionality across standard, tree-structured, and Excel formats. The module performed well enough to be adopted company-wide, later integrated directly into the broader ERP platform — built once, reused everywhere.",
          tech: ['React', 'TypeScript'],
        },
        {
          id: 'ai-chatbot',
          title: 'AI Assistant & Chatbot Platform',
          scope: 'Team Project',
          description:
            "Built and maintained the chatbot experience for an AI assistant product across 3+ major design iterations, engineering smooth handling of streamed responses for a real-time conversational feel. Shipped a Mermaid-based diagram generation feature that turned conversation content directly into visual output. Implemented authentication end-to-end, including automatic access-token refresh, and resolved critical bugs in that flow that were blocking reliable sessions. Centralized token and error handling across the app through Axios interceptors, eliminating repeated auth logic.",
          tech: ['React (JSX)', 'Redux Toolkit', 'Mermaid', 'Axios'],
        },
        {
          id: 'agreements-erp',
          title: 'Enterprise Agreements ERP Platform',
          scope: 'Team Project',
          description:
            "Built core data flows for an enterprise ERP platform directly from SRS specifications, working in close coordination with the tech lead to resolve requirement ambiguities before they hit production. Owned client lifecycle functionality spanning agreement records, master billing, templates, and rate structures. Designed dynamic, configurable templates to support enterprise-scale workflows, and streamlined request handling to keep API logic consistent across a growing number of modules. Delivered data-dense agreement screens — tables, filters, forms, validation, conditional logic — using React Query and Ant Design.",
          tech: ['React (TSX)', 'React Query', 'Ant Design'],
        },
        {
          id: 'asset-management',
          title: 'Asset Management System (AMS)',
          scope: 'Module Owner',
          description:
            "Owned the authentication and role-based authorization module for an internal asset management system, engineering login flows and permission-gated access across 4+ distinct user roles. Extended the platform with additional frontend modules to support internal asset-tracking workflows as the system scaled, using Redux and Tailwind CSS.",
          tech: ['React (TSX)', 'Redux', 'Tailwind CSS'],
        },
        {
          id: 'id-card-system',
          title: 'Employee ID Card & Print Management System',
          scope: 'Team Project',
          description:
            "Engineered a dynamic, template-driven card generation system with in-app printer integration, giving HR self-serve control over employee ID card creation without relying on external tools. Built the frontend using React (TSX), Redux, Axios, and Chart.js, covering both card generation and full record maintenance.",
          tech: ['React (TSX)', 'Redux', 'Axios', 'Chart.js'],
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