// Import the Mail icon at the top of your file, along with other imports
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-purple-900 text-white py-12">
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

          {/* Second Section - Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="text-gray-300">
              <li className="mb-2">
                <Link to="/" className="hover:underline">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/how-it-works" className="hover:underline">How It Works</Link>
              </li>
              <li className="mb-2">
                <Link to="/pricing" className="hover:underline">Pricing</Link>
              </li>
              <li className="mb-2">
                <Link to="/blog" className="hover:underline">Blog</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:underline">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Third Section - Contact Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <p className="text-gray-300 mb-2">
              123 Equestrian Lane, Lexington, KY 40505
            </p>
            <p className="flex items-center text-gray-300 mb-2">
              <Mail className="w-4 h-4 mr-1.5" />
              info@aiequestrian.com
            </p>
            <p className="text-gray-300">
              (555) 123-4567
            </p>
          </div>
        </div>

        {/* Footer Bottom - Copyright */}
        <div className="mt-12 text-center text-gray-400 border-t border-gray-700 pt-8">
          &copy; {new Date().getFullYear()} AI Equestrian. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
