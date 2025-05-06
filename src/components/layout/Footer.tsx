
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';

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

          {/* Third Section - Contact Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            
            {/* Address and Contact Info */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <MapPin className="w-4 h-4 mr-2 text-purple-300" />
                <span className="text-gray-300">123 Equestrian Way, London, UK</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-purple-300" />
                <span className="text-gray-300">+44 (0) 123 456 7890</span>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/aiequestrian" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="mailto:info@aiequestrian.com" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Mail className="w-6 h-6" />
              </a>
            </div>
            <p className="text-gray-300 mt-4">
              Follow us for updates and insights into AI-powered equestrian training.
            </p>
          </div>
        </div>

        {/* Footer Bottom - Copyright with darker background */}
        <div className="mt-12 text-center text-gray-400 border-t border-gray-700 pt-8 bg-purple-900">
          &copy; {new Date().getFullYear()} AI Equestrian. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
