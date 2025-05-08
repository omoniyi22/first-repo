
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#2c2c2c] to-[#1a1a1a] text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo Area */}
          <div>
            <div className="mb-4">
              <Link to="/" className="inline-block">
                {/* White logo version as specified in style guide */}
                <h3 className="text-xl font-serif font-semibold text-white">AI Equestrian</h3>
              </Link>
            </div>
            <p className="text-gray-300 font-sans text-sm mb-2">
              Riding Intelligence, Redefined
            </p>
            <p className="text-gray-400 font-sans text-xs">
              &copy; 2025 AI Equestrian. All rights reserved.
            </p>
          </div>

          {/* Navigation Area */}
          <div>
            <h4 className="text-base font-sans font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white font-sans text-sm transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-white font-sans text-sm transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-white font-sans text-sm transition-colors">Pricing</Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white font-sans text-sm transition-colors">Blog</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white font-sans text-sm transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Contact/Social Area */}
          <div>
            <h4 className="text-base font-sans font-bold text-white mb-4">Connect With Us</h4>
            
            {/* Social Media - vertical layout */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <a 
                  href="https://instagram.com/aiequestrian" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <Instagram className="w-6 h-6 mr-2" />
                  <span className="font-sans text-sm">@aiequestrian</span>
                </a>
              </div>
              
              <div className="flex items-center">
                <a 
                  href="mailto:info@aiequestrian.com" 
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <Mail className="w-6 h-6 mr-2" />
                  <span className="font-sans text-sm">info@aiequestrian.com</span>
                </a>
              </div>
            </div>
            
            <p className="text-gray-300 mt-4 font-sans text-sm">
              Follow us for updates and insights into AI-powered equestrian training.
            </p>
          </div>
        </div>

        {/* Footer Bottom with border as per style guide */}
        <div className="mt-12 text-center border-t border-gray-700 pt-8">
          <p className="font-sans text-xs text-white">
            AI Equestrian is dedicated to revolutionizing equestrian training through artificial intelligence.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
