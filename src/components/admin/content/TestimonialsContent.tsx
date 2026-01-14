
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Star, 
  Image as ImageIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  image: string;
  rating: number;
  discipline: 'dressage' | 'jumping';
}

const TestimonialsContent = () => {
  const { toast } = useToast();
  
  // Sample data for testimonials
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Amateur Dressage Rider",
      content: "AI Dressage has transformed my training approach. The detailed feedback on my tests helped me improve my scores by nearly 10% in just three months!",
      image: "/placeholder.svg",
      rating: 5,
      discipline: 'dressage'
    },
    {
      id: 2,
      name: "Michael Torres",
      role: "Show Jumping Coach",
      content: "As a coach, I use AI Jumping to analyze my students' rounds. The insights on takeoff distances and bascule have been incredibly valuable for improving their performance.",
      image: "/placeholder.svg",
      rating: 4,
      discipline: 'jumping'
    },
    {
      id: 3,
      name: "Emma Williams",
      role: "Professional Dressage Rider",
      content: "The ability to get detailed analytics on my horses' performances has been game-changing. I can now identify subtle issues in our movements that weren't visible to the naked eye.",
      image: "/placeholder.svg",
      rating: 5,
      discipline: 'dressage'
    }
  ]);
  
  const [currentTestimonial, setCurrentTestimonial] = useState<Testimonial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDiscipline, setCurrentDiscipline] = useState<string>('all');

  const filteredTestimonials = currentDiscipline === 'all' 
    ? testimonials 
    : testimonials.filter(testimonial => testimonial.discipline === currentDiscipline);

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setCurrentTestimonial(testimonial);
    setIsDialogOpen(true);
  };

  const handleAddTestimonial = () => {
    setCurrentTestimonial({
      id: Math.max(0, ...testimonials.map(t => t.id)) + 1,
      name: "",
      role: "",
      content: "",
      image: "/placeholder.svg",
      rating: 5,
      discipline: 'dressage'
    });
    setIsDialogOpen(true);
  };

  const handleDeleteTestimonial = (id: number) => {
    setTestimonials(testimonials.filter(t => t.id !== id));
    toast({
      title: "Testimonial Deleted",
      description: "The testimonial has been successfully deleted.",
    });
  };

  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTestimonial) return;
    
    if (testimonials.some(t => t.id === currentTestimonial.id)) {
      // Update existing testimonial
      setTestimonials(testimonials.map(t => 
        t.id === currentTestimonial.id ? currentTestimonial : t
      ));
      toast({
        title: "Testimonial Updated",
        description: "The testimonial has been successfully updated.",
      });
    } else {
      // Add new testimonial
      setTestimonials([...testimonials, currentTestimonial]);
      toast({
        title: "Testimonial Added",
        description: "The new testimonial has been successfully added.",
      });
    }
    
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Testimonials</h2>
          <p className="text-gray-500 text-sm">Manage customer testimonials and success stories</p>
        </div>
        <div className="flex gap-3">
          <Select 
            value={currentDiscipline} 
            onValueChange={setCurrentDiscipline}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by discipline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Disciplines</SelectItem>
              <SelectItem value="dressage">Dressage</SelectItem>
              <SelectItem value="jumping">Jumping</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddTestimonial}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Testimonial
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTestimonials.length === 0 ? (
          <div className="col-span-full p-6 text-center text-gray-500 bg-gray-50 rounded-md">
            No testimonials found for the selected discipline.
          </div>
        ) : (
          filteredTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className="overflow-hidden">
              <div className="relative">
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditTestimonial(testimonial)}
                    className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteTestimonial(testimonial.id)}
                    className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
                
                <div className="h-40 overflow-hidden bg-gray-100">
                  {testimonial.image ? (
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="mb-1">{testimonial.name}</CardTitle>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                  <div className="flex">
                    {Array(5).fill(0).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 text-sm">{testimonial.content}</p>
                <div className="mt-3">
                  <span className={`
                    text-xs px-2 py-1 rounded-full
                    ${testimonial.discipline === 'dressage' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                    }
                  `}>
                    {testimonial.discipline.charAt(0).toUpperCase() + testimonial.discipline.slice(1)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {currentTestimonial?.id && testimonials.some(t => t.id === currentTestimonial.id) 
                ? 'Edit Testimonial' 
                : 'Add New Testimonial'
              }
            </DialogTitle>
            <DialogDescription>
              {currentTestimonial?.id && testimonials.some(t => t.id === currentTestimonial.id)
                ? 'Make changes to the testimonial here.' 
                : 'Fill in the details to add a new testimonial.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSaveTestimonial} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                  value={currentTestimonial?.name || ''} 
                  onChange={(e) => setCurrentTestimonial(prev => prev ? {...prev, name: e.target.value} : null)}
                  placeholder="Client name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Input 
                  value={currentTestimonial?.role || ''} 
                  onChange={(e) => setCurrentTestimonial(prev => prev ? {...prev, role: e.target.value} : null)}
                  placeholder="Client role"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Testimonial</label>
              <Textarea 
                value={currentTestimonial?.content || ''} 
                onChange={(e) => setCurrentTestimonial(prev => prev ? {...prev, content: e.target.value} : null)}
                placeholder="Client testimonial"
                className="min-h-[100px]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input 
                value={currentTestimonial?.image || ''} 
                onChange={(e) => setCurrentTestimonial(prev => prev ? {...prev, image: e.target.value} : null)}
                placeholder="Image URL"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <Select 
                  value={currentTestimonial?.rating.toString() || '5'}
                  onValueChange={(value) => 
                    setCurrentTestimonial(prev => prev ? {...prev, rating: parseInt(value)} : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Discipline</label>
                <Select 
                  value={currentTestimonial?.discipline || 'dressage'}
                  onValueChange={(value: 'dressage' | 'jumping') => 
                    setCurrentTestimonial(prev => prev ? {...prev, discipline: value} : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dressage">Dressage</SelectItem>
                    <SelectItem value="jumping">Jumping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestimonialsContent;
