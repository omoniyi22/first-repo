
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
    "by": "By"
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
    "by": "Para el"
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
