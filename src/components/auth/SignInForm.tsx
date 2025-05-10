
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
  
  const { signInWithEmail } = useAuth();
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
