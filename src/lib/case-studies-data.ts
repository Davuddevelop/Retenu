// src/lib/case-studies-data.ts

export interface CaseStudy {
  id: string;
  title: string;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  results: {
    amount: string;
    metric: string;
  }[];
  quote: {
    text: string;
    author: string;
    role: string;
  };
  image: string;
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'pixel-craft',
    title: 'Recovering 15% Annual Revenue from Ghost Hours',
    company: 'PixelCraft Studio',
    industry: 'Design & Branding',
    challenge: 'PixelCraft was losing track of small revision cycles and "quick" client requests that added up to dozens of unbilled hours monthly.',
    solution: 'Implemented RETENU to automatically flag disparities between Figma activity logs and Toggl time entries.',
    results: [
      { amount: '$42,000', metric: 'Recovered in 6 months' },
      { amount: '15%', metric: 'Increase in net margin' }
    ],
    quote: {
      text: "We realized we were essentially giving away two weeks of work every year. RETENU made it visible.",
      author: "Sarah Chen",
      role: "Founder & Creative Director"
    },
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'growth-labs',
    title: 'Eliminating Scope Creep for High-Growth Agencies',
    company: 'GrowthLabs',
    industry: 'Digital Marketing',
    challenge: 'Constant scope creep on retainer accounts was eroding profitability on their largest clients.',
    solution: 'Used RETENU real-time alerts to notify account managers when work exceeded contract scope by 10%.',
    results: [
      { amount: '$12,500', metric: 'Monthly billable increase' },
      { amount: '0', metric: 'Forgotten change orders' }
    ],
    quote: {
      text: "It's not about charging for every minute, it's about knowing where your energy is going. This tool is a game changer.",
      author: "Marcus Rodriguez",
      role: "Head of Operations"
    },
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop'
  }
];
