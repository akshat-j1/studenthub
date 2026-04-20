export type Opportunity = {
    id: string;
    title: string;
    description: string;
    deadline: string;
    tags: string[];
    type: 'hackathon' | 'internship' | 'offer' | 'student_offer';
    category?: string;
    company: string;
    location: string;
    isBeginnerFriendly: boolean;
    isRemote: boolean;
    isPaid: boolean;
    prize?: string;
    salary?: string;
    logo: string;
    /** Optional external apply URL; detail page falls back to a demo URL per id */
    applyUrl?: string;
  };
  
  export const opportunities: Opportunity[] = [
    // Hackathons
    {
      id: 'h1',
      title: 'Global AI Hackathon 2025',
      description: 'Build AI-powered solutions to real-world problems. Open to all skill levels. Win up to $10,000 in prizes and get mentored by industry experts.',
      deadline: '2025-05-15',
      tags: ['AI/ML', 'Open Source', 'Innovation'],
      type: 'hackathon',
      company: 'TechCorp Global',
      location: 'Online',
      isBeginnerFriendly: true,
      isRemote: true,
      isPaid: false,
      prize: '$10,000',
      logo: 'TC',
    },
    {
      id: 'h2',
      title: 'Climate Tech Challenge',
      description: 'Design sustainable technology solutions to combat climate change. Work with a team to prototype and pitch your idea to leading VCs.',
      deadline: '2025-06-01',
      tags: ['Climate', 'Sustainability', 'Hardware'],
      type: 'hackathon',
      company: 'GreenFuture Labs',
      location: 'San Francisco, CA',
      isBeginnerFriendly: false,
      isRemote: false,
      isPaid: false,
      prize: '$25,000',
      logo: 'GF',
    },
    {
      id: 'h3',
      title: 'FinTech Builders Sprint',
      description: 'Create the next generation of financial tools for underserved communities. 48-hour hackathon with live mentorship from top fintech founders.',
      deadline: '2025-05-28',
      tags: ['FinTech', 'Web3', 'Payments'],
      type: 'hackathon',
      company: 'PayNext',
      location: 'Online',
      isBeginnerFriendly: true,
      isRemote: true,
      isPaid: false,
      prize: '$5,000',
      logo: 'PN',
    },
    {
      id: 'h4',
      title: 'Healthcare Hackathon',
      description: 'Leverage data and technology to solve pressing healthcare challenges. Teams of 2–5 compete for grants and mentorship opportunities.',
      deadline: '2025-07-10',
      tags: ['HealthTech', 'Data', 'Impact'],
      type: 'hackathon',
      company: 'MedInnovate',
      location: 'Boston, MA',
      isBeginnerFriendly: false,
      isRemote: false,
      isPaid: false,
      prize: '$15,000',
      logo: 'MI',
    },
    {
      id: 'h5',
      title: 'Open Source Contribution Jam',
      description: 'Contribute to popular open-source projects and win swag, recognition, and cash prizes. Perfect for beginners looking to build their portfolio.',
      deadline: '2025-05-20',
      tags: ['Open Source', 'Coding', 'Community'],
      type: 'hackathon',
      company: 'DevCircle',
      location: 'Online',
      isBeginnerFriendly: true,
      isRemote: true,
      isPaid: false,
      prize: '$2,000',
      logo: 'DC',
    },
  
    // Internships
    {
      id: 'i1',
      title: 'Software Engineering Intern',
      description: 'Join our product team and work on scalable backend systems serving millions of users. You will collaborate with senior engineers on real feature development.',
      deadline: '2025-05-30',
      tags: ['Backend', 'Python', 'AWS'],
      type: 'internship',
      company: 'Stripe',
      location: 'New York, NY',
      isBeginnerFriendly: false,
      isRemote: false,
      isPaid: true,
      salary: '$8,000/mo',
      logo: 'ST',
    },
    {
      id: 'i2',
      title: 'Frontend Developer Intern',
      description: 'Work alongside our design and engineering teams to build beautiful, accessible user interfaces. Experience with React and TypeScript preferred.',
      deadline: '2025-06-15',
      tags: ['React', 'TypeScript', 'UI/UX'],
      type: 'internship',
      company: 'Notion',
      location: 'Remote',
      isBeginnerFriendly: true,
      isRemote: true,
      isPaid: true,
      salary: '$6,500/mo',
      logo: 'NO',
    },
    {
      id: 'i3',
      title: 'Data Science Intern',
      description: 'Analyze large datasets to uncover insights that drive product decisions. You will build dashboards, run experiments, and present findings to leadership.',
      deadline: '2025-05-25',
      tags: ['Data Science', 'SQL', 'Python'],
      type: 'internship',
      company: 'Airbnb',
      location: 'San Francisco, CA',
      isBeginnerFriendly: false,
      isRemote: false,
      isPaid: true,
      salary: '$7,200/mo',
      logo: 'AB',
    },
    {
      id: 'i4',
      title: 'Product Management Intern',
      description: 'Drive product strategy and roadmap for our mobile app. Work directly with engineering, design, and marketing to ship features used by millions.',
      deadline: '2025-06-30',
      tags: ['Product', 'Strategy', 'Mobile'],
      type: 'internship',
      company: 'Figma',
      location: 'Remote',
      isBeginnerFriendly: true,
      isRemote: true,
      isPaid: true,
      salary: '$5,800/mo',
      logo: 'FG',
    },
    {
      id: 'i5',
      title: 'Cybersecurity Research Intern',
      description: 'Research emerging security threats and develop mitigation strategies. Ideal for students studying computer science, security, or related fields.',
      deadline: '2025-07-01',
      tags: ['Security', 'Research', 'Networking'],
      type: 'internship',
      company: 'Cloudflare',
      location: 'Austin, TX',
      isBeginnerFriendly: false,
      isRemote: false,
      isPaid: true,
      salary: '$7,800/mo',
      logo: 'CF',
    },
  
    // Student Offers
    {
      id: 'o1',
      title: 'GitHub Student Developer Pack',
      description: 'Get access to over 100 premium developer tools completely free. Includes cloud credits, domains, design tools, and learning platforms — all at no cost.',
      deadline: '2025-12-31',
      tags: ['Tools', 'Cloud', 'Developer'],
      type: 'offer',
      company: 'GitHub',
      location: 'Online',
      isBeginnerFriendly: true,
      isRemote: true,
      isPaid: false,
      logo: 'GH',
    },
    {
      id: 'o2',
      title: 'AWS Educate Credits',
      description: 'Access $200 in AWS cloud credits plus free training courses. Build real cloud projects and earn certifications recognized by top tech employers.',
      deadline: '2025-12-31',
      tags: ['Cloud', 'AWS', 'Learning'],
      type: 'offer',
      company: 'Amazon Web Services',
      location: 'Online',
      isBeginnerFriendly: true,
      isRemote: true,
      isPaid: false,
      logo: 'AW',
    },
    {
      id: 'o3',
      title: 'Notion for Students',
      description: 'Get Notion Plus plan completely free with a student email. Organize your notes, projects, and coursework with unlimited blocks and collaboration features.',
      deadline: '2025-12-31',
      tags: ['Productivity', 'Notes', 'Collaboration'],
      type: 'offer',
      company: 'Notion',
      location: 'Online',
      isBeginnerFriendly: true,
      isRemote: true,
      isPaid: false,
      logo: 'NO',
    },
    {
      id: 'o4',
      title: 'JetBrains Student License',
      description: 'Free access to the entire JetBrains IDE suite including IntelliJ IDEA, PyCharm, WebStorm, and more. Renew annually with valid student status.',
      deadline: '2025-12-31',
      tags: ['IDE', 'Coding', 'Tools'],
      type: 'offer',
      company: 'JetBrains',
      location: 'Online',
      isBeginnerFriendly: true,
      isRemote: true,
      isPaid: false,
      logo: 'JB',
    },
    {
      id: 'o5',
      title: 'Microsoft Azure Student Credits',
      description: 'Unlock $100 in Azure credits and free services including virtual machines, databases, and AI tools. No credit card required for student accounts.',
      deadline: '2025-12-31',
      tags: ['Cloud', 'Azure', 'AI'],
      type: 'offer',
      company: 'Microsoft',
      location: 'Online',
      isBeginnerFriendly: true,
      isRemote: true,
      isPaid: false,
      logo: 'MS',
    },
  ];
  
  export const hackathons = opportunities.filter((o) => o.type === 'hackathon');
  export const internships = opportunities.filter((o) => o.type === 'internship');
  export const studentOffers = opportunities.filter((o) => o.type === 'offer');

export function getOpportunityById(id: string): Opportunity | undefined {
  return opportunities.find((o) => o.id === id);
}

export function getApplyUrl(opportunity: Opportunity): string {
  return opportunity.applyUrl ?? `https://example.com/apply/${opportunity.id}`;
}
  