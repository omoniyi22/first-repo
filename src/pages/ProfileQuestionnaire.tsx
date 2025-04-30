
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronLeft, ChevronRight, Check, Upload, Camera } from 'lucide-react';
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
import { dressageLevels, regions, horseBreeds } from '@/lib/formOptions';

// Define steps for the questionnaire
const steps = [
  "Rider Details",
  "Horse Information",
  "Competition Goals",
  "Training Focus",
  "Performance History",
  "Profile Customization"
];

// Schema for form validation
const formSchema = z.object({
  // Rider Details
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  profilePicture: z.any().optional(),
  riderCategory: z.enum(["Junior Rider", "Young Rider", "Adult Amateur", "Professional"]),
  competitionLevel: z.string(),
  region: z.string(),
  stableAffiliation: z.string().optional(),
  coachName: z.string().optional(),
  
  // Horse Information
  hasHorse: z.boolean(),
  horses: z.array(
    z.object({
      name: z.string().min(1, { message: "Horse name is required." }),
      breed: z.string(),
      age: z.number().min(1).max(40),
      sex: z.enum(["Gelding", "Mare", "Stallion"]),
      level: z.string(),
      yearsCompeting: z.number().min(0),
      photo: z.any().optional()
    })
  ).optional(),
  
  // Competition Goals
  shortTermGoals: z.string().optional(),
  mediumTermGoals: z.string().optional(),
  longTermGoals: z.string().optional(),
  specificCompetitions: z.string().optional(),
  
  // Training Focus
  movementsToImprove: z.array(z.string()).optional(),
  trainingSchedule: z.string().optional(),
  challenges: z.string().optional(),
  
  // Performance History
  bestScore: z.number().min(0).max(100).optional(),
  testsRidden: z.number().min(0).optional(),
  importResults: z.enum(["now", "later", "no"]).optional(),
  
  // Profile Customization
  importantStatistics: z.array(z.string()).optional(),
  wantRecommendations: z.boolean().optional(),
  emailReminders: z.array(z.string()).optional(),
  notifications: z.array(z.string()).optional(),
  connectWithCoach: z.boolean().optional(),
  coachEmail: z.string().email().optional()
});

type FormValues = z.infer<typeof formSchema>;

