
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to sign-in page with a signup parameter
    navigate('/sign-in?signup=true');
  }, [navigate]);

  // This component won't render anything since it immediately redirects
  return <div className="flex items-center justify-center h-screen">Redirecting to sign up...</div>;
};

export default SignUp;
