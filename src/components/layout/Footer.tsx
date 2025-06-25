import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* First Section - About */}
          <div>
            <h4 className="text-2xl font-serif mb-3">AI Equestrian</h4>
            <p className="mb-2 text-white">Riding Intelligence, Redefined</p>
            <p className="text-white/90 mb-6">
              AI Equestrian is dedicated to revolutionizing equestrian training
              through the power of artificial intelligence.
            </p>
            <div>
              <Link to="/about" className="text-white hover:underline">
                Learn More
              </Link>
            </div>
          </div>

          {/* Second Section - Navigation Links */}
          <div className="mt-2 md:justify-items-center">
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-white hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-white hover:underline">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-white hover:underline">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white hover:underline">
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="mailto:info@equineaintelligence.com"
                  className="text-white hover:underline"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Third Section - Connect With Us */}
          <div>
            <h4 className="text-2xl font-serif mb-3">Connect With Us</h4>

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
              Follow us for updates and insights into AI-powered equestrian
              training.
            </p>
          </div>
        </div>

        {/* Footer Divider */}
        <div className="border-t border-white/20 my-8"></div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row md:justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-white/80">
              &copy;2025 AI Equestrian. All rights reserved
            </p>
          </div>
          <div className="flex space-x-6">
            <Link to="/terms" className="text-white hover:underline">
              Terms & Conditions
            </Link>
            <Link to="/privacy" className="text-white hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