const ProfileQuestionnaire = () => {
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
      competitionLevel: "Training",
      region: "North America",
      hasHorse: false,
      horses: [],
      wantRecommendations: true,
      importantStatistics: [],
      emailReminders: [],
      notifications: [],
      connectWithCoach: false
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
        short_term_goals: data.shortTermGoals || null,
        medium_term_goals: data.mediumTermGoals || null,
        long_term_goals: data.longTermGoals || null,
        specific_competitions: data.specificCompetitions || null,
        training_schedule: data.trainingSchedule || null,
        challenges: data.challenges || null,
        best_score: data.bestScore || null,
        tests_ridden: data.testsRidden || null,
        import_results: data.importResults || null,
        want_recommendations: data.wantRecommendations || false,
        important_statistics: data.importantStatistics || [],
        email_reminders: data.emailReminders || [],
        notifications: data.notifications || [],
        connect_with_coach: data.connectWithCoach || false,
        coach_email: data.coachEmail || null,
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
          competition_level: horse.level,
          years_competing: horse.yearsCompeting,
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
      
      // Save training focus if any
      if (data.movementsToImprove && data.movementsToImprove.length > 0) {
        const trainingFocusData = {
          user_id: user.id,
          movements_to_improve: data.movementsToImprove,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error: trainingFocusError } = await supabase
          .from('training_focus')
          .upsert(trainingFocusData);
        
        if (trainingFocusError) {
          throw trainingFocusError;
        }
      }
      
      toast({
        title: "Profile saved",
        description: "Your profile has been saved successfully."
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Error saving profile:', error);
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
        age: 7,
        sex: "Gelding",
        level: "Training",
        yearsCompeting: 1,
        photo: null
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
  
  // Create form steps
  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Rider Details</h2>
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
                        {dressageLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
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
                    <FormLabel>Stable/Barn Affiliation</FormLabel>
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
                    <FormLabel>Coach/Trainer Name</FormLabel>
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
        
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Horse Information</h2>
            
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
                  <div key={index} className="rounded-lg border p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Horse #{index + 1}</h3>
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
                        name={`horses.${index}.level`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Competition Level*</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {dressageLevels.map((level) => (
                                  <SelectItem key={level} value={level}>
                                    {level}
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
                  className="mt-4 w-full"
                >
                  Add Another Horse
                </Button>
              </div>
            )}
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Competition Goals</h2>
            <p className="text-gray-600">Share your competitive goals so we can help track your progress.</p>
            
            <FormField
              control={form.control}
              name="shortTermGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What are your short-term competition goals? (Next 3 months)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your short-term goals..." 
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mediumTermGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What are your medium-term goals? (6 months)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your medium-term goals..." 
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="longTermGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What are your long-term goals? (1+ year)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your long-term goals..." 
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="specificCompetitions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What specific qualifications or competitions are you aiming for?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List specific competitions..." 
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Training Focus</h2>
            <p className="text-gray-600">Tell us about your current training priorities and challenges.</p>
            
            <FormField
              control={form.control}
              name="movementsToImprove"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What specific movements are you currently working to improve?</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      "Halt", "Walk", "Working Trot", "Medium Trot", "Extended Trot",
                      "Working Canter", "Medium Canter", "Extended Canter", "Free Walk",
                      "Leg Yield", "Shoulder-in", "Haunches-in", "Half-pass",
                      "Turn on the haunches", "Pirouette", "Flying Change", "Tempi Changes",
                      "Passage", "Piaffe", "Collected gaits"
                    ].map(movement => (
                      <FormItem key={movement} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(movement)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              return checked
                                ? field.onChange([...currentValue, movement])
                                : field.onChange(currentValue.filter(v => v !== movement));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">{movement}</FormLabel>
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
              name="trainingSchedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your typical weekly training schedule?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your training routine..." 
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="challenges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Are there specific challenges you're working through?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe any challenges or issues..." 
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Performance History</h2>
            <p className="text-gray-600">Tell us about your competition experience.</p>
            
            <FormField
              control={form.control}
              name="bestScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your personal best score at your current level?</FormLabel>
                  <div className="flex items-center">
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="68.5"
                        className="w-24"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <span className="ml-2">%</span>
                  </div>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="testsRidden"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How many tests have you ridden in the past 12 months?</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="0"
                      className="w-24"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="importResults"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Would you like to import previous test results?</FormLabel>
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
                        <FormLabel className="font-normal">Yes, I'll upload them now</FormLabel>
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
            
            {form.watch("importResults") === "now" && (
              <div className="p-4 border rounded-md bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Import functionality will be available soon. Please select "Yes, but I'll do it later" for now.</p>
              </div>
            )}
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Profile Customization</h2>
            <p className="text-gray-600">Customize your experience by setting your preferences.</p>
            
            <FormField
              control={form.control}
              name="importantStatistics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Which statistics are most important to you?</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      "Average Score", "Score Trends", "Movement Breakdown", "Judge Comparison", "Competition Results"
                    ].map(stat => (
                      <FormItem key={stat} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(stat)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              return checked
                                ? field.onChange([...currentValue, stat])
                                : field.onChange(currentValue.filter(v => v !== stat));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">{stat}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormDescription>Select all that apply</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="wantRecommendations"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Would you like to receive training recommendations based on your test scores?</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="emailReminders"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Would you like to set up email reminders for:</FormLabel>
                  <div className="space-y-2 mt-2">
                    {[
                      "Upcoming competitions", "Training milestones", "Goal deadlines", "New recommendations available"
                    ].map(reminder => (
                      <FormItem key={reminder} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(reminder)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              return checked
                                ? field.onChange([...currentValue, reminder])
                                : field.onChange(currentValue.filter(v => v !== reminder));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">{reminder}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Which notifications would you like to receive?</FormLabel>
                  <div className="space-y-2 mt-2">
                    {[
                      "New analysis completed", "Competition reminders", "Training suggestions", 
                      "Progress towards goals", "Coach feedback"
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
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900">Complete Your Profile</h1>
        <p className="text-gray-600 mt-2">
          Help us customize your experience by sharing some information about you and your dressage journey.
        </p>
      </div>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex-1 ${
                index < steps.length - 1 ? "relative" : ""
              }`}
            >
              <div 
                className={`flex flex-col items-center ${
                  index <= currentStep ? "text-navy-700" : "text-gray-400"
                }`}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    index < currentStep 
                      ? "bg-navy-500 border-navy-500 text-white" 
                      : index === currentStep
                      ? "border-navy-500 text-navy-500"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="mt-2 text-xs text-center hidden md:block">{step}</span>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`absolute top-5 left-0 right-0 h-0.5 mx-10 ${
                    index < currentStep ? "bg-navy-500" : "bg-gray-300"
                  }`}
                  style={{ width: "calc(100% - 5rem)", left: "2.5rem" }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {renderFormStep()}
            
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

export default ProfileQuestionnaire;
