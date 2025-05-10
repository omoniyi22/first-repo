
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/auth/AuthForm';

const SignUp = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
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
      <Toaster />
    </div>
  );
};

export default SignUp;
