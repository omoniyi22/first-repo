
import React from 'react';
import { FileText, Users, Calendar, BarChart3, Award, LayoutDashboard } from 'lucide-react';
import AnimatedSection from '../ui/AnimatedSection';

interface BenefitCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const BenefitCard = ({ title, description, icon }: BenefitCardProps) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-sm transition-shadow duration-300 relative overflow-hidden w-full md:w-1/3 lg:w-1/4">
      {/* Left accent border */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
      
      <div className="mb-5 h-14 w-14 bg-white rounded-full flex items-center justify-center text-purple-600">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-medium mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

const BenefitsSection = () => {
  const benefits = [
    {
      title: "Performance Analysis",
      description: "Get instant, AI-powered feedback and trends from your dressage and jumping videos.",
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
      icon: <Award size={24} />
    },
    {
      title: "User Dashboard",
      description: "View all your rides, progress, and insights in one simple, personalized dashboard.",
      icon: <LayoutDashboard size={24} />
    },
    {
      title: "Event Management",
      description: "Organize your events and give trainers direct access to your performance dashboard.",
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
        <h2 className="text-3xl md:text-4xl font-serif font-medium text-center mb-16 text-purple-900">
          What You Benefit From
        </h2>
        
        <div className="flex justify-around flex-wrap gap-6">
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
