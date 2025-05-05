
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AnimatedSection from '@/components/ui/AnimatedSection';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<{password?: string; confirmPassword?: string}>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if we have a recovery token in the URL
  useEffect(() => {
    // Supabase automatically handles the reset token as part of the auth context
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session && !window.location.hash.includes('type=recovery')) {
        // No session and not a recovery flow, redirect to sign-in
        navigate('/sign-in');
      }
    };
    
    checkSession();
  }, [navigate]);

  const validateForm = () => {
    const errors: {password?: string; confirmPassword?: string} = {};
    
    if (!password) {
      errors.password = 'New password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      // Password update successful
      setIsSuccess(true);
      toast({
        title: "Password updated",
        description: "Your password has been reset successfully.",
      });
      
      // Wait a bit before redirecting
      setTimeout(() => {
        navigate('/sign-in');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Password reset failed",
        description: error instanceof Error ? error.message : 'Failed to reset password',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  // Calculate password strength
  const calculateStrength = () => {
    let score = 0;
    if (hasMinLength) score++;
    if (hasUpperCase) score++;
    if (hasLowerCase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;
    
    if (score <= 2) return { text: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { text: 'Good', color: 'bg-yellow-500' };
    return { text: 'Strong', color: 'bg-green-500' };
  };
  
  const strength = calculateStrength();
  
  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-silver-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <AnimatedSection animation="fade-in" className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-serif font-semibold text-navy-900">
              Password Reset Successful!
            </h1>
            <p className="mt-2 text-navy-700">
              Your password has been reset successfully. You'll be redirected to sign in shortly.
            </p>
            <Button 
              className="mt-6"
              onClick={() => navigate('/sign-in')}
            >
              Go to Sign In
            </Button>
          </AnimatedSection>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-silver-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <AnimatedSection animation="fade-in" className="text-center">
          <h1 className="text-3xl font-serif font-semibold text-navy-900">
            Reset your password
          </h1>
          <p className="mt-2 text-navy-700">
            Enter your new password below
          </p>
        </AnimatedSection>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <AnimatedSection animation="fade-in" delay="delay-100">
          <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-silver-100">
            <button
              onClick={() => navigate('/sign-in')}
              className="flex items-center text-navy-600 hover:text-navy-800 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to sign in
            </button>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-navy-800">
                  New Password
                </label>
                <div className="mt-1">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full ${formErrors.password ? 'border-red-500' : ''}`}
                    aria-invalid={formErrors.password ? 'true' : 'false'}
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                  )}
                </div>
                
                {/* Password strength meter */}
                {password && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${strength.color}`} 
                        style={{ width: `${(calculateStrength().text === 'Weak' ? 33 : calculateStrength().text === 'Good' ? 66 : 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Password strength: <span className="font-medium">{strength.text}</span>
                    </p>
                  </div>
                )}
                
                {/* Password requirements */}
                <div className="mt-2 text-xs space-y-1 text-gray-500">
                  <p>Password must contain:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li className={hasMinLength ? "text-green-600" : ""}>
                      At least 8 characters
                    </li>
                    <li className={hasUpperCase ? "text-green-600" : ""}>
                      At least one uppercase letter (A-Z)
                    </li>
                    <li className={hasLowerCase ? "text-green-600" : ""}>
                      At least one lowercase letter (a-z)
                    </li>
                    <li className={hasNumber ? "text-green-600" : ""}>
                      At least one number (0-9)
                    </li>
                    <li className={hasSpecialChar ? "text-green-600" : ""}>
                      At least one special character (!@#$%^&*(),.?":{}|&lt;&gt;)
                    </li>
                  </ul>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy-800">
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                    aria-invalid={formErrors.confirmPassword ? 'true' : 'false'}
                  />
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Button
                  type="submit"
                  className="w-full bg-navy-700 hover:bg-navy-800 py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    <>Reset Password</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default ResetPassword;
