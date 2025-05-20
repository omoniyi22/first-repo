
import React from 'react';
import AnimatedSection from '../ui/AnimatedSection';

const PrivacySection = () => {
  return (
    <AnimatedSection animation="fade-in" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-medium mb-8 text-purple-900">
            Your Privacy Matters
          </h2>
          
          <p className="text-lg text-gray-700 mb-4">
            Your privacy is our priority. All videos and scores you upload are securely stored and only 
            accessible by you. You're always in control of who sees your content — whether it's just you or 
            shared with a coach.
          </p>
          
          <p className="text-lg text-gray-700">
            Our AI analyzes your footage automatically, with no human review unless you 
            choose it. We never use your data for anything else without your permission.
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default PrivacySection;
