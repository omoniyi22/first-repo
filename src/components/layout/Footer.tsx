
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#7545b0] to-[#5f32a0] text-white py-12">
      <div className="container mx-auto px-6 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* First Section - About Us */}
          <div className="flex flex-col items-center">
            <h4 className="font-serif text-xl font-medium mb-4">About AI Equestrian</h4>
            <p className="text-gray-300 max-w-md mx-auto">
              AI Equestrian is dedicated to revolutionizing equestrian training through the power of artificial intelligence.
            </p>
            <div className="mt-4">
              <Link to="/about" className="text-purple-300 hover:underline">Learn More</Link>
            </div>
          </div>

          {/* Second Section - Links (without title) */}
          <div className="flex flex-col items-center">
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
          <div className="flex flex-col items-center">
            <h4 className="font-serif text-xl font-medium mb-4">Connect With Us</h4>
            
            {/* Social Media - now with vertical layout and centered */}
            <div className="flex flex-col space-y-4 items-center">
              <div className="flex items-center">
                <a 
                  href="https://instagram.com/ai_equestrian" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <Instagram className="w-6 h-6 mr-2" />
                  <span>@ai_equestrian</span>
                </a>
              </div>
              
              <div className="flex items-center">
                <a 
                  href="mailto:info@aiequestrian.com" 
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <Mail className="w-6 h-6 mr-2" />
                  <span>info@aiequestrian.com</span>
                </a>
              </div>
            </div>
            
            <p className="text-gray-300 mt-4 max-w-md mx-auto">
              Follow us for updates and insights into AI-powered equestrian training.
            </p>
          </div>
        </div>

        {/* Footer Bottom - Copyright without any background */}
        <div className="mt-12 text-center text-gray-400 border-t border-gray-700 pt-8">
          {/* Tagline added above copyright */}
          <p className="text-white font-serif text-lg mb-2">Riding Intelligence, Redefined</p>
          &copy; {new Date().getFullYear()} AI Equestrian. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
