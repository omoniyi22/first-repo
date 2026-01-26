import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { analytics } from '@/lib/posthog'; // ADD THIS LINE

interface SignUpFormProps {
  onToggleForm: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password || !confirmPassword) {
      toast({
        title: language === 'en' ? "Missing information" : "Información faltante",
        description: language === 'en' 
          ? "Please fill in all fields" 
          : "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: language === 'en' ? "Passwords don't match" : "Las contraseñas no coinciden",
        description: language === 'en' 
          ? "Please make sure your passwords match" 
          : "Por favor asegúrate de que tus contraseñas coincidan",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signUpWithEmail(email, password);
      
      if (!error) {
        //   TRACK SIGNUP - ADD THIS
        analytics.conversion.signUp('email');
        
        toast({
          title: language === 'en' ? "Account created" : "Cuenta creada",
          description: language === 'en' 
            ? "Please check your email to verify your account" 
            : "Por favor verifica tu correo electrónico para confirmar tu cuenta"
        });
        navigate('/sign-in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      
      //   TRACK GOOGLE SIGNUP - ADD THIS
      analytics.conversion.signUp('google');
      
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4 w-full">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          {language === 'en' ? 'Email' : 'Correo electrónico'}
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={language === 'en' ? "Enter your email" : "Ingresa tu correo"}
          disabled={isLoading}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          {language === 'en' ? 'Password' : 'Contraseña'}
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={language === 'en' ? "Create a password" : "Crea una contraseña"}
          disabled={isLoading}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="confirm-password" className="text-sm font-medium">
          {language === 'en' ? 'Confirm Password' : 'Confirmar contraseña'}
        </label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={language === 'en' ? "Confirm your password" : "Confirma tu contraseña"}
          disabled={isLoading}
          required
        />
      </div>
      
      <Button 
        type="submit"
        className="w-full bg-purple-700 hover:bg-purple-800"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {language === 'en' ? 'Creating account...' : 'Creando cuenta...'}
          </>
        ) : (
          language === 'en' ? 'Create Account' : 'Crear cuenta'
        )}
      </Button>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white text-gray-500">
            {language === 'en' ? 'Or continue with' : 'O continúa con'}
          </span>
        </div>
      </div>
      
      <Button 
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
        )}
        {language === 'en' ? 'Sign up with Google' : 'Registrarse con Google'}
      </Button>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          {language === 'en' ? 'Already have an account?' : '¿Ya tienes una cuenta?'}{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="text-purple-700 hover:underline font-medium"
          >
            {language === 'en' ? 'Sign in' : 'Iniciar sesión'}
          </button>
        </p>
      </div>
    </form>
  );
};

export default SignUpForm;
