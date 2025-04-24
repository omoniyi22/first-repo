import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Mail 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-purple-950 text-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center">
              <h2 className="font-serif text-2xl font-semibold text-white">
                AI Dressage Trainer
              </h2>
            </Link>
            <p className="mt-4 text-purple-200 text-sm leading-relaxed">
              Transform your dressage training with AI-powered analysis and personalized recommendations.
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
            <h3 className="font-serif text-lg font-medium mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-purple-300 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-purple-300 hover:text-white transition-colors text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-purple-300 hover:text-white transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-purple-300 hover:text-white transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link to="/sign-in" className="text-purple-300 hover:text-white transition-colors text-sm">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-serif text-lg font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-purple-300 hover:text-white transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-purple-300 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-purple-300 hover:text-white transition-colors text-sm">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-purple-300 hover:text-white transition-colors text-sm">
                  GDPR Compliance
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-serif text-lg font-medium mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail size={16} className="mr-2 mt-1 text-purple-300" />
                <a href="mailto:info@aidressagetrainer.com" className="text-purple-300 hover:text-white transition-colors text-sm">
                  info@aidressagetrainer.com
                </a>
              </li>
            </ul>
            
            <div className="mt-6">
              <h4 className="font-serif text-base font-medium mb-2">Subscribe to our newsletter</h4>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-purple-900/50 border border-purple-800 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 w-full"
                />
                <button className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded-r-md text-sm transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-purple-800 mt-12 pt-8 text-center text-purple-400 text-sm">
          <p>© {new Date().getFullYear()} AI Dressage Trainer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
