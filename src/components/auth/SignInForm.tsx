
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
        className="w-full bg-purple-700 hover:bg-purple-800"
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
      
      <Button 
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
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
