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
    "about": "About",
    "dashboard": "Dashboard",
    "profile-setup": "Profile Setup",
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
    
    // Dressage How It Works page
    "ai-dressage-how-it-works": "How AI Dressage Trainer Works",
    "ai-dressage-how-it-works-description": "Our innovative platform uses advanced AI to transform how you approach dressage training",
    "ai-dressage-step-1-title": "Upload Score Sheets",
    "ai-dressage-step-1-description": "Take a photo or upload your dressage test score sheets through our intuitive interface.",
    "ai-dressage-step-2-title": "AI Processing",
    "ai-dressage-step-2-description": "Our advanced AI analyzes your scores, identifying patterns and areas for improvement.",
    "ai-dressage-step-3-title": "Personalized Recommendations",
    "ai-dressage-step-3-description": "Get tailored training exercises designed to address your specific improvement areas.",
    "get-started-dressage": "Get Started with AI Dressage",
    
    // Dressage FAQ
    "dressage-faq-title": "Frequently Asked Questions About AI Dressage",
    "dressage-faq-question-1": "How does AI enhance dressage training?",
    "dressage-faq-answer-1": "Our AI technology analyzes your movements, positions, and techniques in real-time, providing immediate feedback that would normally require a coach's eye. This allows for more efficient training sessions and faster improvement.",
    "dressage-faq-question-2": "Can AI Dressage replace my trainer?",
    "dressage-faq-answer-2": "Absolutely not. AI Dressage is designed to complement your training routine and support your work with your coach. It provides data-driven insights between lessons to help you practice more effectively.",
    "dressage-faq-question-3": "What equipment do I need to use AI Dressage?",
    "dressage-faq-answer-3": "You'll need a smartphone or tablet with a camera for video recording, and our mobile app. For the best experience, we recommend a mounting device for your arena or a helper to record your sessions.",
    
    // Jumping How It Works page
    "ai-jumping-how-it-works": "How AI Jumping Trainer Works",
    "ai-jumping-how-it-works-description": "Discover how our AI technology analyzes your jumping performance and provides targeted recommendations",
    "ai-jumping-step-1-title": "Upload Jump Videos",
    "ai-jumping-step-1-description": "Upload videos of your jumping rounds or training sessions for comprehensive analysis.",
    "ai-jumping-step-2-title": "AI Analysis",
    "ai-jumping-step-2-description": "Our AI examines your approach, takeoff, and landing to identify areas for technical improvement.",
    "ai-jumping-step-3-title": "Performance Insights",
    "ai-jumping-step-3-description": "Receive detailed insights and specific exercises to improve your jumping technique.",
    "get-started-ai-jumping": "Get Started with AI Jumping",
    
    // Jumping FAQ
    "jumping-faq-title": "Frequently Asked Questions About AI Jumping",
    "jumping-faq-question-1": "How does the AI analyze jumping technique?",
    "jumping-faq-answer-1": "Our AI uses computer vision to analyze the horse and rider's position, timing, and trajectory throughout the jump. It measures angles, speed, and body position to identify technical improvements.",
    "jumping-faq-question-2": "Can AI Jumping help with course planning?",
    "jumping-faq-answer-2": "Yes, after analyzing your rounds, the AI can identify patterns in your riding and provide suggestions for more effective approaches to different types of jumps and course combinations.",
    "jumping-faq-question-3": "What video quality is required for accurate analysis?",
    "jumping-faq-answer-3": "For best results, we recommend stable footage shot from the side of the jump at a distance that captures the approach and landing. However, our AI can still provide valuable insights from most reasonably clear videos.",
    
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
    "all-rights": "All rights reserved."
  },
  es: {
    // Navigation
    "home": "Inicio",
    "how-it-works": "Cómo Funciona",
    "pricing": "Precios",
    "blog": "Blog",
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
    
    // Dressage How It Works page
    "ai-dressage-how-it-works": "Cómo Funciona el Entrenador de Doma con IA",
    "ai-dressage-how-it-works-description": "Nuestra plataforma innovadora utiliza IA avanzada para transformar tu enfoque de entrenamiento de doma",
    "ai-dressage-step-1-title": "Subir Hojas de Puntuación",
    "ai-dressage-step-1-description": "Toma una foto o sube tus hojas de puntuación de prueba de doma a través de nuestra interfaz intuitiva.",
    "ai-dressage-step-2-title": "Procesamiento de IA",
    "ai-dressage-step-2-description": "Nuestra IA avanzada analiza tus puntuaciones, identificando patrones y áreas de mejora.",
    "ai-dressage-step-3-title": "Recomendaciones Personalizadas",
    "ai-dressage-step-3-description": "Obtén ejercicios de entrenamiento personalizados diseñados para abordar tus áreas específicas de mejora.",
    "get-started-dressage": "Comenzar con IA Doma",
    
    // Dressage FAQ
    "dressage-faq-title": "Preguntas Frecuentes sobre IA Doma",
    "dressage-faq-question-1": "¿Cómo mejora la IA el entrenamiento de doma?",
    "dressage-faq-answer-1": "Nuestra tecnología de IA analiza tus movimientos, posiciones y técnicas en tiempo real, proporcionando retroalimentación inmediata que normalmente requeriría el ojo de un entrenador. Esto permite sesiones de entrenamiento más eficientes y una mejora más rápida.",
    "dressage-faq-question-2": "¿Puede IA Doma reemplazar a mi entrenador?",
    "dressage-faq-answer-2": "Absolutamente no. IA Doma está diseñado para complementar tu rutina de entrenamiento y apoyar tu trabajo con tu entrenador. Proporciona información basada en datos entre las lecciones para ayudarte a practicar de manera más efectiva.",
    "dressage-faq-question-3": "¿Qué equipo necesito para usar IA Doma?",
    "dressage-faq-answer-3": "Necesitarás un smartphone o tablet con cámara para grabar video, y nuestra aplicación móvil. Para la mejor experiencia, recomendamos un dispositivo de montaje para tu arena o un ayudante para grabar tus sesiones.",
    
    // Jumping How It Works page
    "ai-jumping-how-it-works": "Cómo Funciona el Entrenador de Salto con IA",
    "ai-jumping-how-it-works-description": "Descubre cómo nuestra tecnología de IA analiza tu rendimiento en saltos y proporciona recomendaciones específicas",
    "ai-jumping-step-1-title": "Subir Videos de Salto",
    "ai-jumping-step-1-description": "Sube videos de tus rondas de salto o sesiones de entrenamiento para un análisis completo.",
    "ai-jumping-step-2-title": "Análisis de IA",
    "ai-jumping-step-2-description": "Nuestra IA examina tu aproximación, despegue y aterrizaje para identificar áreas de mejora técnica.",
    "ai-jumping-step-3-title": "Información de Rendimiento",
    "ai-jumping-step-3-description": "Recibe información detallada y ejercicios específicos para mejorar tu técnica de salto.",
    "get-started-ai-jumping": "Comenzar con IA Salto",
    
    // Jumping FAQ
    "jumping-faq-title": "Preguntas Frecuentes sobre IA Salto",
    "jumping-faq-question-1": "¿Cómo analiza la IA la técnica de salto?",
    "jumping-faq-answer-1": "Nuestra IA utiliza visión por computadora para analizar la posición, el tiempo y la trayectoria del caballo y jinete durante todo el salto. Mide ángulos, velocidad y posición corporal para identificar mejoras técnicas.",
    "jumping-faq-question-2": "¿Puede IA Salto ayudar con la planificación del recorrido?",
    "jumping-faq-answer-2": "Sí, después de analizar tus rondas, la IA puede identificar patrones en tu forma de montar y proporcionar sugerencias para enfoques más efectivos a diferentes tipos de saltos y combinaciones de recorrido.",
    "jumping-faq-question-3": "¿Qué calidad de video se requiere para un análisis preciso?",
    "jumping-faq-answer-3": "Para obtener los mejores resultados, recomendamos imágenes estables tomadas desde el lateral del salto a una distancia que capture el acercamiento y el aterrizaje. Sin embargo, nuestra IA aún puede proporcionar información valiosa a partir de videos razonablemente claros.",
    
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
    "all-rights": "Todos los derechos reservados."
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
