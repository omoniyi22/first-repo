
import AuthForm from '@/components/auth/AuthForm';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

const SignIn = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="fixed top-6 left-6 z-10">
        <Link to="/" className="flex items-center text-navy-700 hover:text-navy-900 transition-colors">
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Back to home</span>
        </Link>
      </div>
      <AuthForm />
    </div>
  );
};

export default SignIn;
