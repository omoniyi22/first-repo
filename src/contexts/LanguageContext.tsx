
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Record<string, Record<string, string>>;
}

const defaultTranslations = {
  en: {
    // Navigation
    "home": "Home",
    "how-it-works": "How It Works",
    "pricing": "Pricing",
    "blog": "Blog",
    "event": "Event",
    "about": "About",
    "dashboard": "Dashboard",
    "profile-setup": "Profile",
    "sign-in": "Sign In",
    "sign-out": "Sign Out",
    "get-started": "Get Started",
    
    // Blog page
    "blog-title": "Equestrian Excellence Blog",
    "blog-description": "Expert insights, training tips, and the latest innovations in equestrian sports.",
    "search-placeholder": "Search articles...",
    "all-posts": "All Posts",
    "jumping": "Jumping",
    "dressage": "Dressage",
    "all-categories": "All Categories",
    "technology": "Technology",
    "analytics": "Analytics",
    "training": "Training",
    "guides": "Guides",
    "competition": "Competition",
    "latest-articles": "Latest Articles",
    "results": "Results",
    "result": "Result",
    "no-articles": "No articles found",
    "adjust-filters": "Try adjusting your filters or search term",
    "clear-filters": "Clear all filters",
    "newsletter-title": "Subscribe to Our Newsletter",
    "newsletter-description": "Get the latest equestrian insights and updates delivered straight to your inbox.",
    "email-placeholder": "Your email address",
    "subscribe": "Subscribe",
    "read": "Read",
    "read-article": "Read Article",
    
    // Coming Soon
    "coming-soon": "Coming Soon",
    "notify-me": "Notify Me",
    "sending": "Sending...",
    "pricing-waitlist": "We're currently finalizing our pricing plans. Join our waitlist to be notified when subscriptions are available.",
    
    // Pricing
    "simple-pricing": "Simple, Transparent Pricing",
    "try-free": "Try for free with one test, then choose the plan that best fits your training needs.",
    "annual": "Annual",
    "monthly": "Monthly",
    "save-annual": "Save 20% with annual billing",
    "features-include": "Features include:",
    "billed-annually": "Billed annually",
    "year": "year",
    "most-popular": "Most Popular",
    "help-choosing": "Need help choosing?",
    "help-text": "Our team is here to help you select the best plan for your training needs. Contact us for personalized assistance.",
    "contact-support": "Contact Support",
    
    // FAQ
    "faq-title": "Frequently Asked Questions",
    "faq-description": "Have questions about AI Dressage Trainer? Find answers to the most common questions below.",
    "still-questions": "Still have questions?",
    "questions-text": "If you couldn't find the answer to your question, please don't hesitate to reach out to our support team.",
    
    // Profile
    "goals": "Goals",
    "edit": "Edit",
    "short-term": "Short-term (3 months)",
    "medium-term": "Medium-term (6 months)",
    "long-term": "Long-term (1+ year)",
    "by": "By",
    
    // Newsletter Form
    "newsletter-subscribe": "Subscribe",
    "newsletter-subscribing": "Subscribing...",
    "your-email": "Your email",
    "already-subscribed": "Already subscribed",
    "subscription-successful": "Subscription successful!",
    "thank-you-subscribing": "Thank you for subscribing to our newsletter.",
    "subscription-failed": "Subscription failed",
    "problem-subscribing": "There was a problem subscribing to the newsletter. Please try again.",
    
    // Home page
    "next-gen-training": "Next Generation Dressage Training",
    "transform-training": "Transform Your Dressage Training with AI",
    "upload-description": "Upload your score sheets, get AI-powered analysis, and receive personalized training recommendations to improve your performance.",
    "get-started-button": "Get Started",
    "how-it-works-button": "How It Works",
    "riders-love": "500+ riders love our platform",
    "how-works-title": "How AI Dressage Trainer Works",
    "innovative-platform": "Our innovative platform uses advanced AI to transform how you approach dressage training",
    "upload-score-sheets": "Upload Score Sheets",
    "upload-score-description": "Take a photo or upload your dressage test score sheets through our intuitive interface.",
    "ai-processing": "AI Processing",
    "ai-processing-description": "Our advanced AI analyzes your scores, identifying patterns and areas for improvement.",
    "detailed-analysis": "Detailed Analysis",
    "detailed-analysis-description": "Receive comprehensive breakdowns of your performance with visual analytics.",
    "custom-recommendations": "Custom Recommendations",
    "custom-recommendations-description": "Get personalized training exercises tailored to your specific improvement areas.",
    "benefits-title": "Benefits That Make a Difference",
    "benefits-description": "Our AI-powered platform helps riders of all levels achieve their goals faster with data-driven insights and personalized recommendations.",
    "advanced-movement": "Advanced movement analysis and scoring prediction",
    "personalized-plans": "Personalized training plans based on your test results",
    "track-improvements": "Track improvements over time with detailed metrics",
    "learn-how": "Learn How It Works",
    "personalized-analysis": "Personalized Analysis",
    "personalized-analysis-description": "Our AI analyzes your unique riding patterns and test scores to provide feedback tailored specifically to your strengths and weaknesses.",
    "accelerated-progress": "Accelerated Progress",
    "accelerated-progress-description": "Riders using our platform improve 3x faster with targeted exercises addressing specific areas of improvement identified by our AI.",
    "competition-edge": "Competition Edge",
    "competition-edge-description": "Gain insights into exactly what judges are looking for and how to showcase your horse's best movements to maximize your scores.",
    "efficient-training": "Efficient Training",
    "efficient-training-description": "Save time and money by focusing your training sessions on the exercises that will have the biggest impact on your performance.",
    "results-measure": "Results You Can Measure",
    "achieve-goals": "Achieve Your Competition Goals",
    "analytics-description": "Our comprehensive analytics track your improvement across multiple tests, helping you see exactly where you're making progress. Our users report average score improvements of 2-5 percentage points in their first three months.",
    "avg-score": "Avg. Score Increase",
    "rider-satisfaction": "Rider Satisfaction",
    "tests-analyzed": "Tests Analyzed",
    "see-how": "See How It Works",
    
    // Footer
    "transform-equestrian": "Transform your equestrian training with AI-powered analysis and personalized recommendations.",
    "navigation": "Navigation",
    "ai-dressage": "AI Dressage Trainer",
    "ai-jumping": "AI Jumping Trainer",
    "legal": "Legal",
    "terms": "Terms of Service",
    "privacy": "Privacy Policy",
    "contact-us": "Contact Us",
    "newsletter-signup": "Subscribe to our newsletter",
    "all-rights": "All rights reserved.",

    // Additional UI Elements
    "log-in": "Log In",
    "admin-dashboard": "Admin Dashboard",
    "my-account": "My Account",
    "toggle-theme": "Toggle theme",
    "light": "Light",
    "dark": "Dark",
    "system": "System",
    "close-menu": "Close menu",
    "open-menu": "Open menu",
    "page-not-found": "Oops! Page not found",
    "return-to-home": "Return to Home",
    "our-core-values": "Our Core Values",
    "innovation": "Innovation",
    "innovation-desc": "Pushing the boundaries of what's possible in equestrian training",
    "precision": "Precision", 
    "precision-desc": "Delivering accurate, reliable analysis and recommendations",
    "community": "Community",
    "community-desc": "Building a supportive network of riders and trainers",
    "tradition": "Tradition",
    "tradition-desc": "Respecting classical principles while embracing technology",

    // DisciplineSpecificTabs - Dressage
    "elevating-dressage": "Elevating Your Dressage Journey",
    "dressage-demands": "Dressage demands precision, harmony, and consistent improvement. AI Dressage tackles the specific challenges faced by dressage riders.",
    "inconsistent-test-scores": "Inconsistent Test Scores",
    "inconsistent-test-desc": "Dressage riders often experience frustrating score fluctuations without understanding why. AI Dressage analyzes your test sheets to identify patterns and specific movements affecting your overall performance.",
    "difficulty-interpreting": "Difficulty Interpreting Judge Comments",
    "difficulty-interpreting-desc": "Judge feedback can be cryptic or overwhelming. Our system synthesizes comments across multiple tests to reveal actionable insights about your technical execution.",
    "position-flaws": "Position Flaws During Movements",
    "position-flaws-desc": "Small alignment issues can significantly impact movement quality. Our video analysis identifies position inconsistencies at critical moments in your ride.",
    "gait-quality": "Gait Quality Assessment",
    "gait-quality-desc": "It's challenging to objectively evaluate the quality of your horse's gaits while riding. AI Dressage provides detailed analysis of rhythm, impulsion, and other key qualities across all gaits.",
    "training-plateaus": "Training Progression Plateaus",
    "training-plateaus-desc": "Many riders struggle to break through scoring plateaus. Our system identifies the highest-impact areas for improvement and suggests targeted exercises to elevate your performance.",

    // DisciplineSpecificTabs - Jumping  
    "elevating-jumping": "Elevating Your Show Jumping Excellence",
    "jumping-demands": "Show jumping requires split-second timing, precision, and mental toughness. AI Jump addresses the unique challenges that show jumping athletes face.",
    "approach-distance": "Approach and Distance Inconsistency",
    "approach-distance-desc": "Finding the perfect distance to each fence is crucial but challenging. Our AI analyzes your approach patterns to help you develop more consistent striding and takeoff points.",
    "position-faults": "Position Faults at Critical Moments",
    "position-faults-desc": "Rider position affects both safety and performance over fences. AI Jump identifies position changes during takeoff, flight, and landing that impact your effectiveness.",
    "course-strategy": "Course Strategy Optimization",
    "course-strategy-desc": "Walking courses effectively requires experience and strategy. Our system helps you analyze course design patterns and develop optimal riding plans for different track layouts.",
    "fault-pattern": "Fault Pattern Recognition",
    "fault-pattern-desc": "Understanding why faults occur is key to preventing them. AI Jump tracks fault patterns across different fence types and course conditions to reveal improvement opportunities.",
    "jump-type-difficulties": "Jump Type Difficulties",
    "jump-type-difficulties-desc": "Every horse and rider combination has strengths and challenges with different fence types. Our analysis identifies which obstacles need focused attention in your training program."
  },
  es: {
    // Navigation
    "home": "Inicio",
    "how-it-works": "Cómo Funciona",
    "pricing": "Precios",
    "blog": "Blog",
    "event": "Evento",
    "about": "Acerca de",
    "dashboard": "Panel",
    "profile-setup": "Configuración de Perfil",
    "sign-in": "Iniciar Sesión",
    "sign-out": "Cerrar Sesión",
    "get-started": "Comenzar",
    
    // Blog page
    "blog-title": "Blog de Excelencia Ecuestre",
    "blog-description": "Conocimientos de expertos, consejos de entrenamiento y las últimas innovaciones en deportes ecuestres.",
    "search-placeholder": "Buscar artículos...",
    "all-posts": "Todos los Artículos",
    "jumping": "Salto",
    "dressage": "Doma",
    "all-categories": "Todas las Categorías",
    "technology": "Tecnología",
    "analytics": "Analítica",
    "training": "Entrenamiento",
    "guides": "Guías",
    "competition": "Competición",
    "latest-articles": "Últimos Artículos",
    "results": "Resultados",
    "result": "Resultado",
    "no-articles": "No se encontraron artículos",
    "adjust-filters": "Intenta ajustar tus filtros o término de búsqueda",
    "clear-filters": "Borrar todos los filtros",
    "newsletter-title": "Suscríbete a Nuestro Boletín",
    "newsletter-description": "Recibe los últimos conocimientos ecuestres y actualizaciones directamente en tu bandeja de entrada.",
    "email-placeholder": "Tu dirección de correo electrónico",
    "subscribe": "Suscribirse",
    "read": "Leer",
    "read-article": "Leer Artículo",
    
    // Coming Soon
    "coming-soon": "Próximamente",
    "notify-me": "Notificarme",
    "sending": "Enviando...",
    "pricing-waitlist": "Actualmente estamos finalizando nuestros planes de precios. Únete a nuestra lista de espera para recibir una notificación cuando las suscripciones estén disponibles.",
    
    // Pricing
    "simple-pricing": "Precios Simples y Transparentes",
    "try-free": "Prueba gratis con una prueba, luego elige el plan que mejor se adapte a tus necesidades de entrenamiento.",
    "annual": "Anual",
    "monthly": "Mensual",
    "save-annual": "Ahorra 20% con facturación anual",
    "features-include": "Las características incluyen:",
    "billed-annually": "Facturado anualmente",
    "year": "año",
    "most-popular": "Más Popular",
    "help-choosing": "¿Necesitas ayuda para elegir?",
    "help-text": "Nuestro equipo está aquí para ayudarte a seleccionar el mejor plan para tus necesidades de entrenamiento. Contáctanos para recibir asistencia personalizada.",
    "contact-support": "Contactar Soporte",
    
    // FAQ
    "faq-title": "Preguntas Frecuentes",
    "faq-description": "¿Tienes preguntas sobre el Entrenador AI de Doma? Encuentra respuestas a las preguntas más comunes a continuación.",
    "still-questions": "¿Todavía tienes preguntas?",
    "questions-text": "Si no pudiste encontrar la respuesta a tu pregunta, no dudes en contactar a nuestro equipo de soporte.",
    
    // Profile
    "goals": "Objetivos",
    "edit": "Editar",
    "short-term": "Corto plazo (3 meses)",
    "medium-term": "Medio plazo (6 meses)",
    "long-term": "Largo plazo (más de 1 año)",
    "by": "Para el",
    
    // Newsletter Form
    "newsletter-subscribe": "Suscribirse",
    "newsletter-subscribing": "Suscribiendo...",
    "your-email": "Tu correo electrónico",
    "already-subscribed": "Ya suscrito",
    "subscription-successful": "¡Suscripción exitosa!",
    "thank-you-subscribing": "Gracias por suscribirte a nuestro boletín.",
    "subscription-failed": "Error en la suscripción",
    "problem-subscribing": "Hubo un problema al suscribirse al boletín. Por favor, inténtalo de nuevo.",
    
    // Home page
    "next-gen-training": "Entrenamiento de Doma de Próxima Generación",
    "transform-training": "Transforma Tu Entrenamiento de Doma con IA",
    "upload-description": "Sube tus hojas de puntuación, obtén análisis impulsado por IA y recibe recomendaciones de entrenamiento personalizadas para mejorar tu rendimiento.",
    "get-started-button": "Comenzar",
    "how-it-works-button": "Cómo Funciona",
    "riders-love": "Más de 500 jinetes adoran nuestra plataforma",
    "how-works-title": "Cómo Funciona el Entrenador de Doma con IA",
    "innovative-platform": "Nuestra plataforma innovadora utiliza IA avanzada para transformar tu enfoque de entrenamiento de doma",
    "upload-score-sheets": "Subir Hojas de Puntuación",
    "upload-score-description": "Toma una foto o sube tus hojas de puntuación de prueba de doma a través de nuestra interfaz intuitiva.",
    "ai-processing": "Procesamiento de IA",
    "ai-processing-description": "Nuestra IA avanzada analiza tus puntuaciones, identificando patrones y áreas de mejora.",
    "detailed-analysis": "Análisis Detallado",
    "detailed-analysis-description": "Recibe análisis completos de tu rendimiento con visualizaciones analíticas.",
    "custom-recommendations": "Recomendaciones Personalizadas",
    "custom-recommendations-description": "Obtén ejercicios de entrenamiento personalizados adaptados a tus áreas específicas de mejora.",
    "benefits-title": "Beneficios Que Marcan la Diferencia",
    "benefits-description": "Nuestra plataforma impulsada por IA ayuda a jinetes de todos los niveles a alcanzar sus objetivos más rápido con información basada en datos y recomendaciones personalizadas.",
    "advanced-movement": "Análisis avanzado de movimiento y predicción de puntuación",
    "personalized-plans": "Planes de entrenamiento personalizados basados en los resultados de tus pruebas",
    "track-improvements": "Seguimiento de mejoras a lo largo del tiempo con métricas detalladas",
    "learn-how": "Aprende Cómo Funciona",
    "personalized-analysis": "Análisis Personalizado",
    "personalized-analysis-description": "Nuestra IA analiza tus patrones de conducción únicos y los resultados de las pruebas para proporcionar retroalimentación adaptada específicamente a tus fortalezas y debilidades.",
    "accelerated-progress": "Progreso Acelerado",
    "accelerated-progress-description": "Los jinetes que utilizan nuestra plataforma mejoran 3 veces más rápido con ejercicios dirigidos a abordar áreas específicas de mejora identificadas por nuestra IA.",
    "competition-edge": "Ventaja Competitiva",
    "competition-edge-description": "Obtén información sobre exactamente lo que buscan los jueces y cómo mostrar los mejores movimientos de tu caballo para maximizar tus puntuaciones.",
    "efficient-training": "Entrenamiento Eficiente",
    "efficient-training-description": "Ahorra tiempo y dinero centrando tus sesiones de entrenamiento en los ejercicios que tendrán el mayor impacto en tu rendimiento.",
    "results-measure": "Resultados Que Puedes Medir",
    "achieve-goals": "Logra Tus Objetivos de Competición",
    "analytics-description": "Nuestro análisis completo sigue tu mejora a través de múltiples pruebas, ayudándote a ver exactamente dónde estás progresando. Nuestros usuarios informan mejoras promedio de puntuación de 2-5 puntos porcentuales en sus primeros tres meses.",
    "avg-score": "Aumento Promedio de Puntuación",
    "rider-satisfaction": "Satisfacción del Jinete",
    "tests-analyzed": "Pruebas Analizadas",
    "see-how": "Ver Cómo Funciona",
    
    // Footer
    "transform-equestrian": "Transforma tu entrenamiento ecuestre con análisis impulsado por IA y recomendaciones personalizadas.",
    "navigation": "Navegación",
    "ai-dressage": "Entrenador de Doma con IA",
    "ai-jumping": "Entrenador de Salto con IA",
    "legal": "Legal",
    "terms": "Términos de Servicio",
    "privacy": "Política de Privacidad",
    "contact-us": "Contáctanos",
    "newsletter-signup": "Suscríbete a nuestro boletín",
    "all-rights": "Todos los derechos reservados.",

    // Additional UI Elements
    "log-in": "Iniciar Sesión",
    "admin-dashboard": "Panel de Administración",
    "my-account": "Mi Cuenta",
    "toggle-theme": "Cambiar tema",
    "light": "Claro",
    "dark": "Oscuro",
    "system": "Sistema",
    "close-menu": "Cerrar menú",
    "open-menu": "Abrir menú",
    "page-not-found": "¡Ups! Página no encontrada",
    "return-to-home": "Volver al Inicio",
    "our-core-values": "Nuestros Valores Fundamentales",
    "innovation": "Innovación",
    "innovation-desc": "Superando los límites de lo posible en el entrenamiento ecuestre",
    "precision": "Precisión",
    "precision-desc": "Entregando análisis y recomendaciones precisos y confiables",
    "community": "Comunidad",
    "community-desc": "Construyendo una red de apoyo de jinetes y entrenadores",
    "tradition": "Tradición",
    "tradition-desc": "Respetando los principios clásicos mientras abrazamos la tecnología",

    // DisciplineSpecificTabs - Dressage
    "elevating-dressage": "Elevando Tu Trayectoria en Doma",
    "dressage-demands": "La doma exige precisión, armonía y mejora constante. AI Dressage aborda los desafíos específicos que enfrentan los jinetes de doma.",
    "inconsistent-test-scores": "Puntuaciones de Prueba Inconsistentes",
    "inconsistent-test-desc": "Los jinetes de doma a menudo experimentan fluctuaciones frustrantes en las puntuaciones sin entender por qué. AI Dressage analiza tus hojas de puntuación para identificar patrones y movimientos específicos que afectan tu rendimiento general.",
    "difficulty-interpreting": "Dificultad para Interpretar Comentarios de Jueces",
    "difficulty-interpreting-desc": "Los comentarios de los jueces pueden ser crípticos o abrumadores. Nuestro sistema sintetiza comentarios de múltiples pruebas para revelar información práctica sobre tu ejecución técnica.",
    "position-flaws": "Fallas de Posición Durante Movimientos",
    "position-flaws-desc": "Pequeños problemas de alineación pueden impactar significativamente la calidad del movimiento. Nuestro análisis de video identifica inconsistencias de posición en momentos críticos de tu monta.",
    "gait-quality": "Evaluación de Calidad de Aires",
    "gait-quality-desc": "Es desafiante evaluar objetivamente la calidad de los aires de tu caballo mientras montas. AI Dressage proporciona análisis detallado de ritmo, impulsión y otras cualidades clave en todos los aires.",
    "training-plateaus": "Mesetas de Progresión de Entrenamiento",
    "training-plateaus-desc": "Muchos jinetes luchan por superar las mesetas de puntuación. Nuestro sistema identifica las áreas de mayor impacto para la mejora y sugiere ejercicios específicos para elevar tu rendimiento.",

    // DisciplineSpecificTabs - Jumping  
    "elevating-jumping": "Elevando Tu Excelencia en Salto",
    "jumping-demands": "El salto requiere sincronización de fracción de segundo, precisión y fortaleza mental. AI Jump aborda los desafíos únicos que enfrentan los atletas de salto.",
    "approach-distance": "Inconsistencia de Aproximación y Distancia",
    "approach-distance-desc": "Encontrar la distancia perfecta a cada valla es crucial pero desafiante. Nuestra IA analiza tus patrones de aproximación para ayudarte a desarrollar trancos más consistentes y puntos de despegue.",
    "position-faults": "Fallas de Posición en Momentos Críticos",
    "position-faults-desc": "La posición del jinete afecta tanto la seguridad como el rendimiento sobre las vallas. AI Jump identifica cambios de posición durante el despegue, vuelo y aterrizaje que impactan tu efectividad.",
    "course-strategy": "Optimización de Estrategia de Recorrido",
    "course-strategy-desc": "Caminar recorridos efectivamente requiere experiencia y estrategia. Nuestro sistema te ayuda a analizar patrones de diseño de recorridos y desarrollar planes de monta óptimos para diferentes trazados.",
    "fault-pattern": "Reconocimiento de Patrones de Fallas",
    "fault-pattern-desc": "Entender por qué ocurren las fallas es clave para prevenirlas. AI Jump rastrea patrones de fallas a través de diferentes tipos de vallas y condiciones de recorrido para revelar oportunidades de mejora.",
    "jump-type-difficulties": "Dificultades con Tipos de Saltos",
    "jump-type-difficulties-desc": "Cada combinación de caballo y jinete tiene fortalezas y desafíos con diferentes tipos de vallas. Nuestro análisis identifica qué obstáculos necesitan atención enfocada en tu programa de entrenamiento."
  }
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  translations: defaultTranslations
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    return (savedLanguage === 'es' ? 'es' : 'en') as Language;
  });

  const setLanguage = (newLanguage: Language) => {
    localStorage.setItem('preferred-language', newLanguage);
    setLanguageState(newLanguage);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage,
      translations: defaultTranslations
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
