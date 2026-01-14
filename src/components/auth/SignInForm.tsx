
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface SignInFormProps {
  onToggleForm: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      toast({
        title: language === 'en' ? "Missing information" : "Información faltante",
        description: language === 'en' 
          ? "Please enter both email and password" 
          : "Por favor ingresa tu correo y contraseña",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signInWithEmail(email, password);
      
      if (!error) {
        toast({
          title: language === 'en' ? "Welcome back" : "Bienvenido",
          description: language === 'en' 
            ? "You've successfully signed in" 
            : "Has iniciado sesión exitosamente"
        });
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4 w-full">
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
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium">
            {language === 'en' ? 'Password' : 'Contraseña'}
          </label>
          <button
            type="button"
            className="text-sm text-purple-700 hover:underline"
          >
            {language === 'en' ? 'Forgot password?' : '¿Olvidaste tu contraseña?'}
          </button>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={language === 'en' ? "Enter your password" : "Ingresa tu contraseña"}
          disabled={isLoading}
          required
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="remember" 
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
        />
        <label
          htmlFor="remember"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {language === 'en' ? 'Remember me' : 'Recordarme'}
        </label>
      </div>
      
      <Button 
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium transition-all duration-300"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {language === 'en' ? 'Signing in...' : 'Iniciando sesión...'}
          </>
        ) : (
          language === 'en' ? 'Sign In' : 'Iniciar sesión'
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
      
      {/* Google styled button */}
      <Button 
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
        )}
        {language === 'en' ? 'Sign in with Google' : 'Iniciar sesión con Google'}
      </Button>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          {language === 'en' ? "Don't have an account?" : '¿No tienes una cuenta?'}{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="text-purple-700 hover:underline font-medium"
          >
            {language === 'en' ? 'Sign up' : 'Regístrate'}
          </button>
        </p>
      </div>
    </form>
  );
};

export default SignInForm;
