
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AnimatedSection from "@/components/ui/AnimatedSection";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const DisciplineFeatureCard = ({ 
  title, 
  description, 
  borderColor 
}: { 
  title: string;
  description: string;
  borderColor: string;
}) => (
  <div className={`bg-white p-5 rounded-lg shadow-sm border ${borderColor}`}>
    <h4 className={`font-medium ${borderColor === 'border-purple-100' ? 'text-purple-800' : 'text-blue-800'} mb-2`}>
      {title}
    </h4>
    <p className="text-gray-600 text-sm">
      {description}
    </p>
  </div>
);

const DressageTab = () => (
  <div className="space-y-8">
    {/* Hero section with image and text side by side */}
    <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
      <div className="order-2 md:order-1">
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
          <h3 className="text-2xl font-serif font-semibold text-purple-900 mb-4">
            Elevating Your Dressage Journey
          </h3>
          <p className="text-gray-700">
            Dressage demands precision, harmony, and consistent improvement. AI Dressage tackles the specific challenges faced by dressage riders with sophisticated analysis and personalized feedback.
          </p>
        </div>
      </div>
      <div className="order-1 md:order-2">
        <img 
          src="/lovable-uploads/d87e62d5-6066-4be7-b944-1e5640abf84d.png"
          alt="Dressage training with AI analysis"
          className="rounded-lg w-full object-cover shadow-md h-64 md:h-80"
        />
      </div>
    </div>
    
    {/* Features carousel for mobile, grid for desktop */}
    <div className="mt-8">
      <h4 className="font-serif text-xl text-center mb-6 text-purple-900">
        AI Dressage Solutions
      </h4>
      
      {/* Mobile Carousel */}
      <div className="md:hidden">
        <Carousel className="w-full">
          <CarouselContent>
            <CarouselItem>
              <DisciplineFeatureCard
                title="Inconsistent Test Scores"
                description="Dressage riders often experience frustrating score fluctuations without understanding why. AI Dressage analyzes your test sheets to identify patterns and specific movements affecting your overall performance."
                borderColor="border-purple-100"
              />
            </CarouselItem>
            <CarouselItem>
              <DisciplineFeatureCard
                title="Difficulty Interpreting Judge Comments"
                description="Judge feedback can be cryptic or overwhelming. Our system synthesizes comments across multiple tests to reveal actionable insights about your technical execution."
                borderColor="border-purple-100"
              />
            </CarouselItem>
            <CarouselItem>
              <DisciplineFeatureCard
                title="Position Flaws During Movements"
                description="Small alignment issues can significantly impact movement quality. Our video analysis identifies position inconsistencies at critical moments in your ride."
                borderColor="border-purple-100"
              />
            </CarouselItem>
            <CarouselItem>
              <DisciplineFeatureCard
                title="Gait Quality Assessment"
                description="It's challenging to objectively evaluate the quality of your horse's gaits while riding. AI Dressage provides detailed analysis of rhythm, impulsion, and other key qualities across all gaits."
                borderColor="border-purple-100"
              />
            </CarouselItem>
            <CarouselItem>
              <DisciplineFeatureCard
                title="Training Progression Plateaus"
                description="Many riders struggle to break through scoring plateaus. Our system identifies the highest-impact areas for improvement and suggests targeted exercises to elevate your performance."
                borderColor="border-purple-100"
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>
      
      {/* Desktop Grid - centered with max-width */}
      <div className="hidden md:grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        <DisciplineFeatureCard
          title="Inconsistent Test Scores"
          description="Dressage riders often experience frustrating score fluctuations without understanding why. AI Dressage analyzes your test sheets to identify patterns and specific movements affecting your overall performance."
          borderColor="border-purple-100"
        />
        <DisciplineFeatureCard
          title="Difficulty Interpreting Judge Comments"
          description="Judge feedback can be cryptic or overwhelming. Our system synthesizes comments across multiple tests to reveal actionable insights about your technical execution."
          borderColor="border-purple-100"
        />
        <DisciplineFeatureCard
          title="Position Flaws During Movements"
          description="Small alignment issues can significantly impact movement quality. Our video analysis identifies position inconsistencies at critical moments in your ride."
          borderColor="border-purple-100"
        />
        <DisciplineFeatureCard
          title="Gait Quality Assessment"
          description="It's challenging to objectively evaluate the quality of your horse's gaits while riding. AI Dressage provides detailed analysis of rhythm, impulsion, and other key qualities across all gaits."
          borderColor="border-purple-100"
        />
        <DisciplineFeatureCard
          title="Training Progression Plateaus"
          description="Many riders struggle to break through scoring plateaus. Our system identifies the highest-impact areas for improvement and suggests targeted exercises to elevate your performance."
          borderColor="border-purple-100"
        />
        <div className="bg-purple-50 p-5 rounded-lg flex items-center justify-center">
          <p className="text-purple-800 text-sm font-medium">
            Discover the complete AI Dressage experience
          </p>
        </div>
      </div>
    </div>
  </div>
);

