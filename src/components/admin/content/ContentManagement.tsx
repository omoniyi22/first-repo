
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DisciplineContent from "@/components/admin/content/DisciplineContent";
import FaqContent from "@/components/admin/content/FaqContent";
import TestimonialsContent from "@/components/admin/content/TestimonialsContent";

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState("disciplines");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-500">Manage website content across disciplines</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto">
          <TabsTrigger value="disciplines">Disciplines</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="disciplines" className="mt-6">
          <DisciplineContent />
        </TabsContent>
        
        <TabsContent value="faqs" className="mt-6">
          <FaqContent />
        </TabsContent>
        
        <TabsContent value="testimonials" className="mt-6">
          <TestimonialsContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;
