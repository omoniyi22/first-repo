
import React from 'react';
import { FileText, Users, Calendar, BarChart3, Horse, LayoutDashboard } from 'lucide-react';
import AnimatedSection from '../ui/AnimatedSection';

interface BenefitCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const BenefitCard = ({ title, description, icon }: BenefitCardProps) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="mb-5 h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-medium mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const BenefitsSection = () => {
  const benefits = [
    {
      title: "Performance Analysis",
      description: "Get instant, AI-powered feedback and insight from your dressage and jumping videos.",
      icon: <BarChart3 size={24} />
    },
    {
      title: "Personalized Training",
      description: "Unlock personalized training suggestions tailored to your performance and goals.",
      icon: <FileText size={24} />
    },
    {
      title: "Horse Management",
      description: "Easily track and manage progress for each of your horses in one place.",
      icon: <Horse size={24} />
    },
    {
      title: "User Dashboard",
      description: "View all your rides, progress, and insights in one simple, personalized dashboard.",
      icon: <LayoutDashboard size={24} />
    },
    {
      title: "Event Management",
      description: "Organize your events and give trainers exact access to your performance feedback.",
      icon: <Calendar size={24} />
    },
    {
      title: "Coach Collaboration",
      description: "Connect with your coach to share feedback, track progress, and train smarter together.",
      icon: <Users size={24} />
    }
  ];

  return (
    <AnimatedSection animation="fade-in" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-serif font-medium text-center mb-6 text-purple-900">
          What You Benefit From
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {benefits.map((benefit, index) => (
            <BenefitCard 
              key={index}
              title={benefit.title}
              description={benefit.description}
              icon={benefit.icon}
            />
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
};

export default BenefitsSection;
