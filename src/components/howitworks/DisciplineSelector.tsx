
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const DisciplineSelector = () => {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {/* Dressage Card */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl overflow-hidden shadow-lg text-white">
        <div className="p-8">
          <h3 className="text-2xl font-serif font-medium mb-4">AI Dressage Trainer</h3>
          <p className="mb-6">Transform your dressage performance with AI-powered analysis of test scores, videos, and receive personalized training recommendations.</p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-purple-600 flex items-center justify-center font-medium text-sm">1</div>
              <p>Upload dressage test videos or score sheets</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-purple-600 flex items-center justify-center font-medium text-sm">2</div>
              <p>Receive detailed AI analysis of movements and transitions</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-purple-600 flex items-center justify-center font-medium text-sm">3</div>
              <p>Follow personalized training recommendations</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button variant="secondary" className="w-full sm:w-auto bg-white hover:bg-gray-100 text-purple-700">
              Start Your Free Trial
            </Button>
            <Link to="/dressage/how-it-works" className="text-sm text-white/80 hover:text-white">
              Learn More About AI Dressage Trainer
            </Link>
          </div>
        </div>
      </div>
      
      {/* Jumping Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl overflow-hidden shadow-lg text-white">
        <div className="p-8">
          <h3 className="text-2xl font-serif font-medium mb-4">AI Jumping Trainer</h3>
          <p className="mb-6">Elevate your jumping performance with AI-powered video analysis, course insights, and personalized training recommendations.</p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center font-medium text-sm">1</div>
              <p>Upload videos of your jumping rounds or training sessions</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center font-medium text-sm">2</div>
              <p>Get analyzed insights on approach, takeoff, and landing</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center font-medium text-sm">3</div>
              <p>Implement targeted exercises to improve technique</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button variant="secondary" className="w-full sm:w-auto bg-white hover:bg-gray-100 text-blue-700">
              Start Your Free Trial
            </Button>
            <Link to="/jumping/how-it-works" className="text-sm text-white/80 hover:text-white">
              Learn More About AI Jumping Trainer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisciplineSelector;
