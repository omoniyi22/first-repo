
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#7545b0] to-[#5f32a0] text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About AI Equestrian */}
          <div>
            <h4 className="text-xl font-serif font-semibold text-white mb-4">About AI Equestrian</h4>
            <p className="text-white font-sans text-sm mb-4">
              We combine artificial intelligence with equestrian expertise to transform training across disciplines.
            </p>
            <Link to="/about">
              <button className="text-white border border-white hover:bg-white/10 transition-colors px-4 py-2 rounded text-sm">
                Learn More
              </button>
            </Link>
          </div>

          {/* Navigation Area */}
          <div>
            <h4 className="text-xl font-serif font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white hover:text-white/80 font-sans text-sm transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-white hover:text-white/80 font-sans text-sm transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/pricing" className="text-white hover:text-white/80 font-sans text-sm transition-colors">Pricing</Link>
              </li>
              <li>
                <Link to="/blog" className="text-white hover:text-white/80 font-sans text-sm transition-colors">Blog</Link>
              </li>
              <li>
                <Link to="/contact" className="text-white hover:text-white/80 font-sans text-sm transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Connect With Us */}
          <div>
            <h4 className="text-xl font-serif font-semibold text-white mb-4">Connect With Us</h4>
            
            {/* Social Media */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <a 
                  href="https://instagram.com/aiequestrian" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/80 transition-colors flex items-center"
                >
                  <Instagram className="w-6 h-6 mr-2" />
                  <span className="font-sans text-sm">@aiequestrian</span>
                </a>
              </div>
              
              <div className="flex items-center">
                <a 
                  href="mailto:info@aiequestrian.com" 
                  className="text-white hover:text-white/80 transition-colors flex items-center"
                >
                  <Mail className="w-6 h-6 mr-2" />
                  <span className="font-sans text-sm">info@aiequestrian.com</span>
                </a>
              </div>
            </div>
            
            <p className="text-white mt-4 font-sans text-sm">
              Follow us for updates and insights into AI-powered equestrian training.
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 text-center border-t border-white/20 pt-8">
          <p className="font-sans text-sm text-white">
            &copy; 2025 AI Equestrian. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
