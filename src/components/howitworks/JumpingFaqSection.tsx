
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

const JumpingFaqSection = () => {
  const navigate = useNavigate();
  const { language, translations } = useLanguage();
  const t = translations[language];

  const faqData = [
    {
      question: t["jumping-faq-question-1"] || "How accurate is the AI analysis of jumping technique?",
      answer: t["jumping-faq-answer-1"] || "Our AI system has been trained on thousands of jumping rounds analyzed by professional trainers and Olympic-level riders. It achieves over 92% accuracy in technique assessment compared to human experts.",
    },
    {
      question: t["jumping-faq-question-2"] || "What video formats are supported for jumping analysis?",
      answer: t["jumping-faq-answer-2"] || "We support all common video formats including MP4, MOV, AVI, and most smartphone recordings. For best results, the video should capture the approach, takeoff, and landing phases of each jump clearly.",
    },
    {
      question: t["jumping-faq-question-3"] || "How do I upload my jumping videos?",
      answer: t["jumping-faq-answer-3"] || "Simply log into your account, navigate to the 'Upload' section, and either upload your video file or connect your account to automatically import videos from your phone gallery or cloud storage.",
    },
    {
      question: t["jumping-faq-question-4"] || "Can AI Jump Trainer detect common faults?",
      answer: t["jumping-faq-answer-4"] || "Absolutely. Our system is trained to identify common jumping faults such as rushed approaches, improper release, incorrect distances, and balance issues during takeoff and landing phases.",
    },
    {
      question: t["jumping-faq-question-5"] || "How are the jumping recommendations generated?",
      answer: t["jumping-faq-answer-5"] || "Our AI analyzes your technique across multiple jumps and courses, identifies patterns in your approach, position, and timing, and generates specific exercises designed to address your particular areas for improvement.",
    },
    {
      question: t["jumping-faq-question-6"] || "Is my video data secure and private?",
      answer: t["jumping-faq-answer-6"] || "We use enterprise-level encryption to protect all your data. Your videos are never shared with third parties without your explicit permission, and you have complete control over who can access your analysis results.",
    },
    {
      question: t["jumping-faq-question-7"] || "Can I share my analysis with my trainer?",
      answer: t["jumping-faq-answer-7"] || "Yes, you can easily share your analysis results with your trainer through a secure link or by adding them as a coach to your account. They'll receive a detailed breakdown of your performance with visual annotations.",
    },
    {
      question: t["jumping-faq-question-8"] || "How often should I upload new videos?",
      answer: t["jumping-faq-answer-8"] || "For best results, we recommend uploading training sessions 1-2 times per week. This frequency allows you to implement feedback in your training and track improvements consistently.",
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-serif font-semibold text-center text-gray-900 mb-4 reveal-scroll">
          {t["jumping-faq-title"] || "Frequently Asked Questions"}
        </h2>
        <p className="text-center text-gray-700 max-w-2xl mx-auto mb-12">
          {t["jumping-faq-subtitle"] || "Have questions about AI Jump Trainer? Find answers to the most common questions below."}
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
