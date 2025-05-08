
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

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
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-serif font-semibold text-center text-purple-900 mb-8 reveal-scroll">
          {t["dressage-faq-title"] || "Frequently Asked Questions"}
        </h2>
        <div className="max-w-3xl mx-auto">
          {faqData.map((item, index) => (
            <div key={index} className="mb-6 reveal-scroll">
              <h3 className="text-xl font-serif font-medium text-purple-800 mb-2">{item.question}</h3>
              <p className="text-gray-700 font-sans">{item.answer}</p>
            </div>
          ))}
        </div>
        <div className="text-center reveal-scroll">
          <Button
            className="mt-6 bg-gradient-to-r from-[#8a55a9] to-[#6b3987] hover:from-[#7a4599] hover:to-[#5b2977] text-white"
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
