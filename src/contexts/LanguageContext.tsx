
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
    
    // Core values
    "innovation": "Innovation",
    "innovation-desc": "Pushing the boundaries of what's possible in equestrian training",
    "precision": "Precision",
    "precision-desc": "Delivering accurate, reliable analysis and recommendations",
    "community": "Community",
    "community-desc": "Building a supportive network of riders and trainers",
    "tradition": "Tradition",
    "tradition-desc": "Respecting classical principles while embracing technology",
    
    // Team section
    "meet-our-team": "Meet Our Team",
    "team-description": "We're a dedicated team of dressage experts and AI specialists passionate about transforming dressage training.",
    "view-linkedin": "View LinkedIn Profile",
    "our-approach": "Our Approach",
    "data-driven": "Data-Driven",
    "data-driven-desc": "We utilize advanced data analytics to provide riders with actionable insights for improvement.",
    "personalized": "Personalized",
    "personalized-desc": "Every rider receives custom training plans tailored to their specific goals and challenges.",
    "accessible": "Accessible",
    "accessible-desc": "We make elite-level dressage training accessible to riders worldwide, regardless of location.",
    "experience-ai-training": "Experience AI Dressage Training",
    "have-questions": "Have questions about our platform or want to learn more about how AI Dressage Trainer can help you achieve your riding goals? Get in touch with our team.",
    "start-free-trial": "Start Free Trial",
    "send-message": "Send a Message",
    
    // Mission section
    "about-ai-trainer": "About AI Dressage Trainer",
    "mission-description": "We're on a mission to transform dressage training through the power of artificial intelligence.",
    "our-vision": "Our Vision",
    "mission-vision": "Our Mission & Vision",
    "mission-text1": "At AI Dressage Trainer, we believe that technology can enhance the time-honored tradition of dressage training. Our mission is to democratize access to elite-level dressage education by leveraging artificial intelligence to provide personalized, data-driven insights to riders of all levels.",
    "mission-text2": "We envision a world where every dressage rider, regardless of location or resources, can receive tailored guidance to improve their performance and strengthen the partnership with their horse.",
    "mission-text3": "Our platform was born from a simple observation: while competition score sheets contain valuable feedback, riders often struggle to translate that feedback into effective training strategies. By harnessing the power of AI, we bridge that gap, turning judge's comments and scores into actionable training plans.",
    "problem-solving": "The Problem We're Solving",
    "problem-description": "Dressage riders face unique challenges in their training journey:",
    "problem1": "Competition feedback is valuable but often inconsistent across judges and competitions",
    "problem2": "Many riders have limited access to high-quality coaching and structured training programs",
    "problem3": "It's difficult to objectively track progress and identify patterns across multiple performances",
    "problem4": "Translating test scores into effective training exercises requires deep expertise",
    "solution-text": "Our AI-powered platform addresses these challenges by providing objective analysis, personalized recommendations, and structured progress tracking that complements traditional training methods.",
    "our-approach-title": "Our Approach",
    "active-riders": "Active Riders",
    "tests-analyzed-alt": "Tests Analyzed",
    "user-satisfaction": "User Satisfaction",
    "core-values": "Our Core Values",
    
    // Additional FAQ
    "questions-title": "Still have questions?",
    
    // Testimonials
    "what-users-say": "What Our Users Say",
    "testimonials-desc": "Hear from riders who have transformed their dressage training with our AI platform",
    "amateur-rider": "Amateur Dressage Rider",
    "professional-trainer": "Professional Trainer",
    "fei-competitor": "FEI Level Competitor",
    "testimonial1": "AI Dressage Trainer has completely transformed my training approach. The personalized recommendations helped me improve my scores by 12% in just three months!",
    "testimonial2": "As a trainer working with multiple students, this platform has been invaluable. The AI analysis spots patterns I might miss, and the exercise recommendations are spot on.",
    "testimonial3": "The detailed breakdown of my test scores has helped me focus my training on specific movements. The AI recommendations are surprisingly insightful.",
    "ready-transform": "Ready to Transform Your Dressage Training?",
    "join-riders": "Join hundreds of riders who have improved their performance with AI-powered analysis and personalized training recommendations.",
    "start-free-trial-btn": "Start Free Trial",
    "advanced-ai-analysis": "Advanced AI Analysis",
    "upload-feedback": "Upload your score sheets for instant AI-powered feedback",
    "personalized-training": "Personalized Training",
    "tailored-exercises": "Get tailored exercises based on your specific needs",
    "progress-tracking": "Progress Tracking",
    "monitor-improvement": "Monitor your improvement with detailed analytics",
    "comprehensive-library": "Comprehensive Library",
    "exercise-access": "Access to 200+ dressage training exercises",
    
    // Performance stats
    "performance-overview": "Performance Overview",
    "average-score": "Average Score",
    "tests-analyzed-title": "Tests Analyzed",
    "strongest-movement": "Strongest Movement", 
    "focus-area": "Focus Area",
    "not-available": "Not Available",
    "no-data-yet": "No data yet",
    "upload-first-test": "Upload your first test",
    
    // Dashboard header
    "welcome": "Welcome, ",
    "track-progress": "Track your progress and upload new dressage tests",
    
    // Benefits section
    "what-you-benefit": "What You Benefit From",
    "performance-analysis": "Performance Analysis",
    "performance-analysis-desc": "Get instant, AI-powered feedback and trends from your dressage and jumping videos.",
    "personalized-training-title": "Personalized Training",
    "personalized-training-desc": "Unlock personalized training suggestions tailored to your performance and goals.",
    "horse-management": "Horse Management",
    "horse-management-desc": "Easily track and manage progress for each of your horses in one place.",
    "user-dashboard": "User Dashboard",
    "user-dashboard-desc": "View all your rides, progress, and insights in one simple, personalized dashboard.",
    "event-management": "Event Management", 
    "event-management-desc": "Organize your events and give trainers direct access to your performance dashboard.",
    "coach-collaboration": "Coach Collaboration",
    "coach-collaboration-desc": "Connect with your coach to share feedback, track progress, and train smarter together."
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
    
    // Core values
    "innovation": "Innovación",
    "innovation-desc": "Ampliando los límites de lo posible en el entrenamiento ecuestre",
    "precision": "Precisión",
    "precision-desc": "Proporcionando análisis y recomendaciones precisos y confiables",
    "community": "Comunidad",
    "community-desc": "Construyendo una red de apoyo de jinetes y entrenadores",
    "tradition": "Tradición",
    "tradition-desc": "Respetando los principios clásicos mientras adoptamos la tecnología",
    
    // Team section
    "meet-our-team": "Conoce a Nuestro Equipo",
    "team-description": "Somos un equipo dedicado de expertos en doma e especialistas en IA apasionados por transformar el entrenamiento de doma.",
    "view-linkedin": "Ver Perfil de LinkedIn",
    "our-approach": "Nuestro Enfoque",
    "data-driven": "Basado en Datos",
    "data-driven-desc": "Utilizamos análisis de datos avanzados para proporcionar a los jinetes información procesable para mejorar.",
    "personalized": "Personalizado",
    "personalized-desc": "Cada jinete recibe planes de entrenamiento personalizados adaptados a sus objetivos y desafíos específicos.",
    "accessible": "Accesible",
    "accessible-desc": "Hacemos que el entrenamiento de doma de nivel élite sea accesible para jinetes de todo el mundo, independientemente de la ubicación.",
    "experience-ai-training": "Experimenta el Entrenamiento de Doma con IA",
    "have-questions": "¿Tienes preguntas sobre nuestra plataforma o quieres aprender más sobre cómo AI Dressage Trainer puede ayudarte a lograr tus objetivos de equitación? Ponte en contacto con nuestro equipo.",
    "start-free-trial": "Comenzar Prueba Gratuita",
    "send-message": "Enviar un Mensaje",
    
    // Mission section
    "about-ai-trainer": "Acerca del Entrenador de Doma con IA",
    "mission-description": "Estamos en una misión de transformar el entrenamiento de doma a través del poder de la inteligencia artificial.",
    "our-vision": "Nuestra Visión",
    "mission-vision": "Nuestra Misión y Visión",
    "mission-text1": "En AI Dressage Trainer, creemos que la tecnología puede mejorar la tradición consagrada del entrenamiento de doma. Nuestra misión es democratizar el acceso a la educación de doma de nivel élite aprovechando la inteligencia artificial para proporcionar información personalizada y basada en datos a jinetes de todos los niveles.",
    "mission-text2": "Visualizamos un mundo donde cada jinete de doma, independientemente de la ubicación o los recursos, puede recibir orientación personalizada para mejorar su rendimiento y fortalecer la asociación con su caballo.",
    "mission-text3": "Nuestra plataforma nació de una observación simple: aunque las hojas de puntuación de competición contienen comentarios valiosos, los jinetes a menudo luchan por traducir esos comentarios en estrategias de entrenamiento efectivas. Al aprovechar el poder de la IA, cerramos esa brecha, convirtiendo los comentarios y puntuaciones de los jueces en planes de entrenamiento accionables.",
    "problem-solving": "El Problema que Estamos Resolviendo",
    "problem-description": "Los jinetes de doma enfrentan desafíos únicos en su viaje de entrenamiento:",
    "problem1": "Los comentarios de competición son valiosos pero a menudo inconsistentes entre jueces y competiciones",
    "problem2": "Muchos jinetes tienen acceso limitado a entrenamiento de alta calidad y programas de entrenamiento estructurados",
    "problem3": "Es difícil rastrear objetivamente el progreso e identificar patrones en múltiples actuaciones",
    "problem4": "Traducir las puntuaciones de las pruebas en ejercicios de entrenamiento efectivos requiere experiencia profunda",
    "solution-text": "Nuestra plataforma impulsada por IA aborda estos desafíos proporcionando análisis objetivo, recomendaciones personalizadas y seguimiento de progreso estructurado que complementa los métodos de entrenamiento tradicionales.",
    "our-approach-title": "Nuestro Enfoque",
    "active-riders": "Jinetes Activos",
    "tests-analyzed-alt": "Pruebas Analizadas",
    "user-satisfaction": "Satisfacción del Usuario",
    "core-values": "Nuestros Valores Fundamentales",
    
    // Additional FAQ
    "questions-title-alt": "¿Todavía tienes preguntas?",
    
    // Testimonials
    "what-users-say": "Lo que Dicen Nuestros Usuarios",
    "testimonials-desc": "Escucha a los jinetes que han transformado su entrenamiento de doma con nuestra plataforma de IA",
    "amateur-rider": "Jinete de Doma Aficionada",
    "professional-trainer": "Entrenador Profesional",
    "fei-competitor": "Competidora Nivel FEI",
    "testimonial1": "AI Dressage Trainer ha transformado completamente mi enfoque de entrenamiento. Las recomendaciones personalizadas me ayudaron a mejorar mis puntuaciones en un 12% en solo tres meses!",
    "testimonial2": "Como entrenador trabajando con múltiples estudiantes, esta plataforma ha sido invaluable. El análisis de IA detecta patrones que podría pasar por alto, y las recomendaciones de ejercicios son muy acertadas.",
    "testimonial3": "El desglose detallado de mis puntuaciones de prueba me ha ayudado a enfocar mi entrenamiento en movimientos específicos. Las recomendaciones de IA son sorprendentemente perspicaces.",
    "ready-transform": "¿Estás listo para transformar tu entrenamiento de doma?",
    "join-riders": "Únase a cientos de ciclistas que han mejorado su rendimiento con análisis impulsados por IA y recomendaciones de entrenamiento personalizadas.",
    "start-free-trial-btn": "Comience una prueba gratuita",
    "advanced-ai-analysis": "Análisis avanzado de IA",
    "upload-feedback": "Sube tus hojas de puntuación para recibir comentarios instantáneos impulsados por IA",
    "personalized-training": "Entrenamiento personalizado",
    "tailored-exercises": "Obtenga ejercicios personalizados según sus necesidades específicas",
    "progress-tracking": "Seguimiento del progreso",
    "monitor-improvement": "Monitorea tu mejora con análisis detallados",
    "comprehensive-library": "Biblioteca completa",
    "exercise-access": "Acceso a más de 200 ejercicios de entrenamiento de doma",
    
    // Performance stats
    "performance-overview": "Resumen de Rendimiento",
    "average-score": "Puntuación Media",
    "tests-analyzed-title": "Pruebas Analizadas",
    "strongest-movement": "Movimiento Más Fuerte", 
    "focus-area": "Área de Enfoque",
    "not-available": "No Disponible",
    "no-data-yet": "Sin datos aún",
    "upload-first-test": "Sube tu primera prueba",
    
    // Dashboard header
    "welcome": "Bienvenido, ",
    "track-progress": "Sigue tu progreso y sube nuevas pruebas de doma",
    
    // Benefits section
    "what-you-benefit": "De qué se beneficia",
    "performance-analysis": "Análisis de Rendimiento",
    "performance-analysis-desc": "Obtén retroalimentación instantánea e insights impulsados por IA de tus videos de doma y salto.",
    "personalized-training-title": "Entrenamiento Personalizado",
    "personalized-training-desc": "Desbloquea sugerencias de entrenamiento personalizadas adaptadas a tu rendimiento y objetivos.",
    "horse-management": "Gestión de Caballos",
    "horse-management-desc": "Rastrea y gestiona fácilmente el progreso de cada uno de tus caballos en un solo lugar.",
    "user-dashboard": "Panel de Usuario",
    "user-dashboard-desc": "Ve todas tus montas, progreso e insights en un panel simple y personalizado.",
    "event-management": "Gestión de Eventos", 
    "event-management-desc": "Organiza tus eventos y da a los entrenadores acceso directo a tu panel de rendimiento.",
    "coach-collaboration": "Colaboración con Entrenador",
    "coach-collaboration-desc": "Conéctate con tu entrenador para compartir retroalimentación, rastrear progreso y entrenar de manera más inteligente juntos."
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
