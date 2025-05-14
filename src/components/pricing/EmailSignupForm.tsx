
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const EmailSignupForm = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { language, translations } = useLanguage();
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: language === "en" ? "Invalid email" : "Correo inválido",
        description: language === "en" 
          ? "Please enter a valid email address" 
          : "Por favor, introduce un correo electrónico válido",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          source: "pricing_page"
        });
      
      if (error) throw error;
      
      // Reset form
      setEmail("");
      
      // Show success message
      toast({
        title: language === "en" ? "Thank you!" : "¡Gracias!",
        description: language === "en" 
          ? "We'll notify you when we have more pricing options available." 
          : "Te notificaremos cuando tengamos más opciones de precios disponibles.",
      });
      
    } catch (error) {
      console.error("Error submitting subscription interest:", error);
      toast({
        title: language === "en" ? "Something went wrong" : "Algo salió mal",
        description: language === "en" 
          ? "We couldn't save your email. Please try again later." 
          : "No pudimos guardar tu correo. Por favor, inténtalo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col md:flex-row gap-3">
      <Input
        type="email"
        placeholder={language === "en" ? "Your email address" : "Tu correo electrónico"}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-grow"
        required
      />
      <Button 
        type="submit" 
        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
            <span>{language === "en" ? "Submitting..." : "Enviando..."}</span>
          </div>
        ) : (
          language === "en" ? "Notify me" : "Notificarme"
        )}
      </Button>
    </form>
  );
};

export default EmailSignupForm;
