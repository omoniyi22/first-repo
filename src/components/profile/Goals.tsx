
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GoalsForm from './GoalsForm';
import { useLanguage } from '@/contexts/LanguageContext';

const Goals = () => {
  const [showEditGoalsForm, setShowEditGoalsForm] = useState(false);
  const { language, translations } = useLanguage();
  const t = translations[language];

  // Example goals - in a real app, these would come from your backend
  const goals = {
    shortTerm: [
      { id: 1, text: language === 'en' ? 'Improve half-pass accuracy' : 'Mejorar la precisión del paso lateral', progress: 65, targetDate: '2023-08-15' },
      { id: 2, text: language === 'en' ? 'Score 67%+ at next show' : 'Puntuación 67%+ en el próximo concurso', progress: 40, targetDate: '2023-07-22' },
    ],
    mediumTerm: [
      { id: 3, text: language === 'en' ? 'Move up to Third Level' : 'Ascender al Tercer Nivel', progress: 30, targetDate: '2023-12-10' },
      { id: 4, text: language === 'en' ? 'Master flying changes' : 'Dominar cambios al aire', progress: 50, targetDate: '2023-10-05' },
    ],
    longTerm: [
      { id: 5, text: language === 'en' ? 'Qualify for Regional Championships' : 'Clasificar para los Campeonatos Regionales', progress: 25, targetDate: '2024-05-20' },
    ],
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif font-semibold text-gray-900">
          {t["goals"]}
        </h2>
        <Button size="sm" variant="outline" onClick={() => setShowEditGoalsForm(true)}>
          <Edit size={16} className="mr-1" />
          {t["edit"]}
        </Button>
      </div>
      
      <Card className="border border-gray-100 p-4">
        <div className="space-y-6">
          {/* Short-term goals */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">{t["short-term"]}</h3>
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
                      {t["by"]} {new Date(goal.targetDate).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Medium-term goals */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">{t["medium-term"]}</h3>
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
                      {t["by"]} {new Date(goal.targetDate).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Long-term goals */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">{t["long-term"]}</h3>
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
                      {t["by"]} {new Date(goal.targetDate).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES')}
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
            <DialogTitle className="text-xl font-serif">{language === 'en' ? 'Edit Goals' : 'Editar Objetivos'}</DialogTitle>
          </DialogHeader>
          <GoalsForm onComplete={() => setShowEditGoalsForm(false)} initialGoals={goals} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;
