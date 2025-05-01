
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Mail 
} from 'lucide-react';
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
              <h2 className="font-serif text-2xl font-semibold text-white">
                AI Equestrian
              </h2>
            </Link>
            <p className="mt-4 text-purple-200 text-sm leading-relaxed">
              {language === 'en' 
                ? "Transform your equestrian training with AI-powered analysis and personalized recommendations."
                : "Transforma tu entrenamiento ecuestre con análisis impulsado por IA y recomendaciones personalizadas."}
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-purple-300 hover:text-white transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-purple-300 hover:text-white transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-purple-300 hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-purple-300 hover:text-white transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-serif text-lg font-medium mb-4">
              {language === 'en' ? "Navigation" : "Navegación"}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-purple-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "Home" : "Inicio"}
                </Link>
              </li>
              <li>
                <Link to="/dressage" className="text-purple-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "AI Dressage Trainer" : "Entrenador de Doma con IA"}
                </Link>
              </li>
              <li>
                <Link to="/jumping" className="text-purple-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "AI Jumping Trainer" : "Entrenador de Salto con IA"}
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-purple-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "How It Works" : "Cómo Funciona"}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-purple-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "Pricing" : "Precios"}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-purple-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "Blog" : "Blog"}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-purple-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "About" : "Acerca de"}
                </Link>
              </li>
              <li>
                <Link to="/sign-in" className="text-purple-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "Sign In" : "Iniciar Sesión"}
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-serif text-lg font-medium mb-4">
              {language === 'en' ? "Legal" : "Legal"}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-purple-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "Terms of Service" : "Términos de Servicio"}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-purple-300 hover:text-white transition-colors text-sm">
                  {language === 'en' ? "Privacy Policy" : "Política de Privacidad"}
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-serif text-lg font-medium mb-4">
              {language === 'en' ? "Contact Us" : "Contáctanos"}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail size={16} className="mr-2 mt-1 text-purple-300" />
                <a href="mailto:info@equineaintelligence.com" className="text-purple-300 hover:text-white transition-colors text-sm">
                  info@equineaintelligence.com
                </a>
              </li>
            </ul>
            
            <div className="mt-6">
              <h4 className="font-serif text-base font-medium mb-2">
                {language === 'en' ? "Subscribe to our newsletter" : "Suscríbete a nuestro boletín"}
              </h4>
              <NewsletterForm />
            </div>
          </div>
        </div>
        
        <div className="border-t border-purple-800 mt-12 pt-8 text-center text-purple-400 text-sm">
          <p>© {new Date().getFullYear()} AI Equestrian. {language === 'en' ? "All rights reserved." : "Todos los derechos reservados."}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
