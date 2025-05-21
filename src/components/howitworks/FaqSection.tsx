import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
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

const FaqSection = ({ pageName }: { pageName?: string }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Sample FAQ data
  let bg =
    pageName == "howItWorks"
      ? "bg-gradient-to-r from-[#e4defb] to-[#d8e4fb]"
      : "bg-purple-50";

  bg = pageName == "JumpingHowItWorks" ? "bg-[#eff6ff]" : "bg-purple-50";

  const btnBg =
    pageName == "JumpingHowItWorks" ? "bg-blue-600 hover:bg-blue-600" : "";
  const faqs = [
    {
      question: "How accurate is the AI analysis of score sheets?",
      answer:
        "Our AI system has been trained on thousands of dressage tests and has achieved over 98% accuracy in reading and interpreting score sheets. The system is continuously learning and improving with each new score sheet processed.",
    },
    {
      question: "What dressage test formats are supported?",
      answer:
        "We support all major dressage test formats including FEI, USDF, British Dressage, Equestrian Australia, and many others. If you have a specific format not listed, please contact us and we'll work to add support for it.",
    },
    {
      question: "How do I upload my score sheets?",
      answer:
        "You can either take a photo of your score sheet using your smartphone or upload a digital copy (PDF, JPEG, PNG). Our system will automatically process and analyze the sheet regardless of the format.",
    },
    {
      question: "Can I track multiple horses in my account?",
      answer:
        "Yes, our Premium and Professional plans allow you to create and track multiple horse profiles. This lets you manage and analyze the progress of different horses separately.",
    },
    {
      question: "How are the training recommendations generated?",
      answer:
        "Our AI analyzes your scores and identifies patterns and areas for improvement. It then matches these with our database of exercises developed by FEI-level trainers and competitors. Recommendations are tailored to your specific needs and level.",
    },
    {
      question: "Is my data secure and private?",
      answer:
        "Absolutely. We take data privacy very seriously. All your score sheets and performance data are encrypted and stored securely. We never share your personal data with third parties without your explicit consent.",
    },
    {
      question: "Can I share my results with my trainer?",
      answer:
        "Yes, our platform allows you to share your analysis results and training recommendations with your trainer. You can either grant them access to your account or send them specific reports via email.",
    },
    {
      question: "How often should I upload new score sheets?",
      answer:
        "For best results, we recommend uploading each new test you ride, whether from competitions or training sessions. This provides the most comprehensive data for our AI to analyze trends and progress over time.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={`py-20 ${bg}`}>
      <div className="container mx-auto px-6">
        <AnimatedSection
          animation="fade-in"
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-purple-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-700">
            Have questions about AI Equestrian? Find answers to the most common
            questions below.
          </p>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              toggleOpen={() => toggleFaq(index)}
            />
          ))}
        </div>

        <AnimatedSection
          animation="fade-in"
          className="text-center max-w-2xl mx-auto mt-12"
        >
          <h3 className="text-xl font-medium text-gray-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-700 mb-6">
            If you couldn't find the answer to your question, please don't
            hesitate to reach out to our support team.
          </p>
          <Link to="mailto:info@aiequestrian.com">
            <Button variant="primary" className={btnBg}>
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </Button>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default FaqSection;
