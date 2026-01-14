
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Camera,
  House,
  Trophy,
  Target,
  ArrowRight,
  ClipboardList,
  UserCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

const JumpProfileSetup = () => {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    rider: {
      fullName: '',
      riderCategory: '',
      competitionLevel: '',
      region: '',
      stable: '',
      coach: '',
      profileImage: null,
    },
    horse: {
      name: '',
      breed: '',
      age: '',
      sex: '',
      competitionHeight: '',
      yearsCompeting: '',
      photo: null,
      disciplines: [],
    },
    jumpingDetails: {
      competitionFocus: '',
      faultPatterns: [],
      goals: [],
      coursesPerMonth: '',
      competitionsPerMonth: '',
    },
    technicalFocus: {
      approach: [],
      execution: [],
      courseNavigation: [],
      riderPosition: [],
    },
    preferences: {
      metrics: [],
      notifications: [],
      coachEmail: '',
    }
  });

  const handleInputChange = (section: string, field: string, value: string | string[] | null) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleNextStep = () => {
    setStep(prev => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const renderProgressBar = () => {
    return (
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        ></div>
      </div>
    );
  };

  const renderStepIcon = (currentStep: number, stepNumber: number, icon: React.ReactNode) => {
    return (
      <div className={`flex flex-col items-center justify-center ${currentStep === stepNumber ? 'text-blue-600' : 'text-gray-400'}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${currentStep === stepNumber ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
          {icon}
        </div>
      </div>
    );
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-between mb-10 max-w-3xl mx-auto px-4">
        {renderStepIcon(step, 1, <UserCircle size={24} />)}
        {renderStepIcon(step, 2, <House size={24} />)}
        {renderStepIcon(step, 3, <ClipboardList size={24} />)}
        {renderStepIcon(step, 4, <Target size={24} />)}
        {renderStepIcon(step, 5, <Settings size={24} />)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-blue-900 mb-4">AI Jump Profile Setup</h1>
            <p className="text-gray-600">
              Complete your profile to get personalized jumping analysis and recommendations
            </p>
          </div>
          
          {renderProgressBar()}
          {renderStepIndicator()}
          
          <Card className="p-6 md:p-8 border-0 shadow-md rounded-xl bg-white">
            {/* Step 1: Rider Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <UserCircle className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-medium">Rider Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName"
                      value={profileData.rider.fullName}
                      onChange={(e) => handleInputChange('rider', 'fullName', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Profile Photo</Label>
                    <div className="mt-1 flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Image
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="riderCategory">Rider Category</Label>
                    <Select
                      onValueChange={(value) => handleInputChange('rider', 'riderCategory', value)}
                      value={profileData.rider.riderCategory}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior Rider (Under 18)</SelectItem>
                        <SelectItem value="young">Young Rider (18-21)</SelectItem>
                        <SelectItem value="amateur">Adult Amateur</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="competitionLevel">Primary Competition Level</Label>
                    <Select
                      onValueChange={(value) => handleInputChange('rider', 'competitionLevel', value)}
                      value={profileData.rider.competitionLevel}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.80-0.90">0.80m-0.90m</SelectItem>
                        <SelectItem value="1.00-1.10">1.00m-1.10m</SelectItem>
                        <SelectItem value="1.15-1.25">1.15m-1.25m</SelectItem>
                        <SelectItem value="1.30-1.40">1.30m-1.40m</SelectItem>
                        <SelectItem value="1.45+">1.45m+ (Grand Prix)</SelectItem>
                        <SelectItem value="eventing">Eventing Show Jumping</SelectItem>
                        <SelectItem value="equitation">Equitation/Medal Classes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="region">Country/Region</Label>
                    <Input 
                      id="region"
                      value={profileData.rider.region}
                      onChange={(e) => handleInputChange('rider', 'region', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="stable">Home Barn/Stable</Label>
                    <Input 
                      id="stable"
                      value={profileData.rider.stable}
                      onChange={(e) => handleInputChange('rider', 'stable', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="coach">Trainer/Coach Name</Label>
                    <Input 
                      id="coach"
                      value={profileData.rider.coach}
                      onChange={(e) => handleInputChange('rider', 'coach', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Horse Information */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <House className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-medium">Horse Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="horseName">Horse Name</Label>
                    <Input 
                      id="horseName"
                      value={profileData.horse.name}
                      onChange={(e) => handleInputChange('horse', 'name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="breed">Breed</Label>
                    <Select
                      onValueChange={(value) => handleInputChange('horse', 'breed', value)}
                      value={profileData.horse.breed}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select breed" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warmblood">Warmblood</SelectItem>
                        <SelectItem value="thoroughbred">Thoroughbred</SelectItem>
                        <SelectItem value="quarter">Quarter Horse</SelectItem>
                        <SelectItem value="irish">Irish Sport Horse</SelectItem>
                        <SelectItem value="hanoverian">Hanoverian</SelectItem>
                        <SelectItem value="dutch">Dutch Warmblood</SelectItem>
                        <SelectItem value="holsteiner">Holsteiner</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input 
                      id="age"
                      type="number"
                      value={profileData.horse.age}
                      onChange={(e) => handleInputChange('horse', 'age', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sex">Sex</Label>
                    <Select
                      onValueChange={(value) => handleInputChange('horse', 'sex', value)}
                      value={profileData.horse.sex}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mare">Mare</SelectItem>
                        <SelectItem value="gelding">Gelding</SelectItem>
                        <SelectItem value="stallion">Stallion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="yearsCompeting">Years Competing</Label>
                    <Input 
                      id="yearsCompeting"
                      type="number"
                      value={profileData.horse.yearsCompeting}
                      onChange={(e) => handleInputChange('horse', 'yearsCompeting', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="competitionHeight">Current Competition Height</Label>
                  <Select
                    onValueChange={(value) => handleInputChange('horse', 'competitionHeight', value)}
                    value={profileData.horse.competitionHeight}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select height" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.80-0.90">0.80m-0.90m</SelectItem>
                      <SelectItem value="1.00-1.10">1.00m-1.10m</SelectItem>
                      <SelectItem value="1.15-1.25">1.15m-1.25m</SelectItem>
                      <SelectItem value="1.30-1.40">1.30m-1.40m</SelectItem>
                      <SelectItem value="1.45+">1.45m+ (Grand Prix)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Horse Photo</Label>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                      <Camera className="h-8 w-8 text-gray-400" />
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="mb-3 block">Competition Disciplines</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Jumpers', 'Equitation', 'Hunters', 'Eventing'].map(discipline => (
                      <div key={discipline} className="flex items-center space-x-2">
                        <Checkbox id={discipline} />
                        <Label htmlFor={discipline}>{discipline}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button variant="outline" className="mt-4 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="h-4 w-4 text-blue-600">+</div>
                  </div>
                  Add Another Horse
                </Button>
              </div>
            )}
            
            {/* Step 3: Jumping-Specific Details */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-medium">Jumping-Specific Details</h2>
                </div>
                
                <div>
                  <Label htmlFor="competitionFocus" className="mb-2 block">Primary Competition Focus</Label>
                  <RadioGroup 
                    value={profileData.jumpingDetails.competitionFocus} 
                    onValueChange={(value) => handleInputChange('jumpingDetails', 'competitionFocus', value)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    {[
                      'Clear rounds', 
                      'Speed classes', 
                      'Derby/specialty classes', 
                      'Equitation', 
                      'Hunter', 
                      'Eventing show jumping'
                    ].map(focus => (
                      <div key={focus} className="flex items-center space-x-2">
                        <RadioGroupItem value={focus.toLowerCase().replace(/\s+/g, '-')} id={`focus-${focus}`} />
                        <Label htmlFor={`focus-${focus}`}>{focus}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div>
                  <Label className="mb-2 block">Typical Fault Patterns</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Rails (front legs)',
                      'Rails (hind legs)',
                      'Refusals',
                      'Time penalties',
                      'Run-outs',
                      'Rider accuracy issues'
                    ].map(pattern => (
                      <div key={pattern} className="flex items-center space-x-2">
                        <Checkbox id={`fault-${pattern}`} />
                        <Label htmlFor={`fault-${pattern}`}>{pattern}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Competition Goals</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Moving up to next height',
                      'Qualifying for specific championship',
                      'Improving clear round percentage',
                      'Reducing time penalties',
                      'Gaining experience at current level'
                    ].map(goal => (
                      <div key={goal} className="flex items-center space-x-2">
                        <Checkbox id={`goal-${goal}`} />
                        <Label htmlFor={`goal-${goal}`}>{goal}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="coursesPerMonth">Typical Courses Completed Per Month</Label>
                    <Input 
                      id="coursesPerMonth"
                      type="number"
                      value={profileData.jumpingDetails.coursesPerMonth}
                      onChange={(e) => handleInputChange('jumpingDetails', 'coursesPerMonth', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="competitionsPerMonth">Typical Competitions Per Month</Label>
                    <Input 
                      id="competitionsPerMonth"
                      type="number"
                      value={profileData.jumpingDetails.competitionsPerMonth}
                      onChange={(e) => handleInputChange('jumpingDetails', 'competitionsPerMonth', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-6 px-2">Import</Button>
                    <span>Import Competition Record (Optional)</span>
                  </Label>
                </div>
              </div>
            )}
            
            {/* Step 4: Technical Focus Areas */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-medium">Technical Focus Areas</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <Label className="mb-2 block">Approach Issues</Label>
                    <div className="space-y-2">
                      {[
                        'Consistent striding',
                        'Speed control',
                        'Straightness',
                        'Finding distance'
                      ].map(issue => (
                        <div key={issue} className="flex items-center space-x-2">
                          <Checkbox id={`approach-${issue}`} />
                          <Label htmlFor={`approach-${issue}`}>{issue}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Jump Execution Issues</Label>
                    <div className="space-y-2">
                      {[
                        'Take-off distance',
                        'Bascule form',
                        'Front leg clearance',
                        'Hind leg clearance'
                      ].map(issue => (
                        <div key={issue} className="flex items-center space-x-2">
                          <Checkbox id={`execution-${issue}`} />
                          <Label htmlFor={`execution-${issue}`}>{issue}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Course Navigation Issues</Label>
                    <div className="space-y-2">
                      {[
                        'Turn efficiency',
                        'Rhythm between fences',
                        'Related distances',
                        'Combination issues',
                        'Course memorization'
                      ].map(issue => (
                        <div key={issue} className="flex items-center space-x-2">
                          <Checkbox id={`navigation-${issue}`} />
                          <Label htmlFor={`navigation-${issue}`}>{issue}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Rider Position Issues</Label>
                    <div className="space-y-2">
                      {[
                        'Balance over jumps',
                        'Release timing',
                        'Leg position',
                        'Eye focus',
                        'Recovery after jumps'
                      ].map(issue => (
                        <div key={issue} className="flex items-center space-x-2">
                          <Checkbox id={`position-${issue}`} />
                          <Label htmlFor={`position-${issue}`}>{issue}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 5: Preferences & Settings */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-medium">Preferences & Settings</h2>
                </div>
                
                <div>
                  <Label className="mb-2 block">Performance Metrics to Prioritize (Select Top 3)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Clear round percentage',
                      'Time efficiency',
                      'Jump technique scores',
                      'Approach consistency',
                      'Turn efficiency',
                      'Competition vs. training comparison'
                    ].map(metric => (
                      <div key={metric} className="flex items-center space-x-2">
                        <Checkbox id={`metric-${metric}`} />
                        <Label htmlFor={`metric-${metric}`}>{metric}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Notification Preferences</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Analysis complete',
                      'Competition reminders',
                      'Training recommendations',
                      'Goal progress updates'
                    ].map(notification => (
                      <div key={notification} className="flex items-center space-x-2">
                        <Checkbox id={`notification-${notification}`} />
                        <Label htmlFor={`notification-${notification}`}>{notification}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="coachEmail">Coach Connection (Optional)</Label>
                  <div className="mt-1">
                    <Input 
                      id="coachEmail"
                      type="email"
                      placeholder="Coach's email address"
                      value={profileData.preferences.coachEmail}
                      onChange={(e) => handleInputChange('preferences', 'coachEmail', e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox id="shareData" />
                      <Label htmlFor="shareData">Share performance data with coach</Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Upload First Round Video (Optional)</Label>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Video
                  </Button>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="calendar" />
                    <Label htmlFor="calendar">Connect Competition Calendar</Label>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <Button 
                  variant="outline" 
                  onClick={handlePrevStep}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div></div>
              )}
              
              {step < 5 ? (
                <Button 
                  onClick={handleNextStep}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Link to="/dashboard">
                  <Button 
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    Complete Profile
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </Card>
          
          {/* Preview only shown on last step */}
          {step === 5 && (
            <div className="mt-16">
              <h2 className="text-2xl font-serif font-medium text-blue-900 mb-6">Dashboard Preview</h2>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Your AI Jump Experience</h3>
                  <p className="text-gray-600">
                    Once your profile is complete, you'll have access to personalized analytics, training recommendations, and progress tracking.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Performance Metrics</h4>
                    <p className="text-sm text-gray-600">Track your improvement across key jumping metrics.</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Video Analysis</h4>
                    <p className="text-sm text-gray-600">Upload videos for AI-powered technique assessment.</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Training Plan</h4>
                    <p className="text-sm text-gray-600">Get personalized recommendations for improvement.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JumpProfileSetup;
