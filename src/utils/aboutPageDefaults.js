import bannerImg from '../pages/public/aboutImages/banner-img.png';
import reserchSVG from '../pages/public/aboutImages/market-research.svg';
import creativeLayout from '../pages/public/aboutImages/creative-layout.svg';
import digitalMarketing from '../pages/public/aboutImages/digital-marketing.svg';
import backLinks from '../pages/public/aboutImages/seo-backlink.svg';
import findingJOB from '../pages/public/aboutImages/img-findjob.png';
import onlineMarketing from '../pages/public/aboutImages/banner-online-marketing.png';
import Marc from '../pages/public/aboutImages/marc.png';
import marc2 from '../pages/public/aboutImages/marc2.png';
import marc3 from '../pages/public/aboutImages/marc3.png';
import marc4 from '../pages/public/aboutImages/marc4.png';
import profile1 from '../pages/public/aboutImages/profile.png';
import profile2 from '../pages/public/aboutImages/profile2.png';
import profile3 from '../pages/public/aboutImages/profile3.png';

export const ABOUT_DEFAULT_IMAGES = {
  hero: bannerImg,
  features: [reserchSVG, creativeLayout, digitalMarketing, backLinks],
  find_jobs: findingJOB,
  marketing_story: onlineMarketing,
  team: [Marc, marc2, marc3, marc4],
  testimonials: [profile1, profile2, profile3]
};

export const DEFAULT_ABOUT_SECTIONS_DATA = [
  {
    id: 'hero',
    name: '1. Hero Banner',
    sortOrder: 1,
    active: true,
    bgColor: '#fff9f3',
    eyebrow: '',
    eyebrowColor: '#0047C7',
    title: 'The #1 Job Board for Graphic Design Jobs',
    titleFontSize: 52,
    titleColor: '#1f2938',
    subtitle: 'Search and connect with the right candidates faster. This talent search gives you the opportunity to find candidates who may be a perfect fit for your role.',
    subtitleFontSize: 18,
    subtitleColor: '#475569',
    primaryButton: { enabled: true, text: 'Contact us', url: '/contact' },
    secondaryButton: { enabled: true, text: 'Support center', url: '/support' },
    image: { url: '', alt: 'JobsWaale Hero Banner' }
  },
  {
    id: 'features',
    name: '2. Core Features (4 Cards)',
    sortOrder: 2,
    active: true,
    bgColor: '#ffffff',
    title: 'Core Features',
    titleFontSize: 36,
    titleColor: '#1f2938',
    subtitle: 'Explore the key capabilities and benefits offered by JobsWaale.',
    subtitleFontSize: 16,
    subtitleColor: '#88929b',
    cards: [
      {
        id: 'feat_1',
        title: 'Market Research',
        titleColor: '#1f2938',
        description: 'In-depth industry data and career insights across India.',
        descriptionColor: '#37404e',
        linkText: 'Read more',
        url: '/market-research',
        image: ''
      },
      {
        id: 'feat_2',
        title: 'Creative Layout',
        titleColor: '#1f2938',
        description: 'Modern candidate profiles and visually optimized job vacancy views.',
        descriptionColor: '#37404e',
        linkText: 'Read more',
        url: '/creative-layout',
        image: ''
      },
      {
        id: 'feat_3',
        title: 'Digital Marketing',
        titleColor: '#1f2938',
        description: 'Targeted social and search campaigns to accelerate hiring.',
        descriptionColor: '#37404e',
        linkText: 'Read more',
        url: '/digital-marketing',
        image: ''
      },
      {
        id: 'feat_4',
        title: 'SEO & Backlinks',
        titleColor: '#1f2938',
        description: 'High search engine ranking for guaranteed candidate visibility.',
        descriptionColor: '#37404e',
        linkText: 'Read more',
        url: '/seo-backlinks',
        image: ''
      }
    ]
  },
  {
    id: 'find_jobs',
    name: '3. Find Jobs CTA Banner',
    sortOrder: 3,
    active: true,
    bgColor: '#c2d9ff',
    eyebrow: 'Find jobs',
    eyebrowColor: '#0047C7',
    title: 'Create free account and start applying to your dream job today',
    titleFontSize: 36,
    titleColor: '#1f2938',
    subtitle: 'Build your profile, explore verified openings, and apply directly to roles that match your skills, location, and career goals.',
    subtitleFontSize: 18,
    subtitleColor: '#37404e',
    primaryButton: { enabled: true, text: 'Explore more', url: '/jobs' },
    image: { url: '', alt: 'Find jobs illustration' }
  },
  {
    id: 'marketing_story',
    name: '4. Quality & Commitment Story',
    sortOrder: 4,
    active: true,
    bgColor: '#ffffff',
    eyebrow: 'Online Marketing',
    eyebrowColor: '#0047C7',
    title: 'Committed to top quality and results',
    titleFontSize: 44,
    titleColor: '#1f2938',
    paragraph1: 'We connect top talent with top employers through verified recruitment workflows and advanced search technology.',
    paragraph2: 'Our platform ensures authentic job postings, seamless direct messaging, and high-performance talent matching across India.',
    paragraphFontSize: 16,
    paragraphColor: '#37404e',
    primaryButton: { enabled: true, text: 'Learn more', url: '/contact' },
    image: { url: '', alt: 'Online marketing banner' }
  },
  {
    id: 'team',
    name: '5. Meet Our Team (4 Members)',
    sortOrder: 5,
    active: true,
    bgColor: '#ffffff',
    title: 'Meet our team',
    titleFontSize: 44,
    titleColor: '#1f2938',
    subtitle: 'Find the type of work you need, clearly defined and ready to start. Work begins as soon as you purchase and provide requirements.',
    subtitleFontSize: 16,
    subtitleColor: '#88929b',
    members: [
      { id: 'm1', name: 'Peter Grant', role: 'Marketing Director', photo: '' },
      { id: 'm2', name: 'Dominic Leonardo', role: 'Marketing Director', photo: '' },
      { id: 'm3', name: 'Jane Wilson', role: 'Marketing Director', photo: '' },
      { id: 'm4', name: 'Ali Carter', role: 'Marketing Director', photo: '' }
    ]
  },
  {
    id: 'testimonials',
    name: '6. Our Happy Customer (Testimonials)',
    sortOrder: 6,
    active: true,
    bgColor: '#ffffff',
    title: 'Our Happy Customer',
    titleFontSize: 44,
    titleColor: '#1f2938',
    subtitle: 'When it comes to choosing the right talent platform, hear what our verified customers have to say.',
    subtitleFontSize: 16,
    subtitleColor: '#88929b',
    testimonials: [
      {
        id: 't1',
        name: 'Sarah Harding',
        role: 'Visual Designer',
        rating: 5,
        review: 'We are on the hunt for a designer who is exceptional in both making incredible product interfaces as well as',
        photo: ''
      },
      {
        id: 't2',
        name: 'Sarah Harding',
        role: 'Visual Designer',
        rating: 5,
        review: 'We are on the hunt for a designer who is exceptional in both making incredible product interfaces as well as',
        photo: ''
      },
      {
        id: 't3',
        name: 'Sarah Harding',
        role: 'Visual Designer',
        rating: 5,
        review: 'We are on the hunt for a designer who is exceptional in both making incredible product interfaces as well as',
        photo: ''
      }
    ]
  }
];
