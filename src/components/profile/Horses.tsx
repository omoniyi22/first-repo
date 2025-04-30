
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ChevronRight } from 'lucide-react';
import { horseBreeds, dressageLevels } from '@/lib/formOptions';
import HorseForm from './HorseForm';

const Horses = () => {
  const [showAddHorseForm, setShowAddHorseForm] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState<string | null>(null);
  
  // Example horses - in a real app, these would come from your backend
  const horses = [
    {
      id: 1,
      name: 'Maestro',
      breed: 'Hanoverian',
      sex: 'Gelding',
      age: 12,
      competitionLevel: 'Fourth Level',
      lastTestDate: '2023-05-15',
      photo: '/lovable-uploads/141a866f-fe45-4edc-aa64-b95d2c7f1d6c.png',
    },
    {
      id: 2,
      name: 'Bella',
      breed: 'Dutch Warmblood',
      sex: 'Mare',
      age: 9,
      competitionLevel: 'Second Level',
      lastTestDate: '2023-06-02',
      photo: '/lovable-uploads/15df63d0-27e1-486c-98ee-bcf44eb600f4.png',
    },
    {
      id: 3,
      name: 'Gatsby',
      breed: 'Oldenburg',
      sex: 'Gelding',
      age: 7,
      competitionLevel: 'First Level',
      lastTestDate: '2023-04-28',
      photo: '/lovable-uploads/79f64a37-cb8e-4627-b743-c5330837a1b0.png',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif font-semibold text-gray-900">My Horses</h2>
        <Button onClick={() => setShowAddHorseForm(true)} className="flex items-center gap-2">
          <Plus size={16} />
          <span>Add Horse</span>
        </Button>
      </div>
      
      {/* Horses grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {horses.map((horse) => (
          <Dialog key={horse.id}>
            <DialogTrigger asChild>
              <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                <div className="h-40 overflow-hidden">
                  <img 
                    src={horse.photo} 
                    alt={horse.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg text-gray-900">{horse.name}</h3>
                      <p className="text-sm text-gray-600">{horse.breed} • {horse.age} yrs</p>
                      <p className="text-sm text-gray-600 mt-1">{horse.competitionLevel}</p>
                    </div>
                    <ChevronRight className="text-gray-400" size={18} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Last test: {new Date(horse.lastTestDate).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-serif">Horse Profile: {horse.name}</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="info" className="mt-4">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="competition">Competition</TabsTrigger>
                  <TabsTrigger value="training">Training</TabsTrigger>
                  <TabsTrigger value="health">Health</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <img 
                        src={horse.photo} 
                        alt={horse.name} 
                        className="w-full rounded-lg"
                      />
                    </div>
                    <div className="md:w-2/3">
                      <h3 className="font-semibold text-lg">Details</h3>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">
                        <div>
                          <p className="text-sm text-gray-600">Breed</p>
                          <p className="font-medium">{horse.breed}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Age</p>
                          <p className="font-medium">{horse.age} years</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Sex</p>
                          <p className="font-medium">{horse.sex}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Competition Level</p>
                          <p className="font-medium">{horse.competitionLevel}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="competition">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Competition History</h3>
                    <div className="space-y-2">
                      {/* This would be filled with competition history data */}
                      <p className="text-sm text-gray-600 italic">No competition history available yet.</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="training">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Training Notes</h3>
                    <div className="space-y-2">
                      {/* This would be filled with training notes */}
                      <p className="text-sm text-gray-600 italic">No training notes available yet.</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="health">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Health Records</h3>
                    <div className="space-y-2">
                      {/* This would be filled with health records */}
                      <p className="text-sm text-gray-600 italic">No health records available yet.</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        ))}
      </div>
      
      {/* Add Horse Dialog */}
      <Dialog open={showAddHorseForm} onOpenChange={setShowAddHorseForm}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Add a New Horse</DialogTitle>
          </DialogHeader>
          <HorseForm onComplete={() => setShowAddHorseForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Horses;
