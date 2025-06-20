
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CourseBuilderHeader from "@/components/course-builder/CourseBuilderHeader";
import CourseBuilderModeToggle from "@/components/course-builder/CourseBuilderModeToggle";
import CourseBuilderSettings from "@/components/course-builder/CourseBuilderSettings";
import CourseCanvas from "@/components/course-builder/CourseCanvas";
import CourseAnalysisPanel from "@/components/course-builder/CourseAnalysisPanel";
import CourseBuilderFeatures from "@/components/course-builder/CourseBuilderFeatures";
import { CourseBuilderProvider } from "@/components/course-builder/CourseBuilderContext";

const AiCourseBuilder = () => {
  return (
    <CourseBuilderProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 pt-navbar pb-16">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <CourseBuilderHeader />

            {/* Design Mode Toggle */}
            <CourseBuilderModeToggle />

            {/* Settings Grid */}
            <CourseBuilderSettings />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Course Canvas */}
              <CourseCanvas />

              {/* AI Analysis Panel */}
              <CourseAnalysisPanel />
            </div>

            {/* Features Info */}
            <CourseBuilderFeatures />
          </div>
        </main>
        <Footer />
      </div>
    </CourseBuilderProvider>
  );
};

export default AiCourseBuilder;
