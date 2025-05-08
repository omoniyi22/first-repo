
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

const JumpingFaqSection = () => {
  const navigate = useNavigate();
  const { language, translations } = useLanguage();
  const t = translations[language];

  const faqData = [
    {
      question: t["jumping-faq-question-1"] || "How does the AI analyze jumping technique?",
      answer: t["jumping-faq-answer-1"] || "Our AI uses computer vision to analyze the horse and rider's position, timing, and trajectory throughout the jump. It measures angles, speed, and body position to identify technical improvements.",
    },
    {
      question: t["jumping-faq-question-2"] || "Can AI Jumping help with course planning?",
      answer: t["jumping-faq-answer-2"] || "Yes, after analyzing your rounds, the AI can identify patterns in your riding and provide suggestions for more effective approaches to different types of jumps and course combinations.",
    },
    {
      question: t["jumping-faq-question-3"] || "What video quality is required for accurate analysis?",
      answer: t["jumping-faq-answer-3"] || "For best results, we recommend stable footage shot from the side of the jump at a distance that captures the approach and landing. However, our AI can still provide valuable insights from most reasonably clear videos.",
    },
    {
      question: t["jumping-faq-question-4"] || "Can AI Jump Trainer detect common faults?",
      answer: t["jumping-faq-answer-4"] || "Absolutely. Our system is trained to identify common jumping faults such as rushed approaches, improper release, incorrect distances, and balance issues during takeoff and landing phases.",
    },
    {
      question: t["jumping-faq-question-5"] || "How often should I upload videos for analysis?",
      answer: t["jumping-faq-answer-5"] || "For best results, we recommend uploading training sessions 1-2 times per week. This frequency allows you to implement feedback in your training and track improvements consistently.",
    },
    {
      question: t["jumping-faq-question-6"] || "Can I use AI Jump Trainer for competition videos?",
      answer: t["jumping-faq-answer-6"] || "Yes! Analyzing competition rounds can provide especially valuable insights about how you perform under pressure compared to training sessions.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-serif font-semibold text-center text-blue-900 mb-8 reveal-scroll">
          {t["jumping-faq-title"] || "Frequently Asked Questions About AI Jumping"}
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="reveal-scroll" style={{ animationDelay: `${index * 100}ms` }}>
                <AccordionTrigger className="text-left text-xl font-serif font-medium text-blue-800">
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
            className="mt-6 btn-jumping"
            onClick={() => navigate('/pricing')}
          >
            {t["get-started-ai-jumping"] || "Get Started with AI Jumping"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default JumpingFaqSection;
