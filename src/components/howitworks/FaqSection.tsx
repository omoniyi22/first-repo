
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
      question: t["dressage-faq-question-1"],
      answer: t["dressage-faq-answer-1"],
    },
    {
      question: t["dressage-faq-question-2"],
      answer: t["dressage-faq-answer-2"],
    },
    {
      question: t["dressage-faq-question-3"],
      answer: t["dressage-faq-answer-3"],
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-serif font-semibold text-center text-purple-900 mb-8 reveal-scroll">
          {t["dressage-faq-title"]}
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
            variant="dressage"
            className="mt-6"
            onClick={() => navigate('/pricing')}
          >
            {t["get-started-dressage"]}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
