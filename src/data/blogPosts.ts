export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  authorImage?: string;
  date: string;
  discipline: 'Jumping' | 'Dressage';
  category: 'Technology' | 'Analytics' | 'Training' | 'Guides' | 'Competition';
  image: string;
  readingTime: string;
  translations?: {
    es?: {
      title?: string;
      excerpt?: string;
      content?: string;
      category?: string;
    }
  }
}

export const blogPosts: BlogPost[] = [
  // Jumping blog posts
  {
    id: 1,
    slug: 'how-ai-analysis-is-transforming-show-jumping-training',
    title: 'How AI Analysis Is Transforming Show Jumping Training',
    excerpt: 'Discover how artificial intelligence is revolutionizing jumping training methods, offering unprecedented insights and performance improvements for riders of all levels.',
    author: 'Emily Jayson',
    authorImage: '/placeholder.svg',
    date: 'April 25, 2025',
    discipline: 'Jumping',
    category: 'Technology',
    image: '/lovable-uploads/987a3f3b-1917-439f-a3a9-8fabc609cffa.png',
    readingTime: '5 min read',
    translations: {
      es: {
        title: 'Cómo el Análisis de IA Está Transformando el Entrenamiento de Salto Ecuestre',
        excerpt: 'Descubre cómo la inteligencia artificial está revolucionando los métodos de entrenamiento de salto, ofreciendo información sin precedentes y mejoras de rendimiento para jinetes de todos los niveles.',
        category: 'Tecnología'
      }
    }
  },
  {
    id: 2,
    slug: '5-critical-jumping-metrics-most-riders-never-track',
    title: '5 Critical Jumping Metrics That Most Riders Never Track',
    excerpt: 'Learn about the key performance indicators that can dramatically improve your jumping rounds, from takeoff angles to landing balance patterns.',
    author: 'Michael Peters',
    authorImage: '/placeholder.svg',
    date: 'April 22, 2025',
    discipline: 'Jumping',
    category: 'Analytics',
    image: '/lovable-uploads/3b7c24a2-ef67-42cc-9b46-875418451128.png',
    readingTime: '7 min read',
    translations: {
      es: {
        title: '5 Métricas Críticas de Salto Que la Mayoría de los Jinetes Nunca Rastrean',
        excerpt: 'Aprende sobre los indicadores clave de rendimiento que pueden mejorar dramáticamente tus rondas de salto, desde ángulos de despegue hasta patrones de equilibrio de aterrizaje.',
        category: 'Analítica'
      }
    }
  },
  {
    id: 3,
    slug: 'case-study-improved-clear-round-rates',
    title: 'Case Study: How Riders Improved Clear Round Rates Using AI',
    excerpt: 'Read inspiring success stories of riders who have significantly improved their performance using AI-powered jump analysis and targeted training.',
    author: 'Emma Richards',
    authorImage: '/placeholder.svg',
    date: 'April 19, 2025',
    discipline: 'Jumping',
    category: 'Training',
    image: '/lovable-uploads/15df63d0-27e1-486c-98ee-bcf44eb600f4.png',
    readingTime: '6 min read'
  },
  {
    id: 4,
    slug: 'science-behind-jump-technique-perfect-takeoff',
    title: 'The Science Behind Jump Technique: What Makes a Perfect Takeoff',
    excerpt: 'Explore the biomechanics and physics behind optimal jumping technique, and learn how small adjustments can lead to significantly improved performance.',
    author: 'Scott Turner',
    authorImage: '/placeholder.svg',
    date: 'April 16, 2025',
    discipline: 'Jumping',
    category: 'Guides',
    image: '/lovable-uploads/4c938b42-7713-4f2d-947a-1e70c3caca32.png',
    readingTime: '9 min read'
  },
  {
    id: 5,
    slug: 'training-vs-competition-bridging-the-gap',
    title: 'Training vs. Competition: How Top Riders Bridge the Gap',
    excerpt: 'Discover the strategies that elite riders use to ensure their training success translates to competition excellence, even under pressure.',
    author: 'Rob Smithers',
    authorImage: '/placeholder.svg',
    date: 'April 13, 2025',
    discipline: 'Jumping',
    category: 'Competition',
    image: '/lovable-uploads/b729b0be-9b4c-4b4b-bdec-6bd2f849b8f8.png',
    readingTime: '8 min read'
  },
  {
    id: 6,
    slug: 'understanding-horse-jumping-style-ai-pattern-recognition',
    title: "Understanding Your Horse's Jumping Style: AI-Powered Pattern Recognition",
    excerpt: "Learn how artificial intelligence can identify your horse's unique jumping style and tendencies, enabling more targeted and effective training.",
    author: 'Emily Jayson',
    authorImage: '/placeholder.svg',
    date: 'April 10, 2025',
    discipline: 'Jumping',
    category: 'Analytics',
    image: '/lovable-uploads/79f64a37-cb8e-4627-b743-c5330837a1b0.png',
    readingTime: '6 min read'
  },
  
  // Dressage blog posts
  {
    id: 7,
    slug: 'ai-revolutionizing-dressage-training',
    title: 'How AI is Revolutionizing Dressage Training: A New Era for Equestrians',
    excerpt: 'Discover how artificial intelligence is transforming dressage training with real-time feedback, detailed analytics, and personalized guidance for riders of all levels.',
    author: 'Emma Richardson',
    authorImage: '/placeholder.svg',
    date: 'April 29, 2025',
    discipline: 'Dressage',
    category: 'Technology',
    image: '/lovable-uploads/15df63d0-27e1-486c-98ee-bcf44eb600f4.png',
    readingTime: '7 min read',
    translations: {
      es: {
        title: 'Cómo la IA Está Revolucionando el Entrenamiento de Doma: Una Nueva Era para los Ecuestres',
        excerpt: 'Descubre cómo la inteligencia artificial está transformando el entrenamiento de doma con retroalimentación en tiempo real, análisis detallados y orientación personalizada para jinetes de todos los niveles.',
        category: 'Tecnología'
      }
    }
  },
  {
    id: 8,
    slug: 'data-behind-dressage-dance',
    title: 'The Data Behind the Dance: Understanding AI Analytics in Dressage',
    excerpt: 'Learn how AI captures and analyzes the complex patterns of movement, weight distribution, and timing that create the artistry of dressage.',
    author: 'Michael Peterson',
    authorImage: '/placeholder.svg',
    date: 'April 27, 2025',
    discipline: 'Dressage',
    category: 'Analytics',
    image: '/lovable-uploads/4c938b42-7713-4f2d-947a-1e70c3caca32.png',
    readingTime: '8 min read'
  },
  {
    id: 9,
    slug: 'getting-started-ai-dressage',
    title: "Getting Started with AI Dressage: A Beginner's Guide",
    excerpt: 'A comprehensive guide to incorporating AI into your dressage training, from equipment setup to understanding feedback and maximizing progress.',
    author: 'Sarah Johnson',
    authorImage: '/placeholder.svg',
    date: 'April 25, 2025',
    discipline: 'Dressage',
    category: 'Guides',
    image: '/lovable-uploads/b729b0be-9b4c-4b4b-bdec-6bd2f849b8f8.png',
    readingTime: '6 min read'
  },
  {
    id: 10,
    slug: 'future-equestrian-sports-ai',
    title: "Future of Equestrian Sports: AI's Role in Competitive Dressage",
    excerpt: 'Explore how artificial intelligence is influencing competitive dressage, from training methods to potential changes in judging and accessibility.',
    author: 'Thomas Müller',
    authorImage: '/placeholder.svg',
    date: 'April 22, 2025',
    discipline: 'Dressage',
    category: 'Competition',
    image: '/lovable-uploads/3b7c24a2-ef67-42cc-9b46-875418451128.png',
    readingTime: '9 min read'
  },
  {
    id: 11,
    slug: 'essential-dressage-tips',
    title: '5 Essential Dressage Training Tips for Beginners',
    excerpt: 'Master the basics of dressage with these expert tips that will help you establish a solid foundation for future success.',
    author: 'Emma Richardson',
    authorImage: '/placeholder.svg',
    date: 'April 20, 2025',
    discipline: 'Dressage',
    category: 'Training',
    image: '/lovable-uploads/79f64a37-cb8e-4627-b743-c5330837a1b0.png',
    readingTime: '5 min read'
  },
  {
    id: 12,
    slug: 'dressage-test-scoring',
    title: 'Understanding Dressage Test Scoring: What Judges Are Looking For',
    excerpt: 'Learn how dressage tests are scored and what specific elements judges evaluate during your performance to improve your competitive edge.',
    author: 'Michael Peterson',
    authorImage: '/placeholder.svg',
    date: 'April 18, 2025',
    discipline: 'Dressage',
    category: 'Competition',
    image: '/lovable-uploads/987a3f3b-1917-439f-a3a9-8fabc609cffa.png',
    readingTime: '7 min read'
  }
];
