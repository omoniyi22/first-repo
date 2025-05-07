
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-purple-700 to-purple-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* First Section - About Us */}
          <div>
            <h4 className="text-lg font-semibold mb-4">About AI Equestrian</h4>
            <p className="text-gray-300">
              AI Equestrian is dedicated to revolutionizing equestrian training through the power of artificial intelligence.
            </p>
            <div className="mt-4">
              <Link to="/about" className="text-purple-300 hover:underline">Learn More</Link>
            </div>
          </div>

          {/* Second Section - Links (without title) */}
          <div>
            <ul className="text-gray-300">
              <li className="mb-2">
                <Link to="/" className="text-gray-300 hover:text-white hover:underline transition-colors">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/how-it-works" className="text-gray-300 hover:text-white hover:underline transition-colors">How It Works</Link>
              </li>
              <li className="mb-2">
                <Link to="/pricing" className="text-gray-300 hover:text-white hover:underline transition-colors">Pricing</Link>
              </li>
              <li className="mb-2">
                <Link to="/blog" className="text-gray-300 hover:text-white hover:underline transition-colors">Blog</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white hover:underline transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Third Section - Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            
            {/* Social Media - now with horizontal layout */}
            <div className="flex items-center">
              <a 
                href="https://instagram.com/aiequestrian" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors mr-3"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="mailto:info@aiequestrian.com" 
                className="text-gray-300 hover:text-white transition-colors mr-3"
              >
                <Mail className="w-6 h-6" />
              </a>
              <span className="text-gray-300">
                info@aiequestrian.com
              </span>
            </div>
            <p className="text-gray-300 mt-4">
              Follow us for updates and insights into AI-powered equestrian training.
            </p>
          </div>
        </div>

        {/* Footer Bottom - Copyright without the purple background */}
        <div className="mt-12 text-center text-gray-400 border-t border-gray-700 pt-8">
          &copy; {new Date().getFullYear()} AI Equestrian. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
