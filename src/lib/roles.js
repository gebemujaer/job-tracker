export const ROLES = [
  {
    id: 'tech_sales',
    label: 'Tech Sales / SDR / BDR',
    icon: '📊',
    description: 'Sales development, account executives, revenue roles',
    tags: {
      'Audience gaps': ['dev-audience', 'technical-buyers', 'enterprise-buyers', 'smb-buyers', 'c-suite-buyers'],
      'Tool gaps': ['no-salesNav', 'no-apollo', 'no-outreach', 'no-salesloft', 'no-gong', 'no-cold-call'],
      'Deal size': ['smb-deals', 'mid-market', 'enterprise-deals', 'low-acv', 'high-acv'],
      'Experience gaps': ['no-dev-tools-exp', 'no-us-market', 'no-eu-market', 'no-b2b-exp', 'no-saas-exp'],
      'Risk flags': ['visa-risk', 'us-timezone', 'hybrid-required', 'high-competition', 'early-stage'],
      'Strengths': ['sea-market', 'greenfield-exp', 'async-first', 'whatsapp-outreach', 'high-retention', 'quota-crusher'],
    }
  },
  {
    id: 'engineering',
    label: 'Software Engineering',
    icon: '💻',
    description: 'Frontend, backend, fullstack, DevOps, mobile',
    tags: {
      'Skill gaps': ['no-react', 'no-typescript', 'no-aws', 'no-kubernetes', 'no-system-design', 'no-ml-exp'],
      'Experience gaps': ['no-startup-exp', 'no-remote-exp', 'no-agile-exp', 'junior-level', 'no-open-source'],
      'Risk flags': ['visa-risk', 'timezone-overlap', 'hybrid-required', 'high-competition', 'low-tc'],
      'Interview gaps': ['no-leetcode', 'no-system-design-prep', 'no-portfolio'],
      'Strengths': ['open-source-contrib', 'side-projects', 'full-stack', 'fast-learner', 'async-first'],
    }
  },
  {
    id: 'design',
    label: 'Design / UX / Product Design',
    icon: '🎨',
    description: 'UI/UX, product design, visual design, motion',
    tags: {
      'Skill gaps': ['no-figma', 'no-user-research', 'no-motion-design', 'no-design-system', 'no-prototype'],
      'Portfolio gaps': ['no-case-studies', 'weak-portfolio', 'no-b2b-design', 'no-mobile-design'],
      'Experience gaps': ['no-product-sense', 'no-cross-functional', 'no-startup-exp', 'junior-level'],
      'Risk flags': ['visa-risk', 'hybrid-required', 'high-competition', 'no-domain-exp'],
      'Strengths': ['strong-portfolio', 'user-research', 'systems-thinker', 'async-first', 'fast-iteration'],
    }
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: '📣',
    description: 'Digital marketing, content, growth, brand, performance',
    tags: {
      'Skill gaps': ['no-seo', 'no-paid-ads', 'no-email-marketing', 'no-analytics', 'no-crm-exp', 'no-video-content'],
      'Experience gaps': ['no-b2b-marketing', 'no-saas-exp', 'no-growth-exp', 'no-brand-exp', 'junior-level'],
      'Tool gaps': ['no-hubspot', 'no-salesforce', 'no-google-ads', 'no-meta-ads'],
      'Risk flags': ['visa-risk', 'hybrid-required', 'high-competition', 'low-budget-exp'],
      'Strengths': ['data-driven', 'content-creator', 'community-builder', 'async-first', 'multilingual'],
    }
  },
  {
    id: 'product',
    label: 'Product Management',
    icon: '🗺️',
    description: 'Product managers, product owners, APMs',
    tags: {
      'Skill gaps': ['no-roadmapping', 'no-data-analysis', 'no-user-research', 'no-sql', 'no-a-b-testing'],
      'Experience gaps': ['no-b2b-pm', 'no-technical-background', 'no-0-to-1-exp', 'no-growth-pm', 'junior-level'],
      'Risk flags': ['visa-risk', 'hybrid-required', 'high-competition', 'no-domain-exp'],
      'Strengths': ['technical-pm', 'data-driven', 'user-empathy', 'cross-functional', 'async-first'],
    }
  },
  {
    id: 'finance',
    label: 'Finance / Accounting',
    icon: '💰',
    description: 'Finance analysts, accountants, controllers, FP&A',
    tags: {
      'Skill gaps': ['no-excel-advanced', 'no-financial-modeling', 'no-erp-exp', 'no-ifrs', 'no-audit-exp'],
      'Certification gaps': ['no-cpa', 'no-cfa', 'no-cma', 'no-acca'],
      'Experience gaps': ['no-big-4-exp', 'no-startup-exp', 'junior-level', 'no-industry-exp'],
      'Risk flags': ['visa-risk', 'hybrid-required', 'high-competition', 'relocation-required'],
      'Strengths': ['detail-oriented', 'fast-close', 'automation-exp', 'bilingual', 'tech-savvy'],
    }
  },
  {
    id: 'hr',
    label: 'HR / People Operations',
    icon: '🤝',
    description: 'HR generalists, recruiters, people ops, L&D',
    tags: {
      'Skill gaps': ['no-hris-exp', 'no-recruiting-exp', 'no-compensation-exp', 'no-l-and-d', 'no-er-exp'],
      'Experience gaps': ['no-startup-exp', 'no-remote-team-exp', 'junior-level', 'no-global-hr'],
      'Tool gaps': ['no-workday', 'no-greenhouse', 'no-bamboohr', 'no-linkedin-recruiter'],
      'Risk flags': ['visa-risk', 'hybrid-required', 'high-competition', 'no-industry-exp'],
      'Strengths': ['empathy', 'process-builder', 'remote-first', 'multilingual', 'fast-learner'],
    }
  },
  {
    id: 'consulting',
    label: 'Consulting',
    icon: '📋',
    description: 'Management, strategy, operations, IT consulting',
    tags: {
      'Skill gaps': ['no-deck-skills', 'no-data-analysis', 'no-project-management', 'no-client-facing', 'no-industry-exp'],
      'Firm gaps': ['no-top-tier-exp', 'no-mba', 'no-big-4-exp'],
      'Experience gaps': ['no-strategy-exp', 'no-ops-exp', 'junior-level', 'no-international-exp'],
      'Risk flags': ['visa-risk', 'travel-required', 'high-competition', 'relocation-required'],
      'Strengths': ['structured-thinker', 'fast-learner', 'client-skills', 'multilingual', 'project-delivery'],
    }
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: '⚙️',
    description: 'Ops managers, supply chain, logistics, process improvement',
    tags: {
      'Skill gaps': ['no-process-mapping', 'no-lean-six-sigma', 'no-erp-exp', 'no-data-analysis', 'no-vendor-mgmt'],
      'Experience gaps': ['no-scale-exp', 'no-startup-exp', 'junior-level', 'no-cross-functional'],
      'Risk flags': ['visa-risk', 'on-site-required', 'high-competition', 'shift-work'],
      'Strengths': ['process-builder', 'data-driven', 'cross-functional', 'fast-executer', 'problem-solver'],
    }
  },
  {
    id: 'accounting_tax',
    label: 'Tax / Audit',
    icon: '🧾',
    description: 'Tax accountants, auditors, forensic accounting',
    tags: {
      'Skill gaps': ['no-tax-exp', 'no-audit-exp', 'no-international-tax', 'no-transfer-pricing', 'no-tax-software'],
      'Certification gaps': ['no-cpa', 'no-acca', 'no-enrolled-agent'],
      'Experience gaps': ['no-big-4-exp', 'no-industry-exp', 'junior-level'],
      'Risk flags': ['visa-risk', 'hybrid-required', 'seasonal-work', 'relocation-required'],
      'Strengths': ['detail-oriented', 'tech-savvy', 'bilingual', 'deadline-driven', 'research-skills'],
    }
  },
  {
    id: 'film_media',
    label: 'Film / Media / Production',
    icon: '🎬',
    description: 'Directors, producers, editors, content creators',
    tags: {
      'Skill gaps': ['no-editing-exp', 'no-directing-exp', 'no-production-mgmt', 'no-color-grading', 'no-sound-design'],
      'Portfolio gaps': ['no-showreel', 'weak-portfolio', 'no-commercial-work', 'no-narrative-exp'],
      'Experience gaps': ['no-set-exp', 'no-studio-exp', 'junior-level', 'no-budget-mgmt'],
      'Risk flags': ['visa-risk', 'on-site-required', 'project-based', 'high-competition'],
      'Strengths': ['strong-showreel', 'fast-turnaround', 'versatile', 'client-skills', 'self-directed'],
    }
  },
  {
    id: 'program_management',
    label: 'Program / Project Management',
    icon: '📅',
    description: 'PMs, PMOs, scrum masters, delivery managers',
    tags: {
      'Skill gaps': ['no-pmp', 'no-agile-exp', 'no-scrum-exp', 'no-risk-management', 'no-stakeholder-mgmt'],
      'Tool gaps': ['no-jira', 'no-asana', 'no-ms-project', 'no-confluence'],
      'Experience gaps': ['no-enterprise-exp', 'no-cross-functional', 'junior-level', 'no-budget-ownership'],
      'Risk flags': ['visa-risk', 'hybrid-required', 'high-competition', 'travel-required'],
      'Strengths': ['organized', 'stakeholder-mgmt', 'delivery-focus', 'remote-first', 'process-builder'],
    }
  },
  {
    id: 'other',
    label: 'Other / Custom',
    icon: '✨',
    description: 'Build your own tag library from scratch',
    tags: {
      'Common gaps': ['skill-gap', 'experience-gap', 'tool-gap', 'certification-gap'],
      'Risk flags': ['visa-risk', 'hybrid-required', 'high-competition', 'relocation-required'],
      'Strengths': ['fast-learner', 'async-first', 'multilingual', 'self-directed', 'remote-exp'],
    }
  },
]

export const getRoleTags = (roleId) => {
  const role = ROLES.find(r => r.id === roleId)
  return role ? role.tags : {}
}

export const getAllTagsForRole = (roleId) => {
  const tags = getRoleTags(roleId)
  return Object.values(tags).flat()
}

export const COUNTRIES = [
  'Indonesia', 'Philippines', 'Vietnam', 'Thailand', 'Malaysia', 'Singapore',
  'India', 'Bangladesh', 'Pakistan', 'Sri Lanka', 'Nepal',
  'Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Egypt',
  'Brazil', 'Mexico', 'Colombia', 'Argentina', 'Peru',
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Netherlands', 'Spain', 'Portugal', 'Poland',
  'Japan', 'South Korea', 'China', 'Taiwan', 'Hong Kong',
  'Other'
]
