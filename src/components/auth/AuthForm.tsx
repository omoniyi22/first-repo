
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import { useLanguage } from '@/contexts/LanguageContext';

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState<string>('signin');
  const { language } = useLanguage();

  const handleToggleForm = () => {
    setActiveTab(activeTab === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-6">
              <div className="mb-6 text-center">
                <h1 className="text-3xl font-serif font-semibold text-gray-900 mb-2">
                  {activeTab === 'signin' 
                    ? (language === 'en' ? 'Welcome Back' : 'Bienvenido de nuevo')
                    : (language === 'en' ? 'Create Your Account' : 'Crea tu cuenta')
                  }
                </h1>
                <p className="text-gray-600 text-sm">
                  {activeTab === 'signin'
                    ? (language === 'en' ? 'Sign in to your AI Equestrian account' : 'Inicia sesión en tu cuenta de AI Equestrian')
                    : (language === 'en' ? 'Join AI Equestrian to analyze your riding performance' : 'Únete a AI Equestrian para analizar tu rendimiento ecuestre')
                  }
                </p>
              </div>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">
                  {language === 'en' ? 'Sign In' : 'Iniciar sesión'}
                </TabsTrigger>
                <TabsTrigger value="signup">
                  {language === 'en' ? 'Sign Up' : 'Crear cuenta'}
                </TabsTrigger>
              </TabsList>
            </div>
            <CardContent className="px-6 pt-4 pb-6">
              <TabsContent value="signin">
                <SignInForm onToggleForm={handleToggleForm} />
              </TabsContent>
              <TabsContent value="signup">
                <SignUpForm onToggleForm={handleToggleForm} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AuthForm;
