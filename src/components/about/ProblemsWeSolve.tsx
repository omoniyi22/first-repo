
import AnimatedSection from "@/components/ui/AnimatedSection";
import { Check, ArrowRight, Lightbulb, Users, BarChart3, Eye, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

const ProblemCard = ({ title, description, icon }) => (
  <Card className="bg-white p-6 rounded-lg shadow-sm border border-purple-100/60 hover:shadow-md transition-shadow duration-300">
    <div className="flex items-start gap-4">
      <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-3 rounded-full">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-serif text-lg font-medium text-gray-900 mb-2">{title}</h4>
        <p className="text-gray-700 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  </Card>
);

const ProblemsWeSolve = () => {
  const problems = [
    {
      title: "Limited Feedback Between Lessons",
      description: "Most riders receive feedback only during infrequent lessons, creating long gaps in the learning process. AI Equestrian provides continuous analysis and guidance between professional coaching sessions.",
      icon: <Users className="w-5 h-5 text-purple-700" />
    },
    {
      title: "Difficulty Tracking Progress",
      description: "Traditional methods make it challenging to objectively measure improvement over time. Our platform delivers quantifiable metrics and visual progress tracking to validate your training efforts.",
      icon: <BarChart3 className="w-5 h-5 text-purple-700" />
    },
    {
      title: "Inconsistent Performance Analysis",
      description: "Relying solely on memory or scattered notes leads to fragmented analysis. We transform your test sheets and videos into comprehensive, organized insights that reveal meaningful patterns.",
      icon: <BookOpen className="w-5 h-5 text-purple-700" />
    },
    {
      title: "Missing the Unseen Details",
      description: "The human eye can miss subtle elements that impact performance. Our AI technology captures and analyzes nuances in movement and position that might otherwise go unnoticed.",
      icon: <Eye className="w-5 h-5 text-purple-700" />
    },
    {
      title: "Training Program Uncertainty",
      description: "Many riders struggle to develop structured training plans that address specific weaknesses. Our recommendation system creates targeted exercises based on your actual performance data.",
      icon: <Lightbulb className="w-5 h-5 text-purple-700" />
    }
  ];
  
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="max-w-3xl mx-auto mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900 mb-4">
            Problems We Solve
          </h2>
          <p className="text-lg text-gray-700">
            We leverage AI technology to address the unique challenges faced by riders across disciplines.
          </p>
        </AnimatedSection>
        
        <AnimatedSection animation="fade-in" className="max-w-5xl mx-auto">
          <div className="space-y-6">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-serif font-medium text-gray-900 mb-4 text-center">
                Transforming Equestrian Performance Through Intelligence
              </h3>
              
              <p className="text-gray-700 text-center mb-10">
                Equestrian sports blend artistry with technical precision, demanding constant refinement from both horse and rider. 
                At AI Equestrian, we're addressing the fundamental challenges that prevent riders from reaching their full potential.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {problems.map((problem, index) => (
                <ProblemCard
                  key={index}
                  title={problem.title}
                  description={problem.description}
                  icon={problem.icon}
                />
              ))}
            </div>
            
            <div className="mt-10 flex justify-center">
              <a href="/how-it-works" className="inline-flex items-center py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors duration-300 font-medium">
                Learn how our technology works <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ProblemsWeSolve;
