import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  User, 
  Loader2 
} from 'lucide-react';
import { regions, dressageLevels, horseBreeds } from '@/lib/formOptions';

// Form schema for rider profile
const riderProfileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters long"),
  riderCategory: z.enum(["Adult Amateur", "Junior Rider", "Young Rider", "Professional"]),
  competitionLevel: z.string(),
  region: z.string(),
  stable: z.string().optional(),
  trainer: z.string().optional(),
  goals: z.string().optional(),
  bio: z.string().optional(),
});

// Form schema for horse profile
const horseProfileSchema = z.object({
  name: z.string().min(2, "Horse name must be at least 2 characters long"),
  breed: z.string(),
  age: z.number().min(1).max(40),
  sex: z.enum(["Mare", "Gelding", "Stallion"]),
  competitionLevel: z.string(),
  yearsOwned: z.number().min(0),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  specialNotes: z.string().optional(),
});

type RiderProfileFormValues = z.infer<typeof riderProfileSchema>;
type HorseProfileFormValues = z.infer<typeof horseProfileSchema>;

const ProfileQuestionnaire = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [horsePhoto, setHorsePhoto] = useState<string | null>(null);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingHorse, setIsUploadingHorse] = useState(false);

  // Initialize rider form
  const riderForm = useForm<RiderProfileFormValues>({
    resolver: zodResolver(riderProfileSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      riderCategory: "Adult Amateur",
      competitionLevel: "Training Level",
      region: "United States",
      stable: "",
      trainer: "",
      goals: "",
      bio: "",
    },
  });

  // Initialize horse form
  const horseForm = useForm<HorseProfileFormValues>({
    resolver: zodResolver(horseProfileSchema),
    defaultValues: {
      name: "",
      breed: "Warmblood",
      age: 10,
      sex: "Gelding",
      competitionLevel: "Training Level",
      yearsOwned: 1,
      strengths: "",
      weaknesses: "",
      specialNotes: "",
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/sign-in', { state: { returnUrl: '/profile-questionnaire' } });
    }
  }, [user, loading, navigate]);

  // Update form values if user data changes
  useEffect(() => {
    if (user) {
      riderForm.setValue('fullName', user.user_metadata?.full_name || '');
    }
  }, [user, riderForm]);

  // Handle file upload for rider profile
  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingProfile(true);
      
      // Create a temporary URL for preview
      const tempUrl = URL.createObjectURL(file);
      setProfilePhoto(tempUrl);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful upload
      console.log('Profile photo uploaded:', file.name);
      
      // Keep the temp URL for preview
      toast({
        title: "Profile photo uploaded",
        description: "Your profile photo has been updated.",
      });
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingProfile(false);
    }
  };

  // Handle file upload for horse profile
  const handleHorsePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingHorse(true);
      
      // Create a temporary URL for preview
      const tempUrl = URL.createObjectURL(file);
      setHorsePhoto(tempUrl);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful upload
      console.log('Horse photo uploaded:', file.name);
      
      // Keep the temp URL for preview
      toast({
        title: "Horse photo uploaded",
        description: "Your horse's photo has been updated.",
      });
    } catch (error) {
      console.error('Error uploading horse photo:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your horse's photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingHorse(false);
    }
  };

  // Handle rider profile submission
  const onSubmitRiderProfile = async (data: RiderProfileFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Log the data that would be sent
      console.log('Rider profile data to save:', {
        id: user.id,
        full_name: data.fullName,
        profile_picture_url: profilePhoto,
        rider_category: data.riderCategory,
        competition_level: data.competitionLevel,
        region: data.region,
        stable: data.stable,
        trainer: data.trainer,
        goals: data.goals,
        bio: data.bio,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Profile saved",
        description: "Your rider profile has been saved successfully.",
      });
      
      setStep(2);
    } catch (error) {
      console.error('Error saving rider profile:', error);
      toast({
        title: "Save failed",
        description: "There was a problem saving your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle horse profile submission
  const onSubmitHorseProfile = async (data: HorseProfileFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Log the data that would be sent
      console.log('Horse profile data to save:', {
        owner_id: user.id,
        name: data.name,
        breed: data.breed,
        age: data.age,
        sex: data.sex,
        competition_level: data.competitionLevel,
        years_owned: data.yearsOwned,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        special_notes: data.specialNotes,
        photo_url: horsePhoto,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Horse profile saved",
        description: "Your horse's profile has been saved successfully.",
      });
      
      navigate('/profile');
    } catch (error) {
      console.error('Error saving horse profile:', error);
      toast({
        title: "Save failed",
        description: "There was a problem saving your horse's profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state or not logged in
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-semibold text-center mb-2">
              {step === 1 ? "Complete Your Profile" : "Add Your Horse"}
            </h1>
            <p className="text-gray-600 text-center">
              {step === 1 
                ? "Tell us a bit about yourself so we can personalize your experience" 
                : "Add information about your equine partner"}
            </p>
          </div>
          
          {/* Progress indicator */}
          <div className="w-full bg-gray-100 h-2 rounded-full mb-10">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            ></div>
          </div>
          
          {/* Step 1: Rider Profile */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif">Rider Information</CardTitle>
                <CardDescription>Let us know about you as a rider</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...riderForm}>
                  <form onSubmit={riderForm.handleSubmit(onSubmitRiderProfile)} className="space-y-6">
                    {/* Profile Photo */}
                    <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4 sm:gap-6 mb-4">
                      <div className="relative">
                        <Avatar className="h-24 w-24 border-2 border-gray-200">
                          {isUploadingProfile ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                            </div>
                          ) : (
                            <>
                              <AvatarImage src={profilePhoto || ''} />
                              <AvatarFallback className="bg-purple-100 text-purple-800">
                                <User size={36} />
                              </AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        <label 
                          htmlFor="profile-photo-upload"
                          className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition border border-gray-200"
                        >
                          <Upload size={14} className="text-purple-700" />
                          <input
                            id="profile-photo-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleProfilePhotoUpload}
                            disabled={isUploadingProfile}
                          />
                        </label>
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="text-lg font-medium">Profile Photo</h3>
                        <p className="text-sm text-gray-500">Upload a photo of yourself for your profile</p>
                      </div>
                    </div>
                    
                    {/* Name */}
                    <FormField
                      control={riderForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Rider Category */}
                      <FormField
                        control={riderForm.control}
                        name="riderCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rider Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Adult Amateur">Adult Amateur</SelectItem>
                                <SelectItem value="Junior Rider">Junior Rider (Under 18)</SelectItem>
                                <SelectItem value="Young Rider">Young Rider (18-21)</SelectItem>
                                <SelectItem value="Professional">Professional</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Competition Level */}
                      <FormField
                        control={riderForm.control}
                        name="competitionLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Competition Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {dressageLevels.map(level => (
                                  <SelectItem key={level} value={level}>{level}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Region */}
                      <FormField
                        control={riderForm.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Region/Country</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select region" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {regions.map(region => (
                                  <SelectItem key={region} value={region}>{region}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Stable */}
                      <FormField
                        control={riderForm.control}
                        name="stable"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Barn/Stable (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your stable name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Trainer */}
                    <FormField
                      control={riderForm.control}
                      name="trainer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trainer/Coach (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your trainer's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Goals */}
                    <FormField
                      control={riderForm.control}
                      name="goals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goals (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What are your equestrian goals for this season?" 
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Bio */}
                    <FormField
                      control={riderForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us a bit about your riding history and experience" 
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <CardFooter className="px-0 pt-4 flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-purple-600 hover:bg-purple-700" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            Save & Continue
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
          
          {/* Step 2: Horse Profile */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif">Horse Information</CardTitle>
                <CardDescription>Tell us about your equine partner</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="mb-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Basic Details</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="care">Care Notes</TabsTrigger>
                  </TabsList>
                  
                  <Form {...horseForm}>
                    <form onSubmit={horseForm.handleSubmit(onSubmitHorseProfile)} className="space-y-6 mt-6">
                      <TabsContent value="details">
                        {/* Horse Photo */}
                        <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4 sm:gap-6 mb-6">
                          <div className="relative">
                            <div className="h-24 w-24 rounded-md overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                              {isUploadingHorse ? (
                                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                              ) : (
                                horsePhoto ? (
                                  <img src={horsePhoto} alt="Horse" className="h-full w-full object-cover" />
                                ) : (
                                  <span className="text-gray-400 text-sm">No Image</span>
                                )
                              )}
                            </div>
                            <label 
                              htmlFor="horse-photo-upload"
                              className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition border border-gray-200"
                            >
                              <Upload size={14} className="text-purple-700" />
                              <input
                                id="horse-photo-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleHorsePhotoUpload}
                                disabled={isUploadingHorse}
                              />
                            </label>
                          </div>
                          <div className="text-center sm:text-left">
                            <h3 className="text-lg font-medium">Horse Photo</h3>
                            <p className="text-sm text-gray-500">Upload a photo of your horse</p>
                          </div>
                        </div>
                        
                        {/* Name */}
                        <FormField
                          control={horseForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Horse Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter horse's name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* Breed */}
                          <FormField
                            control={horseForm.control}
                            name="breed"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Breed</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select breed" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {horseBreeds.map(breed => (
                                      <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Age */}
                          <FormField
                            control={horseForm.control}
                            name="age"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Age</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Enter age" 
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Sex */}
                          <FormField
                            control={horseForm.control}
                            name="sex"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sex</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select sex" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Mare">Mare</SelectItem>
                                    <SelectItem value="Gelding">Gelding</SelectItem>
                                    <SelectItem value="Stallion">Stallion</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="performance">
                        {/* Competition Level */}
                        <FormField
                          control={horseForm.control}
                          name="competitionLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Competition Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {dressageLevels.map(level => (
                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Years Owned */}
                        <FormField
                          control={horseForm.control}
                          name="yearsOwned"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Years Owned/Ridden</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Enter number of years" 
                                  {...field}
                                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Strengths */}
                        <FormField
                          control={horseForm.control}
                          name="strengths"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Strengths (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="What are your horse's strengths in performance?" 
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Weaknesses */}
                        <FormField
                          control={horseForm.control}
                          name="weaknesses"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Areas for Improvement (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="What areas would you like to improve with your horse?" 
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      
                      <TabsContent value="care">
                        {/* Special Notes */}
                        <FormField
                          control={horseForm.control}
                          name="specialNotes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Special Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Any special notes about care, health concerns, or other important information?" 
                                  className="min-h-[150px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      
                      <div className="flex justify-between pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setStep(1)}
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              Complete Setup
                              <CheckCircle className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileQuestionnaire;
