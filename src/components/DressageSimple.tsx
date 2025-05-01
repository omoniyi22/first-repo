
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const DressageSimple = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white p-8">
      <h1 className="text-3xl font-bold text-purple-800 mb-4">AI Dressage Trainer</h1>
      <p className="text-lg mb-6">This is a simplified version of the dressage page for testing.</p>
      <Link to="/">
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Button>
      </Link>
    </div>
  );
};

export default DressageSimple;
