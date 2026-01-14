import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { language } = useLanguage();
  return (
    <footer className="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* First Section - About */}
          <div>
            <h4 className="text-2xl font-serif mb-3">
              {language === "en" ? "AI Equestrian" : "IA Ecuestre"}
            </h4>
            <p className="mb-2 text-white">
              {language === "en"
                ? "Riding Intelligence, Redefined"
                : "La inteligencia de conducción, redefinida"}
            </p>
            <p className="text-white/90 mb-6">
              {language === "en"
                ? "AI Equestrian is dedicated to revolutionizing equestrian training through the power of artificial intelligence."
                : "AI Equestrian se dedica a revolucionar el entrenamiento ecuestre a través del poder de la inteligencia artificial."}
            </p>
            <div>
              <Link to="/about" className="text-white hover:underline">
                {language === "en" ? "Learn More" : "Más información"}
              </Link>
            </div>
          </div>

          {/* Second Section - Navigation Links */}
          <div className="mt-2 md:justify-items-center">
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-white hover:underline">
                  {language === "en" ? "Home" : "Hogar"}
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-white hover:underline">
                  {language === "en" ? "How It Works" : "Cómo funciona"}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-white hover:underline">
                  {language === "en" ? "Pricing" : "Precios"}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white hover:underline">
                  {language === "en" ? "Blog" : "Blog"}
                </Link>
              </li>
              <li>
                <Link
                  to="mailto:info@equineaintelligence.com"
                  className="text-white hover:underline"
                >
                  {language === "en" ? "Contact" : "Contacto"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Third Section - Connect With Us */}
          <div>
            <h4 className="text-2xl font-serif mb-3">
              {language === "en" ? "Connect With Us" : "Conéctate con nosotros"}
            </h4>

            <div className="space-y-3 mb-4">
              <div className="flex items-center">
                <a
                  href="https://instagram.com/ai_equestrian"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline flex items-center"
                >
                  <Instagram className="w-5 h-5 mr-2" />
                  <span>@ai_equestrian</span>
                </a>
              </div>

              <div className="flex items-center">
                <a
                  href="mailto:info@equineaintelligence.com"
                  className="text-white hover:underline flex items-center"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  <span>info@equineaintelligence.com</span>
                </a>
              </div>
            </div>

            <p className="text-white/90">
              {language === "en"
                ? "Follow us for updates and insights into AI-powered equestrian training."
                : "Síganos para obtener actualizaciones e información sobre el entrenamiento ecuestre impulsado por IA."}
            </p>
          </div>
        </div>

        {/* Footer Divider */}
        <div className="border-t border-white/20 my-8"></div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row md:justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-white/80">
              &copy;
              {language === "en"
                ? "2026 AI Equestrian. All rights reserved"
                : "2026 AI Equestrian. Todos los derechos reservados."}
            </p>
          </div>
          <div className="flex space-x-6">
            <Link to="/terms" className="text-white hover:underline capitalize">
              {language === "en"
                ? "Terms & Conditions"
                : "Términos y condiciones"}
            </Link>
            <Link
              to="/privacy"
              className="text-white hover:underline capitalize"
            >
              {language === "en" ? "Privacy Policy" : "política de privacidad"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
