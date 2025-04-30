
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GoalsForm from './GoalsForm';

const Goals = () => {
  const [showEditGoalsForm, setShowEditGoalsForm] = useState(false);

  // Example goals - in a real app, these would come from your backend
  const goals = {
    shortTerm: [
      { id: 1, text: 'Improve half-pass accuracy', progress: 65, targetDate: '2023-08-15' },
      { id: 2, text: 'Score 67%+ at next show', progress: 40, targetDate: '2023-07-22' },
    ],
    mediumTerm: [
      { id: 3, text: 'Move up to Third Level', progress: 30, targetDate: '2023-12-10' },
      { id: 4, text: 'Master flying changes', progress: 50, targetDate: '2023-10-05' },
    ],
    longTerm: [
      { id: 5, text: 'Qualify for Regional Championships', progress: 25, targetDate: '2024-05-20' },
    ],
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif font-semibold text-gray-900">
          Goals
        </h2>
        <Button size="sm" variant="outline" onClick={() => setShowEditGoalsForm(true)}>
          <Edit size={16} className="mr-1" />
          Edit
        </Button>
      </div>
      
      <Card className="border border-gray-100 p-4">
        <div className="space-y-6">
          {/* Short-term goals */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Short-term (3 months)</h3>
            <div className="space-y-3">
              {goals.shortTerm.map((goal) => (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">{goal.text}</span>
                    <span className="text-xs text-gray-600">{goal.progress}%</span>
                  </div>
                  <div className="flex space-x-2 items-center">
                    <Progress value={goal.progress} className="h-2" />
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      By {new Date(goal.targetDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Medium-term goals */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Medium-term (6 months)</h3>
            <div className="space-y-3">
              {goals.mediumTerm.map((goal) => (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">{goal.text}</span>
                    <span className="text-xs text-gray-600">{goal.progress}%</span>
                  </div>
                  <div className="flex space-x-2 items-center">
                    <Progress value={goal.progress} className="h-2" />
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      By {new Date(goal.targetDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Long-term goals */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Long-term (1+ year)</h3>
            <div className="space-y-3">
              {goals.longTerm.map((goal) => (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">{goal.text}</span>
                    <span className="text-xs text-gray-600">{goal.progress}%</span>
                  </div>
                  <div className="flex space-x-2 items-center">
                    <Progress value={goal.progress} className="h-2" />
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      By {new Date(goal.targetDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Edit Goals Dialog */}
      <Dialog open={showEditGoalsForm} onOpenChange={setShowEditGoalsForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Edit Goals</DialogTitle>
          </DialogHeader>
          <GoalsForm onComplete={() => setShowEditGoalsForm(false)} initialGoals={goals} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;
