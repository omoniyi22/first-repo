
import React from 'react';
import { useCourseBuilder } from './CourseBuilderContext';
import AiCourseSettings from './AiCourseSettings';
import ManualCourseSettings from './ManualCourseSettings';

const CourseBuilderSettings = () => {
  const { designMode } = useCourseBuilder();

  return (
    <div className="xl:col-span-1">
      {designMode === 'ai' ? <AiCourseSettings /> : <ManualCourseSettings />}
    </div>
  );
};

export default CourseBuilderSettings;
