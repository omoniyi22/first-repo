
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const DisciplineContent = () => {
  const [disciplineTab, setDisciplineTab] = useState("dressage");
  const [expandedSection, setExpandedSection] = useState<string | null>("introduction");
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  // Dummy content - in a real app this would come from your CMS or database
  const [content, setContent] = useState({
    dressage: {
      introduction: "AI Dressage analyzes your dressage tests to provide detailed feedback and personalized training recommendations to improve your performance.",
      howItWorks: "Upload your dressage test videos or scoresheets, and our AI will analyze your performance, identify areas for improvement, and provide actionable training recommendations.",
      benefits: "Get objective feedback on your dressage tests, track your progress over time, and receive personalized training recommendations tailored to your specific needs.",
    },
    jumping: {
      introduction: "AI Jumping analyzes your jumping rounds to provide detailed feedback and personalized training recommendations to improve your performance.",
      howItWorks: "Upload your jumping videos, and our AI will analyze your horse's jumping form, approach, and landing, identify areas for improvement, and provide actionable training recommendations.",
      benefits: "Get objective feedback on your jumping technique, track your progress over time, and receive personalized training recommendations tailored to your specific needs."
    }
  });
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  const startEditing = (section: string) => {
    setIsEditing(section);
  };
  
  const saveEdits = () => {
    // In a real app, you would save the changes to your database
    setIsEditing(null);
  };
  
  const handleContentChange = (discipline: string, section: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [discipline]: {
        ...prev[discipline as keyof typeof prev],
        [section]: value
      }
    }));
  };

  const renderContentSection = (discipline: string, title: string, section: string, content: string) => {
    const isExpanded = expandedSection === section;
    const isEditingThis = isEditing === section;
    
    return (
      <Card className="mb-4">
        <CardHeader className="py-3 px-4">
          <div className="flex justify-between items-center">
            <div 
              className="flex-1 flex items-center cursor-pointer" 
              onClick={() => toggleSection(section)}
            >
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => isEditingThis ? saveEdits() : startEditing(section)}
              className="h-8 w-8"
            >
              {isEditingThis ? "Save" : <Pencil className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent>
            {isEditingThis ? (
              <Textarea 
                value={content} 
                onChange={(e) => handleContentChange(discipline, section, e.target.value)} 
                className="min-h-[120px]"
              />
            ) : (
              <p className="text-gray-700">{content}</p>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Discipline Content Management</CardTitle>
          <CardDescription>
            Edit content for each discipline section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={disciplineTab} onValueChange={setDisciplineTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="dressage" className="flex-1">Dressage</TabsTrigger>
              <TabsTrigger value="jumping" className="flex-1">Jumping</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dressage">
              <div className="space-y-1">
                {renderContentSection("dressage", "Introduction", "introduction", content.dressage.introduction)}
                {renderContentSection("dressage", "How It Works", "howItWorks", content.dressage.howItWorks)}
                {renderContentSection("dressage", "Benefits", "benefits", content.dressage.benefits)}
              </div>
              
              <div className="flex justify-end mt-6">
                <Button>Update Dressage Content</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="jumping">
              <div className="space-y-1">
                {renderContentSection("jumping", "Introduction", "introduction", content.jumping.introduction)}
                {renderContentSection("jumping", "How It Works", "howItWorks", content.jumping.howItWorks)}
                {renderContentSection("jumping", "Benefits", "benefits", content.jumping.benefits)}
              </div>
              
              <div className="flex justify-end mt-6">
                <Button>Update Jumping Content</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured Images</CardTitle>
          <CardDescription>
            Manage featured images for each discipline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={disciplineTab}>
            <TabsContent value="dressage">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Hero Image</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-1/3 border rounded-md overflow-hidden">
                      <img 
                        src="/lovable-uploads/e2cfe504-4899-4458-9af3-b8deb0a24a4b.png" 
                        alt="Dressage Hero" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Input 
                        className="mb-2" 
                        placeholder="Image URL" 
                        value="/lovable-uploads/e2cfe504-4899-4458-9af3-b8deb0a24a4b.png"
                      />
                      <Button variant="outline" size="sm">Choose New Image</Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">How It Works Image</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-1/3 border rounded-md overflow-hidden">
                      <img 
                        src="/lovable-uploads/2d7d12d5-7cbc-4747-878c-897c94ab8d18.png" 
                        alt="Dressage How It Works" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Input 
                        className="mb-2" 
                        placeholder="Image URL" 
                        value="/lovable-uploads/2d7d12d5-7cbc-4747-878c-897c94ab8d18.png"
                      />
                      <Button variant="outline" size="sm">Choose New Image</Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="jumping">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Hero Image</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-1/3 border rounded-md overflow-hidden">
                      <img 
                        src="/lovable-uploads/photo-1438565434616-3ef039228b15.jpeg" 
                        alt="Jumping Hero" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Input 
                        className="mb-2" 
                        placeholder="Image URL" 
                        value="/lovable-uploads/photo-1438565434616-3ef039228b15.jpeg"
                      />
                      <Button variant="outline" size="sm">Choose New Image</Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">How It Works Image</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-1/3 border rounded-md overflow-hidden">
                      <img 
                        src="/lovable-uploads/photo-1438565434616-3ef039228b15.jpeg" 
                        alt="Jumping How It Works" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Input 
                        className="mb-2" 
                        placeholder="Image URL" 
                        value="/lovable-uploads/photo-1438565434616-3ef039228b15.jpeg"
                      />
                      <Button variant="outline" size="sm">Choose New Image</Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DisciplineContent;
