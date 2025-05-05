
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
    image: '/lovable-uploads/cda0d16d-c48f-433b-a4ca-31552d80f3fc.png',
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
    image: '/lovable-uploads/28c8b566-c53d-4197-b758-abac7ac25848.png',
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
    image: '/lovable-uploads/223982c4-1359-486a-a3d7-876e251274bc.png',
    readingTime: '6 min read',
    translations: {
      es: {
        title: 'Caso de Estudio: Cómo los Jinetes Mejoraron las Tasas de Rondas Limpias con IA',
        excerpt: 'Lee historias inspiradoras de éxito de jinetes que han mejorado significativamente su rendimiento utilizando análisis de salto potenciado por IA y entrenamiento dirigido.',
        category: 'Entrenamiento'
      }
    }
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
    image: '/lovable-uploads/b4c7d6ae-2c74-42dc-984a-32d0c758a7aa.png',
    readingTime: '9 min read',
    translations: {
      es: {
        title: 'La Ciencia Detrás de la Técnica de Salto: Qué Hace un Despegue Perfecto',
        excerpt: 'Explora la biomecánica y la física detrás de la técnica de salto óptima, y aprende cómo pequeños ajustes pueden llevar a una mejora significativa del rendimiento.',
        category: 'Guías'
      }
    }
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
    image: '/lovable-uploads/8029655e-ccba-4c36-a1da-598829a73f0c.png',
    readingTime: '8 min read',
    translations: {
      es: {
        title: 'Entrenamiento vs. Competición: Cómo los Mejores Jinetes Cierran la Brecha',
        excerpt: 'Descubre las estrategias que los jinetes de élite utilizan para asegurar que su éxito en el entrenamiento se traduzca en excelencia en la competición, incluso bajo presión.',
        category: 'Competición'
      }
    }
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
    image: '/lovable-uploads/c297b60b-8892-4358-8ba3-62e317f4a7ee.png',
    readingTime: '6 min read',
    translations: {
      es: {
        title: 'Entendiendo el Estilo de Salto de Tu Caballo: Reconocimiento de Patrones con IA',
        excerpt: 'Aprende cómo la inteligencia artificial puede identificar el estilo único de salto de tu caballo y sus tendencias, permitiendo un entrenamiento más dirigido y efectivo.',
        category: 'Analítica'
      }
    }
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
    image: '/lovable-uploads/e2cfe504-4899-4458-9af3-b8deb0a24a4b.png',
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
    image: '/lovable-uploads/2d7d12d5-7cbc-4747-878c-897c94ab8d18.png',
    readingTime: '8 min read',
    translations: {
      es: {
        title: 'Los Datos Detrás de la Danza: Entendiendo la Analítica de IA en Doma',
        excerpt: 'Aprende cómo la IA captura y analiza los complejos patrones de movimiento, distribución de peso y ritmo que crean el arte de la doma.',
        category: 'Analítica'
      }
    }
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
    image: '/lovable-uploads/ce48f309-50d3-454b-9c23-a64f55cba5ba.png',
    readingTime: '6 min read',
    translations: {
      es: {
        title: 'Comenzando con Doma con IA: Una Guía para Principiantes',
        excerpt: 'Una guía completa para incorporar la IA en tu entrenamiento de doma, desde la configuración del equipo hasta la comprensión del feedback y la maximización del progreso.',
        category: 'Guías'
      }
    }
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
    image: '/lovable-uploads/2389697e-6b82-4b92-b764-c24f61fca8d4.png',
    readingTime: '9 min read',
    translations: {
      es: {
        title: 'El Futuro de los Deportes Ecuestres: El Papel de la IA en la Doma Competitiva',
        excerpt: 'Explora cómo la inteligencia artificial está influyendo en la doma competitiva, desde métodos de entrenamiento hasta posibles cambios en el juzgamiento y la accesibilidad.',
        category: 'Competición'
      }
    }
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
    image: '/lovable-uploads/ce48f309-50d3-454b-9c23-a64f55cba5ba.png',
    readingTime: '5 min read',
    translations: {
      es: {
        title: '5 Consejos Esenciales de Entrenamiento de Doma para Principiantes',
        excerpt: 'Domina los fundamentos de la doma con estos consejos de expertos que te ayudarán a establecer una base sólida para el éxito futuro.',
        category: 'Entrenamiento'
      }
    }
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
    image: '/lovable-uploads/2d7d12d5-7cbc-4747-878c-897c94ab8d18.png',
    readingTime: '7 min read',
    translations: {
      es: {
        title: 'Entendiendo la Puntuación de Pruebas de Doma: Lo Que Buscan los Jueces',
        excerpt: 'Aprende cómo se puntúan las pruebas de doma y qué elementos específicos evalúan los jueces durante tu actuación para mejorar tu ventaja competitiva.',
        category: 'Competición'
      }
    }
  }
];
