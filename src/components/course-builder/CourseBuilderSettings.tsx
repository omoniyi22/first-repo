
import React from "react";
import { useCourseBuilder } from "./CourseBuilderContext";
import AiCourseSettings from "./AiCourseSettings";
import ManualCourseSettings from "./ManualCourseSettings";

const CourseBuilderSettings = () => {
  const { designMode } = useCourseBuilder();

  return (
    <div className="glass-card p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {designMode === "ai" ? <AiCourseSettings /> : <ManualCourseSettings />}
      </div>
    </div>
  );
};

export default CourseBuilderSettings;
