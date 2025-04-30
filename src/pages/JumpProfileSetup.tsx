
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Upload, 
  Camera,
  Horse,
  Trophy,
  Target,
  Clock,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Toaster } from '@/components/ui/toaster';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';

// Define steps for the questionnaire
const steps = [
  "Rider Information",
  "Horse Information",
  "Jumping-Specific Details",
  "Technical Focus Areas",
  "Preferences & Settings"
];

// Schema for form validation
const formSchema = z.object({
  // Step 1: Rider Information
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  profilePicture: z.any().optional(),
  riderCategory: z.enum(["Junior Rider", "Young Rider", "Adult Amateur", "Professional"]),
  competitionLevel: z.string(),
  region: z.string(),
  stableAffiliation: z.string().optional(),
  coachName: z.string().optional(),
  
  // Step 2: Horse Information
  hasHorse: z.boolean(),
  horses: z.array(
    z.object({
      name: z.string().min(1, { message: "Horse name is required." }),
      breed: z.string(),
      age: z.number().min(1).max(40),
      sex: z.enum(["Gelding", "Mare", "Stallion"]),
      height: z.string(),
      yearsCompeting: z.number().min(0),
      photo: z.any().optional(),
      disciplines: z.array(z.string()).min(1, "Select at least one discipline"),
    })
  ).optional(),
  
  // Step 3: Jumping-Specific Details
  competitionFocus: z.string(),
  faultPatterns: z.array(z.string()).optional(),
  competitionGoals: z.array(z.string()).min(1, "Select at least one goal"),
  coursesPerMonth: z.number().min(0),
  competitionsPerMonth: z.number().min(0),
  importRecord: z.enum(["now", "later", "no"]).optional(),
  
  // Step 4: Technical Focus Areas
  approachIssues: z.array(z.string()).optional(),
  jumpExecutionIssues: z.array(z.string()).optional(),
  courseNavigationIssues: z.array(z.string()).optional(),
  riderPositionIssues: z.array(z.string()).optional(),
  
  // Step 5: Preferences & Settings
  priorityMetrics: z.array(z.string()).max(3, "Select up to 3 metrics"),
  notifications: z.array(z.string()).optional(),
  connectWithCoach: z.boolean().optional(),
  coachEmail: z.string().email().optional(),
  firstVideo: z.any().optional(),
  connectCalendar: z.boolean().optional()
});

type FormValues = z.infer<typeof formSchema>;

// Common jumping horse breeds
const horseBreeds = [
  "Warmblood",
  "Thoroughbred",
  "Hanoverian",
  "Holsteiner",
  "Selle Français",
  "KWPN",
  "Oldenburg",
  "Zangersheide",
  "Irish Sport Horse",
  "Belgian Warmblood",
  "Westphalian",
  "Quarter Horse",
  "Trakehner",
  "Anglo-Arabian",
  "Cleveland Bay",
  "Appendix Quarter Horse",
  "Paint",
  "Appaloosa",
  "Other"
];

// Competition heights
const competitionHeights = [
  "0.80m-0.90m",
  "1.00m-1.10m", 
  "1.15m-1.25m", 
  "1.30m-1.40m", 
  "1.45m+ (Grand Prix)",
  "Eventing Show Jumping",
  "Equitation/Medal Classes"
];

// Regions/Countries
const regions = [
  "United States",
  "Canada",
  "United Kingdom",
  "Ireland",
  "France",
  "Germany",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Spain",
  "Italy",
  "Sweden",
  "Denmark",
  "Australia",
  "New Zealand",
  "Other"
];

const JumpProfileSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [horsePhotos, setHorsePhotos] = useState<{[key: number]: string | null}>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      riderCategory: "Adult Amateur",
      competitionLevel: "1.00m-1.10m",
      region: "United States",
      hasHorse: false,
      horses: [],
      competitionFocus: "Clear rounds",
      faultPatterns: [],
      competitionGoals: [],
      coursesPerMonth: 8,
      competitionsPerMonth: 2,
      approachIssues: [],
      jumpExecutionIssues: [],
      courseNavigationIssues: [],
      riderPositionIssues: [],
      priorityMetrics: [],
      notifications: [],
      connectWithCoach: false,
      connectCalendar: false
    }
  });

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload images.",
          variant: "destructive"
        });
        return;
      }
      
      // Upload image to Supabase Storage
      const fileName = `${user.id}-profile-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from('profiles')
        .upload(`profile-images/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('profiles')
        .getPublicUrl(`profile-images/${fileName}`);
      
      setProfileImageUrl(publicUrl.publicUrl);
      toast({
        title: "Image uploaded",
        description: "Your profile picture has been uploaded successfully."
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleHorseImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload images.",
          variant: "destructive"
        });
        return;
      }
      
      // Upload image to Supabase Storage
      const fileName = `${user.id}-horse-${index}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from('profiles')
        .upload(`horse-images/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('profiles')
        .getPublicUrl(`horse-images/${fileName}`);
      
      setHorsePhotos({...horsePhotos, [index]: publicUrl.publicUrl});
      toast({
        title: "Image uploaded",
        description: "The horse photo has been uploaded successfully."
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save your profile.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Prepare profile data
      const profileData = {
        id: user.id,
        full_name: data.fullName,
        profile_picture_url: profileImageUrl,
        rider_category: data.riderCategory,
        competition_level: data.competitionLevel,
        region: data.region,
        stable_affiliation: data.stableAffiliation || null,
        coach_name: data.coachName || null,
        has_horse: data.hasHorse,
        competition_focus: data.competitionFocus,
        fault_patterns: data.faultPatterns || [],
        competition_goals: data.competitionGoals || [],
        courses_per_month: data.coursesPerMonth,
        competitions_per_month: data.competitionsPerMonth,
        import_results: data.importRecord || null,
        approach_issues: data.approachIssues || [],
        jump_execution_issues: data.jumpExecutionIssues || [],
        course_navigation_issues: data.courseNavigationIssues || [],
        rider_position_issues: data.riderPositionIssues || [],
        priority_metrics: data.priorityMetrics || [],
        notifications: data.notifications || [],
        connect_with_coach: data.connectWithCoach || false,
        coach_email: data.coachEmail || null,
        connect_calendar: data.connectCalendar || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Save profile data to Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData);
      
      if (profileError) {
        throw profileError;
      }
      
      // Save horse data if any
      if (data.hasHorse && data.horses && data.horses.length > 0) {
        const horsesData = data.horses.map((horse, index) => ({
          owner_id: user.id,
          name: horse.name,
          breed: horse.breed,
          age: horse.age,
          sex: horse.sex,
          competition_level: horse.height,
          years_competing: horse.yearsCompeting,
          disciplines: horse.disciplines,
          photo_url: horsePhotos[index] || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        const { error: horsesError } = await supabase
          .from('horses')
          .upsert(horsesData);
        
        if (horsesError) {
          throw horsesError;
        }
      }
      
      toast({
        title: "Profile saved",
        description: "Your AI Jump profile has been created successfully."
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (error: any) {
      toast({
        title: "Failed to save profile",
        description: error.message || "An error occurred while saving your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step navigation
  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    window.scrollTo(0, 0);
  };
  
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  // Add horse form functionality
  const addHorse = () => {
    const currentHorses = form.getValues("horses") || [];
    form.setValue("horses", [
      ...currentHorses,
      {
        name: "",
        breed: "Warmblood",
        age: 8,
        sex: "Gelding",
        height: "1.00m-1.10m",
        yearsCompeting: 1,
        photo: null,
        disciplines: ["Jumpers"]
      }
    ]);
  };
  
  const removeHorse = (index: number) => {
    const currentHorses = form.getValues("horses") || [];
    form.setValue(
      "horses",
      currentHorses.filter((_, i) => i !== index)
    );
    
    // Also remove photo if exists
    if (horsePhotos[index]) {
      const updatedPhotos = {...horsePhotos};
      delete updatedPhotos[index];
      setHorsePhotos(updatedPhotos);
    }
  };
  
  // Calculate form progress percentage
  const calculateProgress = () => {
    const totalSteps = steps.length;
    return Math.round(((currentStep + 1) / totalSteps) * 100);
  };

  // Create form steps
  const renderFormStep = () => {
    switch (currentStep) {
      case 0: // Rider Information
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-blue-700">
              <User size={24} />
              <h2 className="text-2xl font-bold">Rider Information</h2>
            </div>
            <p className="text-gray-600">Tell us about yourself so we can tailor the AI Jump experience to your needs.</p>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-100 border border-gray-200">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <Camera className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="profile-upload"
                      className="flex cursor-pointer items-center rounded-md bg-white px-4 py-2 text-sm border border-gray-200 hover:bg-gray-50"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Image
                    </label>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleProfileImageUpload}
                    />
                  </div>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="riderCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rider Category*</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Junior Rider" />
                          </FormControl>
                          <FormLabel className="font-normal">Junior Rider (Under 18)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Young Rider" />
                          </FormControl>
                          <FormLabel className="font-normal">Young Rider (18-21)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Adult Amateur" />
                          </FormControl>
                          <FormLabel className="font-normal">Adult Amateur</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Professional" />
                          </FormControl>
                          <FormLabel className="font-normal">Professional</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="competitionLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Primary Competition Level*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a competition level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {competitionHeights.map((height) => (
                          <SelectItem key={height} value={height}>
                            {height}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region/Country*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="stableAffiliation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Barn/Stable</FormLabel>
                    <FormControl>
                      <Input placeholder="Your stable or barn" {...field} />
                    </FormControl>
                    <FormDescription>Optional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="coachName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trainer/Coach Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your coach or trainer" {...field} />
                    </FormControl>
                    <FormDescription>Optional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
        
      case 1: // Horse Information
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-blue-700">
              <Horse size={24} />
              <h2 className="text-2xl font-bold">Horse Information</h2>
            </div>
            <p className="text-gray-600">Tell us about your equine partner(s) so we can customize your jumping analysis.</p>
            
            <FormField
              control={form.control}
              name="hasHorse"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Do you have a horse you're currently training/competing with?
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            {form.watch("hasHorse") && (
              <div className="space-y-6">
                {(form.watch("horses") || []).map((horse, index) => (
                  <div key={index} className="rounded-lg border border-blue-100 p-4 space-y-4 bg-blue-50/30">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-blue-700">Horse #{index + 1}</h3>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeHorse(index)}
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name={`horses.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horse's Name*</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`horses.${index}.breed`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Breed*</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select breed" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {horseBreeds.map((breed) => (
                                <SelectItem key={breed} value={breed}>
                                  {breed}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`horses.${index}.age`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age*</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`horses.${index}.sex`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sex*</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sex" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Gelding">Gelding</SelectItem>
                                <SelectItem value="Mare">Mare</SelectItem>
                                <SelectItem value="Stallion">Stallion</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`horses.${index}.height`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Competition Height*</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select height" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {competitionHeights.map((height) => (
                                  <SelectItem key={height} value={height}>
                                    {height}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`horses.${index}.yearsCompeting`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years competing with this horse*</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name={`horses.${index}.disciplines`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Competition Disciplines*</FormLabel>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {["Jumpers", "Equitation", "Hunters", "Eventing"].map(discipline => (
                              <FormItem key={discipline} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(discipline)}
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value || [];
                                      return checked
                                        ? field.onChange([...currentValue, discipline])
                                        : field.onChange(currentValue.filter(v => v !== discipline));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">{discipline}</FormLabel>
                              </FormItem>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Horse Photo</label>
                      <div className="flex items-center space-x-4">
                        <div className="h-24 w-32 overflow-hidden rounded-md bg-gray-100 border border-gray-200">
                          {horsePhotos[index] ? (
                            <img
                              src={horsePhotos[index] || ''}
                              alt={`Horse ${index}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              <Camera className="h-10 w-10" />
                            </div>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor={`horse-upload-${index}`}
                            className="flex cursor-pointer items-center rounded-md bg-white px-4 py-2 text-sm border border-gray-200 hover:bg-gray-50"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Choose Image
                          </label>
                          <input
                            id={`horse-upload-${index}`}
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleHorseImageUpload(e, index)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addHorse}
                  className="mt-4 w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  Add Another Horse
                </Button>
              </div>
            )}

            {!form.watch("hasHorse") && (
              <div className="rounded-lg border border-blue-100 p-4 bg-blue-50/30 text-center">
                <p className="text-sm text-blue-700">
                  You can add horses to your profile later. You can still continue with the profile setup.
                </p>
              </div>
            )}
          </div>
        );
        
      case 2: // Jumping-Specific Details
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-blue-700">
              <Trophy size={24} />
              <h2 className="text-2xl font-bold">Jumping-Specific Details</h2>
            </div>
            <p className="text-gray-600">Tell us about your jumping competition focus and goals.</p>
            
            <FormField
              control={form.control}
              name="competitionFocus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Competition Focus*</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      {[
                        "Clear rounds",
                        "Speed classes",
                        "Derby/specialty classes",
                        "Equitation",
                        "Hunter",
                        "Eventing show jumping"
                      ].map(focus => (
                        <FormItem key={focus} className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={focus} />
                          </FormControl>
                          <FormLabel className="font-normal">{focus}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="faultPatterns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typical Fault Patterns</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      "Rails (front legs)",
                      "Rails (hind legs)",
                      "Refusals",
                      "Time penalties",
                      "Run-outs",
                      "Rider accuracy issues"
                    ].map(fault => (
                      <FormItem key={fault} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(fault)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              return checked
                                ? field.onChange([...currentValue, fault])
                                : field.onChange(currentValue.filter(v => v !== fault));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">{fault}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormDescription>Select all that apply (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="competitionGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competition Goals*</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      "Moving up to next height",
                      "Qualifying for specific championship",
                      "Improving clear round percentage",
                      "Reducing time penalties",
                      "Gaining experience at current level"
                    ].map(goal => (
                      <FormItem key={goal} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(goal)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              return checked
                                ? field.onChange([...currentValue, goal])
                                : field.onChange(currentValue.filter(v => v !== goal));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">{goal}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormDescription>Select at least one goal</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="coursesPerMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Typical courses completed per month*</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="competitionsPerMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Typical competitions per month*</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="importRecord"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Would you like to import your competition record?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="now" />
                        </FormControl>
                        <FormLabel className="font-normal">Yes, I'll upload it now</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="later" />
                        </FormControl>
                        <FormLabel className="font-normal">Yes, but I'll do it later</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.watch("importRecord") === "now" && (
              <div className="p-4 border rounded-md bg-blue-50/30 border-blue-100">
                <p className="text-sm text-blue-700 mb-2">Import functionality will be available soon. Please select "Yes, but I'll do it later" for now.</p>
              </div>
            )}
          </div>
        );
        
      case 3: // Technical Focus Areas
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-blue-700">
              <Target size={24} />
              <h2 className="text-2xl font-bold">Technical Focus Areas</h2>
            </div>
            <p className="text-gray-600">Identify specific areas where you'd like the AI to focus its analysis.</p>
            
            <FormField
              control={form.control}
              name="approachIssues"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approach Issues</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      "Consistent striding",
                      "Speed control",
                      "Straightness",
                      "Finding distance"
                    ].map(issue => (
                      <FormItem key={issue} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(issue)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              return checked
                                ? field.onChange([...currentValue, issue])
                                : field.onChange(currentValue.filter(v => v !== issue));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">{issue}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormDescription>Select all that apply (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="jumpExecutionIssues"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jump Execution Issues</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      "Take-off distance",
                      "Bascule form",
                      "Front leg clearance",
                      "Hind leg clearance"
                    ].map(issue => (
                      <FormItem key={issue} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(issue)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              return checked
                                ? field.onChange([...currentValue, issue])
                                : field.onChange(currentValue.filter(v => v !== issue));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">{issue}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormDescription>Select all that apply (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="courseNavigationIssues"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Navigation Issues</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      "Turn efficiency",
                      "Rhythm between fences",
                      "Related distances",
                      "Combination issues",
                      "Course memorization"
                    ].map(issue => (
                      <FormItem key={issue} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(issue)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              return checked
                                ? field.onChange([...currentValue, issue])
                                : field.onChange(currentValue.filter(v => v !== issue));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">{issue}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormDescription>Select all that apply (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="riderPositionIssues"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rider Position Issues</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      "Balance over jumps",
                      "Release timing",
                      "Leg position",
                      "Eye focus",
                      "Recovery after jumps"
                    ].map(issue => (
                      <FormItem key={issue} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(issue)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              return checked
                                ? field.onChange([...currentValue, issue])
                                : field.onChange(currentValue.filter(v => v !== issue));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">{issue}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormDescription>Select all that apply (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 4: // Preferences & Settings
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-blue-700">
              <Clock size={24} />
              <h2 className="text-2xl font-bold">Preferences & Settings</h2>
            </div>
            <p className="text-gray-600">Customize your AI Jump experience and set your preferences.</p>
            
            <FormField
              control={form.control}
              name="priorityMetrics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Performance Metrics to Prioritize</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      "Clear round percentage",
                      "Time efficiency",
                      "Jump technique scores",
                      "Approach consistency",
                      "Turn efficiency",
                      "Competition vs. training comparison"
                    ].map(metric => (
                      <FormItem key={metric} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(metric)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              if (checked && currentValue.length >= 3) {
                                // If already 3 selected, replace the first one
                                field.onChange([...currentValue.slice(1), metric]);
                              } else {
                                return checked
                                  ? field.onChange([...currentValue, metric])
                                  : field.onChange(currentValue.filter(v => v !== metric));
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">{metric}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormDescription>Select up to 3 metrics</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notification Preferences</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      "Analysis complete",
                      "Competition reminders",
                      "Training recommendations",
                      "Goal progress updates"
                    ].map(notification => (
                      <FormItem key={notification} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(notification)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              return checked
                                ? field.onChange([...currentValue, notification])
                                : field.onChange(currentValue.filter(v => v !== notification));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">{notification}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="connectWithCoach"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Would you like to connect with your coach on the platform?</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            {form.watch("connectWithCoach") && (
              <FormField
                control={form.control}
                name="coachEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coach's email for invitation</FormLabel>
                    <FormControl>
                      <Input placeholder="coach@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="connectCalendar"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Connect competition calendar?</FormLabel>
                    <FormDescription>
                      Link your competition schedule to receive personalized preparation plans.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="pt-4">
              <h3 className="text-lg font-medium text-blue-700 mb-4">Dashboard Preview</h3>
              <div className="rounded-lg border border-blue-100 p-4 bg-blue-50/30">
                <p className="text-sm text-center text-blue-700 mb-4">
                  Here's a preview of what your AI Jump dashboard will look like:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-3 shadow-sm">
                    <h4 className="text-sm font-medium text-blue-700 mb-2">Performance Overview</h4>
                    <div className="h-24 bg-white rounded border flex items-center justify-center text-xs text-gray-500">
                      Performance metrics visualization
                    </div>
                  </Card>
                  <Card className="p-3 shadow-sm">
                    <h4 className="text-sm font-medium text-blue-700 mb-2">Recent Rounds</h4>
                    <div className="h-24 bg-white rounded border flex items-center justify-center text-xs text-gray-500">
                      Recent analyzed jumping rounds
                    </div>
                  </Card>
                  <Card className="p-3 shadow-sm">
                    <h4 className="text-sm font-medium text-blue-700 mb-2">Focus Areas</h4>
                    <div className="h-24 bg-white rounded border flex items-center justify-center text-xs text-gray-500">
                      Personalized training focus areas
                    </div>
                  </Card>
                  <Card className="p-3 shadow-sm">
                    <h4 className="text-sm font-medium text-blue-700 mb-2">Upcoming Competitions</h4>
                    <div className="h-24 bg-white rounded border flex items-center justify-center text-xs text-gray-500">
                      Your upcoming competition schedule
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800">Complete Your AI Jump Profile</h1>
        <p className="text-gray-600 mt-2">
          Help us customize your jumping analysis experience by sharing some information about you and your equine partner.
        </p>
      </div>
      
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-blue-700">{steps[currentStep]}</span>
          <span className="text-sm font-medium text-blue-700">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-700 h-2.5 rounded-full" 
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between mt-2">
          <div className="hidden md:flex space-x-2">
            {steps.map((step, idx) => (
              <div 
                key={idx}
                className={`text-xs px-3 py-1 rounded-full ${
                  idx === currentStep 
                    ? 'bg-blue-100 text-blue-800 font-medium' 
                    : idx < currentStep
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {renderFormStep()}
            
            <Separator className="my-6" />
            
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="border-blue-200 text-blue-700"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-700 hover:bg-blue-800"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-700 hover:bg-blue-800"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Profile
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
      <Toaster />
    </div>
  );
};

export default JumpProfileSetup;
