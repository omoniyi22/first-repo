
import { useState } from 'react';
import AnimatedSection from '../ui/AnimatedSection';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const PricingFaq = () => {
  const faqs = [
    {
      question: "How accurate is the AI analysis of score sheets?",
      answer: "Our AI system has been trained on thousands of dressage tests and has achieved over 98% accuracy in reading and interpreting score sheets. The system is continuously learning and improving with each new score sheet processed."
    },
    {
      question: "What dressage test formats are supported?",
      answer: "We support all major dressage test formats including FEI, USDF, British Dressage, Equestrian Australia, and many others. If you have a specific format not listed, please contact us and we'll work to add support for it."
    },
    {
      question: "How do I upload my score sheets?",
      answer: "You can either take a photo of your score sheet using your smartphone or upload a digital copy (PDF, JPEG, PNG). Our system will automatically process and analyze the sheet regardless of the format."
    },
    {
      question: "Can I track multiple horses in my account?",
      answer: "Yes, our Premium and Professional plans allow you to create and track multiple horse profiles. This lets you manage and analyze the progress of different horses separately."
    },
    {
      question: "How are the training recommendations generated?",
      answer: "Our AI analyzes your scores and identifies patterns and areas for improvement. It then matches these with our database of exercises developed by FEI-level trainers and competitors. Recommendations are tailored to your specific needs and level."
    },
    {
      question: "Is my data secure and private?",
      answer: "Absolutely. We take data privacy very seriously. All your score sheets and performance data are encrypted and stored securely. We never share your personal data with third parties without your explicit consent."
    },
    {
      question: "Can I share my results with my trainer?",
      answer: "Yes, our platform allows you to share your analysis results and training recommendations with your trainer. You can either grant them access to your account or send them specific reports via email."
    },
    {
      question: "How often should I upload new score sheets?",
      answer: "For best results, we recommend uploading each new test you ride, whether from competitions or training sessions. This provides the most comprehensive data for our AI to analyze trends and progress over time."
    }
  ];

  return (
    <section className="py-20 bg-silver-50">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-navy-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-navy-700">
            Have questions about AI Dressage Trainer? Find answers to the most common questions below.
          </p>
        </AnimatedSection>
        
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
          <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-silver-200 last:border-b-0">
                <AccordionTrigger className="text-left font-medium text-lg text-navy-900 py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-navy-700 pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <AnimatedSection animation="fade-in" className="text-center max-w-2xl mx-auto mt-12">
          <h3 className="text-xl font-medium text-navy-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-navy-700 mb-6">
            If you couldn't find the answer to your question, please don't hesitate to reach out to our support team.
          </p>
          <Button className="bg-navy-700 hover:bg-navy-800 text-white px-6 py-3 rounded-lg text-base font-medium h-auto flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Contact Support
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PricingFaq;
