
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Book, Award, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const DressageSimple = () => {
  useEffect(() => {
    console.log('DressageSimple component mounted - Testing rendering');
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Header section */}
          <div className="flex flex-col gap-4">
            <Link to="/">
              <Button variant="outline" className="flex items-center gap-2 mb-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
            
            <h1 className="text-4xl font-bold text-purple-800">AI Dressage Trainer</h1>
            <p className="text-lg text-gray-600">
              Your intelligent companion for perfect dressage training and competition preparation.
            </p>
          </div>

          {/* Main content section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Training Progress</CardTitle>
                  <CardDescription>Track your dressage journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Transitions</span>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Half-pass</span>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Lateral work</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Training Focus</CardTitle>
                  <CardDescription>AI recommended focus areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Award className="h-6 w-6 text-purple-700" />
                      </div>
                      <div>
                        <h3 className="font-medium">Improve Collection</h3>
                        <p className="text-sm text-gray-600">Focus on engagement and cadence in collected gaits</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Book className="h-6 w-6 text-purple-700" />
                      </div>
                      <div>
                        <h3 className="font-medium">Flying Changes</h3>
                        <p className="text-sm text-gray-600">Practice clean, balanced flying changes across the diagonal</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right column */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-purple-700 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Regional Championships</h3>
                        <p className="text-sm text-gray-600">May 15, 2025</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-purple-700 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Training Session</h3>
                        <p className="text-sm text-gray-600">May 8, 2025</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Analysis</CardTitle>
                  <CardDescription>Upload a short video clip</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="movement">Movement</Label>
                      <Input id="movement" placeholder="e.g., Extended Trot" />
                    </div>
                    
                    <Button className="w-full bg-purple-700 hover:bg-purple-800">
                      Upload Video
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">Need Help?</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">AI Dressage Coach</h4>
                    <p className="text-sm text-gray-600">
                      Our AI coach can analyze your riding position, horse's movement, and provide personalized feedback.
                    </p>
                    <Button size="sm" className="w-full mt-2 bg-purple-700 hover:bg-purple-800">
                      Talk to AI Coach
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DressageSimple;
