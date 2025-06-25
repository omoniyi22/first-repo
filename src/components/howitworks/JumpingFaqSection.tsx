import { useState } from "react";
import { ChevronDown } from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggleOpen: () => void;
}

const FaqItem = ({ question, answer, isOpen, toggleOpen }: FaqItemProps) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="flex justify-between items-center w-full py-5 text-left"
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <h3 className="font-medium text-lg text-gray-900">{question}</h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100 pb-5" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-gray-700">{answer}</p>
      </div>
    </div>
  );
};

const JumpingFaqSection = () => {
  const [openFaqId, setOpenFaqId] = useState<number | null>(0);

  const toggleFaq = (id: number) => {
    if (openFaqId === id) {
      setOpenFaqId(null);
    } else {
      setOpenFaqId(id);
    }
  };

  const faqs = [
    {
      id: 1,
      question: "How does the system analyze course maps?",
      answer:
        "Our AI system uses computer vision to analyze course maps, identifying jump types, distances, and patterns. It processes everything from simple training exercises to complex international course designs, allowing riders to prepare effectively for competitions.",
    },
    {
      id: 2,
      question: "What video formats are supported for jump analysis?",
      answer:
        "We support all major video formats including MP4, MOV, AVI, and WMV. Videos can be recorded on smartphones, action cameras, or professional equipment. For best results, we recommend stable footage with the entire jump sequence visible.",
    },
    {
      id: 3,
      question: "How do I upload my course maps and videos?",
      answer:
        "Simply log into your account, navigate to the 'Upload' section, and drag-and-drop your files or use our file selector. You can also use our mobile app to directly record and upload videos from competitions or training sessions.",
    },
    {
      id: 4,
      question: "Can I track multiple horses in my account?",
      answer:
        "Yes, our Premium and Professional plans allow you to create and track multiple horse profiles. This lets you manage and analyze the performance of different horses across various competitions.",
    },
    {
      id: 5,
      question: "How are jump technique recommendations generated?",
      answer:
        "Our AI analyzes your jumping technique against a database of thousands of professional rounds. It identifies patterns in approach, takeoff, bascule, landing, and recovery, then generates specific exercises to improve your technique based on your current level and goals.",
    },
    {
      id: 6,
      question: "Is my data secure and private?",
      answer:
        "Absolutely. We employ bank-level encryption for all data storage and transfers. Your videos and analysis are only accessible to you and anyone you explicitly share them with. We never share your data with third parties without your permission.",
    },
    {
      id: 7,
      question: "Can I share my results with my trainer?",
      answer:
        "Yes! You can easily share specific analyses or your entire progress dashboard with your trainer through a secure link. They'll be able to view your results and even add comments and recommendations directly in the platform.",
    },
    {
      id: 8,
      question: "How does the system identify jumping faults and patterns?",
      answer:
        "Our AI uses advanced motion analysis to track both horse and rider through each jump. It identifies specific technical issues like rushing, wrong distances, uneven weight distribution, or incorrect release timing, helping you address the root causes of faults.",
    },
  ];

  return (
    <section className="py-24 bg-blue-50">
      <div className="container mx-auto px-6">
        <AnimatedSection
          animation="fade-in"
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-700">
            Have questions about AI Jumping Trainer? Find answers to the most
            common questions below.
          </p>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto">
          <AnimatedSection animation="fade-in" className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className={`bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 ${
                  openFaqId === faq.id ? "shadow-md" : "shadow-sm"
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none"
                >
                  <span className="font-medium text-gray-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-700 transition-transform duration-300 ${
                      openFaqId === faq.id ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaqId === faq.id
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-4 pt-0 text-gray-700">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </AnimatedSection>

          <AnimatedSection animation="fade-in" className="mt-12 text-center">
            <h3 className="text-xl font-medium mb-4 text-gray-900">
              Still have questions?
            </h3>
            <p className="text-gray-700 mb-6">
              If you couldn't find the answer to your question, please don't
              hesitate to reach out to our support team.
            </p>
            <Link to="mailto:info@aiequestrian.com" >
              <Button variant="primary">Contact Support</Button>
            </Link>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default JumpingFaqSection;
