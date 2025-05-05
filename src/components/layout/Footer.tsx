
import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';
import NewsletterForm from './NewsletterForm';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { language } = useLanguage();
  
  return (
    <footer className="bg-purple-950 text-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/ddb7f47e-072a-4346-9fd3-a8a055f13bba.png" 
                alt="AI Equestrian Logo" 
                className="h-12 w-12 mr-2" 
              />
              <h2 className="font-serif text-2xl font-semibold text-white">
                AI Equestrian
              </h2>
            </Link>
            <p className="mt-4 text-gray-200 text-sm leading-relaxed">
              {language === 'en' 
                ? "Transform your equestrian training with AI-powered analysis and personalized recommendations."
                : "Transforma tu entrenamiento ecuestre con análisis impulsado por IA y recomendaciones personalizadas."}
            </p>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-serif text-lg font-medium mb-4 text-white">
              {language === 'en' ? "Navigation" : "Navegación"}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "Home" : "Inicio"}
                </Link>
              </li>
              <li>
                <Link to="/dressage" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "AI Dressage Trainer" : "Entrenador de Doma con IA"}
                </Link>
              </li>
              <li>
                <Link to="/jumping" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "AI Jumping Trainer" : "Entrenador de Salto con IA"}
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "How It Works" : "Cómo Funciona"}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "Pricing" : "Precios"}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "Blog" : "Blog"}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "About" : "Acerca de"}
                </Link>
              </li>
              <li>
                <Link to="/sign-in" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "Sign In" : "Iniciar Sesión"}
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-serif text-lg font-medium mb-4 text-white">
              {language === 'en' ? "Legal" : "Legal"}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "Terms of Service" : "Términos de Servicio"}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "Privacy Policy" : "Política de Privacidad"}
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-serif text-lg font-medium mb-4 text-white">
              {language === 'en' ? "Contact Us" : "Contáctanos"}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail size={16} className="mr-2 mt-1 text-gray-300" />
                <a href="mailto:info@equineaintelligence.com" className="text-gray-300 hover:text-white transition-colors text-sm">
                  info@equineaintelligence.com
                </a>
              </li>
              <li className="flex items-center mt-2">
                <Instagram size={16} className="mr-2 text-gray-300" />
                <a 
                  href="https://www.instagram.com/ai_equestrian?igsh=MXU4ajRhdWtlYjMydA==" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                  aria-label="Instagram"
                >
                  ai_equestrian
                </a>
              </li>
            </ul>
            
            <div className="mt-6">
              <h4 className="font-serif text-base font-medium mb-2 text-white">
                {language === 'en' ? "Subscribe to our newsletter" : "Suscríbete a nuestro boletín"}
              </h4>
              <NewsletterForm />
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          <div className="flex justify-center items-center mb-4">
            <img 
              src="/lovable-uploads/ddb7f47e-072a-4346-9fd3-a8a055f13bba.png" 
              alt="AI Equestrian Logo" 
              className="h-8 w-8 mr-2" 
            />
            <span className="text-white">AI Equestrian</span>
          </div>
          <p>© {new Date().getFullYear()} AI Equestrian. {language === 'en' ? "All rights reserved." : "Todos los derechos reservados."}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