const JumpingTab = () => (
  <div className="space-y-8">
    {/* Hero section with image and text side by side */}
    <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
      <div className="order-2 md:order-1">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-2xl font-serif font-semibold text-blue-900 mb-4">
            Clearing Obstacles to Success
          </h3>
          <p className="text-gray-700">
            Show jumping requires split-second decisions and technical accuracy. AI Jump addresses the unique challenges jumpers face with advanced analytics and targeted training suggestions.
          </p>
        </div>
      </div>
      <div className="order-1 md:order-2">
        <img 
          src="/lovable-uploads/dbb9802b-bed7-4888-96a3-73b68198710b.png" 
          alt="Show jumping with AI analysis"
          className="rounded-lg w-full object-cover shadow-md h-64 md:h-80"
        />
      </div>
    </div>
    
    {/* Features carousel for mobile, grid for desktop */}
    <div className="mt-8">
      <h4 className="font-serif text-xl text-center mb-6 text-blue-900">
        AI Jump Solutions
      </h4>
      
      {/* Mobile Carousel */}
      <div className="md:hidden">
        <Carousel className="w-full">
          <CarouselContent>
            <CarouselItem>
              <DisciplineFeatureCard
                title="Approach and Distance Inconsistency"
                description="Finding the right distance to jumps consistently is a common struggle. AI Jump analyzes your approaches to identify patterns and help you develop more reliable distance control."
                borderColor="border-blue-100"
              />
            </CarouselItem>
            <CarouselItem>
              <DisciplineFeatureCard
                title="Position Faults at Critical Moments"
                description="Many riders don't realize how their position affects their horse's jumping technique. Our video analysis pinpoints exactly where position issues occur and how they impact performance."
                borderColor="border-blue-100"
              />
            </CarouselItem>
            <CarouselItem>
              <DisciplineFeatureCard
                title="Course Strategy Optimization"
                description="Planning the ideal path and pace for complex courses is challenging. Our course map analysis helps you identify optimal approaches and potential trouble spots before you enter the arena."
                borderColor="border-blue-100"
              />
            </CarouselItem>
            <CarouselItem>
              <DisciplineFeatureCard
                title="Fault Pattern Recognition"
                description="Rails down or refusals often follow consistent patterns. AI Jump tracks these patterns across multiple rounds to reveal the underlying technical issues."
                borderColor="border-blue-100"
              />
            </CarouselItem>
            <CarouselItem>
              <DisciplineFeatureCard
                title="Jump Type Difficulties"
                description="Many horses and riders struggle with specific jump types. Our system identifies which obstacles consistently cause problems and recommends targeted exercises to build confidence."
                borderColor="border-blue-100"
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>
      
      {/* Desktop Grid - centered with max-width */}
      <div className="hidden md:grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        <DisciplineFeatureCard
          title="Approach and Distance Inconsistency"
          description="Finding the right distance to jumps consistently is a common struggle. AI Jump analyzes your approaches to identify patterns and help you develop more reliable distance control."
          borderColor="border-blue-100"
        />
        <DisciplineFeatureCard
          title="Position Faults at Critical Moments"
          description="Many riders don't realize how their position affects their horse's jumping technique. Our video analysis pinpoints exactly where position issues occur and how they impact performance."
          borderColor="border-blue-100"
        />
        <DisciplineFeatureCard
          title="Course Strategy Optimization"
          description="Planning the ideal path and pace for complex courses is challenging. Our course map analysis helps you identify optimal approaches and potential trouble spots before you enter the arena."
          borderColor="border-blue-100"
        />
        <DisciplineFeatureCard
          title="Fault Pattern Recognition"
          description="Rails down or refusals often follow consistent patterns. AI Jump tracks these patterns across multiple rounds to reveal the underlying technical issues."
          borderColor="border-blue-100"
        />
        <DisciplineFeatureCard
          title="Jump Type Difficulties"
          description="Many horses and riders struggle with specific jump types. Our system identifies which obstacles consistently cause problems and recommends targeted exercises to build confidence."
          borderColor="border-blue-100"
        />
        <div className="bg-blue-50 p-5 rounded-lg flex items-center justify-center">
          <p className="text-blue-800 text-sm font-medium">
            Explore the complete AI Jump experience
          </p>
        </div>
      </div>
    </div>
  </div>
);

const DisciplineSpecificTabs = () => {
  const [activeTab, setActiveTab] = useState("dressage");
  
  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900 mb-4">
            Discipline-Specific Challenges
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Our specialized AI systems address the unique needs of different equestrian disciplines.
            Select a discipline below to learn more.
          </p>
        </AnimatedSection>
        
        <Tabs defaultValue="dressage" value={activeTab} onValueChange={setActiveTab} className="w-full max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger 
              value="dressage"
              className="data-[state=active]:bg-purple-700 data-[state=active]:text-white py-4 rounded-tl-md rounded-bl-md transition-all duration-200 font-serif"
            >
              <span className="text-xl font-serif">AI Dressage</span>
            </TabsTrigger>
            <TabsTrigger 
              value="jumping"
              className="data-[state=active]:bg-blue-700 data-[state=active]:text-white py-4 rounded-tr-md rounded-br-md transition-all duration-200 font-serif"
            >
              <span className="text-xl font-serif">AI Jump</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dressage" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
            <DressageTab />
          </TabsContent>
          <TabsContent value="jumping" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
            <JumpingTab />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default DisciplineSpecificTabs;
