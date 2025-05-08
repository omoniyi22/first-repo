
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const JumpingFaqSection = () => {
  const navigate = useNavigate();
  const { language, translations } = useLanguage();
  const t = translations[language];

  const faqData = [
    {
      question: t["jumping-faq-question-1"],
      answer: t["jumping-faq-answer-1"],
    },
    {
      question: t["jumping-faq-question-2"],
      answer: t["jumping-faq-answer-2"],
    },
    {
      question: t["jumping-faq-question-3"],
      answer: t["jumping-faq-answer-3"],
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-serif font-semibold text-center text-blue-900 mb-8">
          {t["jumping-faq-title"]}
        </h2>
        <div className="max-w-3xl mx-auto">
          {faqData.map((item, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xl font-serif font-medium text-blue-800 mb-2">{item.question}</h3>
              <p className="text-gray-700 font-sans">{item.answer}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button
            variant="jump"
            className="mt-6"
            onClick={() => navigate('/pricing')}
          >
            {t["get-started-ai-jumping"]}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default JumpingFaqSection;
