
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown } from 'lucide-react';

const FaqSection = () => {
  const navigate = useNavigate();
  const { language, translations } = useLanguage();
  const t = translations[language];

  const faqData = [
    {
      question: t["dressage-faq-question-1"] || "How accurate is the AI analysis of score sheets?",
      answer: t["dressage-faq-answer-1"] || "Our AI has been trained on thousands of dressage tests and validated by FEI-certified judges. It achieves over 95% accuracy in movement recognition and scoring prediction compared to professional judges."
    },
    {
      question: t["dressage-faq-question-2"] || "What dressage test formats are supported?",
      answer: t["dressage-faq-answer-2"] || "We support all major dressage test formats including FEI tests (all levels), USEF/USDF tests, British Dressage, and most national federation test sheets. If you have a specific format you'd like supported, please contact us."
    },
    {
      question: t["dressage-faq-question-3"] || "How do I upload my score sheets?",
      answer: t["dressage-faq-answer-3"] || "Simply log into your account, navigate to the 'Upload' section, and either take a photo of your score sheet or upload an existing image. Our AI will automatically process the sheet and extract all relevant information."
    },
    {
      question: t["dressage-faq-question-4"] || "Can I track multiple horses in my account?",
      answer: t["dressage-faq-answer-4"] || "Yes! Our premium plans allow you to create profiles for multiple horses, tracking each one's progress individually and providing tailored recommendations for each horse's unique needs."
    },
    {
      question: t["dressage-faq-question-5"] || "How are the training recommendations generated?",
      answer: t["dressage-faq-answer-5"] || "Our AI analyzes patterns in your scores across multiple tests, identifies recurring areas for improvement, and generates targeted training exercises based on proven methodologies. The recommendations are designed to address specific movements and transitions where you consistently score lower."
    },
    {
      question: t["dressage-faq-question-6"] || "Is my data secure and private?",
      answer: t["dressage-faq-answer-6"] || "Absolutely. We use bank-level encryption to protect all your data. Your information is never shared with third parties, and you have complete control over who can access your results. We are fully GDPR compliant and take data privacy very seriously."
    },
    {
      question: t["dressage-faq-question-7"] || "Can I share my results with my trainer?",
      answer: t["dressage-faq-answer-7"] || "Yes, you can easily share your analysis results with your trainer through a secure link or by adding them as a coach to your account. This allows for better communication and more effective training between lessons."
    },
    {
      question: t["dressage-faq-question-8"] || "How often should I upload new score sheets?",
      answer: t["dressage-faq-answer-8"] || "For best results, we recommend uploading each new test sheet as you receive it. This creates a comprehensive history and allows you to track progress over time. Most riders upload 1-2 test sheets per month during competition season."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-serif font-semibold text-center text-gray-900 mb-4 reveal-scroll">
          {t["dressage-faq-title"] || "Frequently Asked Questions"}
        </h2>
        <p className="text-center text-gray-700 max-w-2xl mx-auto mb-12">
          {t["dressage-faq-subtitle"] || "Have questions about AI Dressage Trainer? Find answers to the most common questions below."}
        </p>
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="reveal-scroll border-b border-gray-200 last:border-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <AccordionTrigger className="text-left text-lg font-serif font-medium text-gray-800 py-5 px-1 hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 font-sans pb-4 px-1">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="text-center reveal-scroll mt-10">
          <Button
            className="mt-6 btn-dressage"
            onClick={() => navigate('/pricing')}
          >
            {t["get-started-dressage"] || "Get Started with AI Dressage"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
