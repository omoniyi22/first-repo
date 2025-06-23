
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CourseBuilderProvider } from "@/components/course-builder/CourseBuilderContext";
import CourseBuilderHeader from "@/components/course-builder/CourseBuilderHeader";
import CourseBuilderSettings from "@/components/course-builder/CourseBuilderSettings";
import CourseCanvas from "@/components/course-builder/CourseCanvas";
import CourseAnalysisPanel from "@/components/course-builder/CourseAnalysisPanel";
import CourseBuilderFeatures from "@/components/course-builder/CourseBuilderFeatures";

const AiCourseBuilder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate("/sign-in", { state: { from: "/ai-course-builder" } });
      return;
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <CourseBuilderProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-7xl mx-auto">
            <CourseBuilderHeader />
            
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
              <CourseBuilderSettings />
              <CourseCanvas />
              <CourseAnalysisPanel />
            </div>

            <CourseBuilderFeatures />
          </div>
        </main>
        <Footer />
      </div>
    </CourseBuilderProvider>
  );
};

export default AiCourseBuilder;
