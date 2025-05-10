
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const DressageTab = () => (
  <div className="space-y-6">
    <div className="md:flex gap-8 items-center mb-8">
      <div className="md:w-1/2 mb-6 md:mb-0">
        <h3 className="text-2xl font-serif font-semibold text-purple-900 mb-4">
          Elevating Your Dressage Journey
        </h3>
        <p className="text-gray-700 mb-4">
          Dressage demands precision, harmony, and consistent improvement. AI Dressage tackles the specific challenges faced by dressage riders.
        </p>
      </div>
      <div className="md:w-1/2">
        <img 
          src="/lovable-uploads/f21e0183-a564-4222-87bb-f424b3ed4c87.png"
          alt="Dressage rider performing in an arena"
          className="rounded-lg w-full object-cover shadow-md h-64"
        />
      </div>
    </div>
    
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100">
        <h4 className="font-medium text-purple-800 mb-2">Inconsistent Test Scores</h4>
        <p className="text-gray-600 text-sm">
          Dressage riders often experience frustrating score fluctuations without understanding why. AI Dressage analyzes your test sheets to identify patterns and specific movements affecting your overall performance.
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100">
        <h4 className="font-medium text-purple-800 mb-2">Difficulty Interpreting Judge Comments</h4>
        <p className="text-gray-600 text-sm">
          Judge feedback can be cryptic or overwhelming. Our system synthesizes comments across multiple tests to reveal actionable insights about your technical execution.
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100">
        <h4 className="font-medium text-purple-800 mb-2">Position Flaws During Movements</h4>
        <p className="text-gray-600 text-sm">
          Small alignment issues can significantly impact movement quality. Our video analysis identifies position inconsistencies at critical moments in your ride.
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100">
        <h4 className="font-medium text-purple-800 mb-2">Gait Quality Assessment</h4>
        <p className="text-gray-600 text-sm">
          It's challenging to objectively evaluate the quality of your horse's gaits while riding. AI Dressage provides detailed analysis of rhythm, impulsion, and other key qualities across all gaits.
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100 md:col-span-2">
        <h4 className="font-medium text-purple-800 mb-2">Training Progression Plateaus</h4>
        <p className="text-gray-600 text-sm">
          Many riders struggle to break through scoring plateaus. Our system identifies the highest-impact areas for improvement and suggests targeted exercises to elevate your performance.
        </p>
      </div>
    </div>
  </div>
);

const JumpingTab = () => (
  <div className="space-y-6">
    <div className="md:flex gap-8 items-center mb-8">
      <div className="md:w-1/2 mb-6 md:mb-0">
        <h3 className="text-2xl font-serif font-semibold text-blue-900 mb-4">
          Clearing Obstacles to Success
        </h3>
        <p className="text-gray-700 mb-4">
          Show jumping requires split-second decisions and technical accuracy. AI Jump addresses the unique challenges jumpers face.
        </p>
      </div>
      <div className="md:w-1/2">
        <img 
          src="/lovable-uploads/f4342e41-2c55-47a0-84c0-9fbe7a192de5.png"
          alt="Show jumping competition with horse and rider"
          className="rounded-lg w-full object-cover shadow-md h-64"
        />
      </div>
    </div>
    
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">Approach and Distance Inconsistency</h4>
        <p className="text-gray-600 text-sm">
          Finding the right distance to jumps consistently is a common struggle. AI Jump analyzes your approaches to identify patterns and help you develop more reliable distance control.
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">Position Faults at Critical Moments</h4>
        <p className="text-gray-600 text-sm">
          Many riders don't realize how their position affects their horse's jumping technique. Our video analysis pinpoints exactly where position issues occur and how they impact performance.
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">Course Strategy Optimization</h4>
        <p className="text-gray-600 text-sm">
          Planning the ideal path and pace for complex courses is challenging. Our course map analysis helps you identify optimal approaches and potential trouble spots before you enter the arena.
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">Fault Pattern Recognition</h4>
        <p className="text-gray-600 text-sm">
          Rails down or refusals often follow consistent patterns. AI Jump tracks these patterns across multiple rounds to reveal the underlying technical issues.
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100 md:col-span-2">
        <h4 className="font-medium text-blue-800 mb-2">Jump Type Difficulties</h4>
        <p className="text-gray-600 text-sm">
          Many horses and riders struggle with specific jump types. Our system identifies which obstacles consistently cause problems and recommends targeted exercises to build confidence.
        </p>
      </div>
    </div>
  </div>
);

const DisciplineSpecificTabs = () => {
  const [activeTab, setActiveTab] = useState("dressage");
  
  return (
    <section className="py-16 bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900 mb-4">
            Discipline-Specific Challenges
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Our specialized AI systems address the unique needs of different equestrian disciplines.
          </p>
          <p className="text-sm text-gray-600 font-medium">Click tabs below to toggle between disciplines</p>
        </AnimatedSection>
        
        <Tabs 
          defaultValue="dressage" 
          className="w-full max-w-6xl mx-auto"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2 mb-8 shadow-md rounded-lg overflow-hidden">
            <TabsTrigger 
              value="dressage"
              className={`px-6 py-8 flex items-center justify-center transition-all duration-300 ${
                activeTab === "dressage" 
                  ? "bg-purple-100 text-purple-900 border-b-4 border-purple-500 font-bold" 
                  : "hover:bg-purple-50 text-gray-700 hover:text-purple-800"
              }`}
            >
              <span className="text-xl font-serif font-semibold text-center">AI Dressage</span>
            </TabsTrigger>
            <TabsTrigger 
              value="jumping"
              className={`px-6 py-8 flex items-center justify-center transition-all duration-300 ${
                activeTab === "jumping" 
                  ? "bg-blue-100 text-blue-900 border-b-4 border-blue-500 font-bold" 
                  : "hover:bg-blue-50 text-gray-700 hover:text-blue-800"
              }`}
            >
              <span className="text-xl font-serif font-semibold text-center">AI Jump</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dressage" className="mt-6">
            <DressageTab />
          </TabsContent>
          <TabsContent value="jumping" className="mt-6">
            <JumpingTab />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default DisciplineSpecificTabs;
