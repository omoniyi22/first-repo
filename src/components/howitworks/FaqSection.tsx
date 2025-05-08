
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

const FaqSection = () => {
  const navigate = useNavigate();
  const { language, translations } = useLanguage();
  const t = translations[language];

  const faqData = [
    {
      question: t["dressage-faq-question-1"] || "How does AI enhance dressage training?",
      answer: t["dressage-faq-answer-1"] || "Our AI technology analyzes your movements, positions, and techniques in real-time, providing immediate feedback that would normally require a coach's eye. This allows for more efficient training sessions and faster improvement.",
    },
    {
      question: t["dressage-faq-question-2"] || "Can AI Dressage replace my trainer?",
      answer: t["dressage-faq-answer-2"] || "Absolutely not. AI Dressage is designed to complement your training routine and support your work with your coach. It provides data-driven insights between lessons to help you practice more effectively.",
    },
    {
      question: t["dressage-faq-question-3"] || "What equipment do I need to use AI Dressage?",
      answer: t["dressage-faq-answer-3"] || "You'll need a smartphone or tablet with a camera for video recording, and our mobile app. For the best experience, we recommend a mounting device for your arena or a helper to record your sessions.",
    },
    {
      question: t["dressage-faq-question-4"] || "How accurate is the AI analysis?",
      answer: t["dressage-faq-answer-4"] || "Our AI has been trained on thousands of dressage tests and validated by FEI-certified judges. It achieves over 95% accuracy in movement recognition and scoring prediction compared to professional judges.",
    },
    {
      question: t["dressage-faq-question-5"] || "How quickly will I see improvements in my scores?",
      answer: t["dressage-faq-answer-5"] || "Most riders report noticeable improvements within 4-6 weeks of consistent use. Our data shows an average score increase of 3-5 percentage points within the first three months.",
    },
    {
      question: t["dressage-faq-question-6"] || "Can I use AI Dressage for multiple horses?",
      answer: t["dressage-faq-answer-6"] || "Yes! Our premium plans allow you to create profiles for multiple horses, tracking each one's progress individually and providing tailored recommendations for each horse's unique needs.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-serif font-semibold text-center text-purple-900 mb-8 reveal-scroll">
          {t["dressage-faq-title"] || "Frequently Asked Questions About AI Dressage"}
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="reveal-scroll" style={{ animationDelay: `${index * 100}ms` }}>
                <AccordionTrigger className="text-left text-xl font-serif font-medium text-purple-800">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 font-sans pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="text-center reveal-scroll mt-8">
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
