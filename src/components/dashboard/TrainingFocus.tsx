import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import TrainingFocusForm from "./TrainingFocusForm";
import { useLanguage } from "@/contexts/LanguageContext";

const TrainingFocus = () => {
  const [showEditFocusForm, setShowEditFocusForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trainingFocus, setTrainingFocus] = useState([]);
  const { language } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDressageData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("document_analysis")
          .select(
            `
            *,
            analysis_results(*)
          `
          )
          .eq("user_id", user.id)
          .eq("discipline", "dressage")
          .order("created_at", { ascending: false });

        if (error) throw error;

        processRecommendationData(data);
      } catch (error) {
        console.error("Error fetching dressage data:", error);
        setLoading(false);
      }
    };

    const processRecommendationData = (data) => {
      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      // Extract dressage recommendations from the data
      const dressageRecommendations = [];

      data.forEach((doc) => {
        if (doc.analysis_results && doc.analysis_results.length > 0) {
          doc.analysis_results.forEach((result) => {
            if (result.result_json && result.result_json.en) {
              const analysis = result.result_json.en;

              // Get recommendations
              if (
                analysis.recommendations &&
                analysis.recommendations.length > 0
              ) {
                analysis.recommendations.forEach((rec) => {
                  dressageRecommendations.push({
                    reason: rec.reason,
                    tip: rec.tip,
                    priority: "medium", // Default priority
                  });
                });
              }

              // Get focus areas
              if (analysis.focusArea && analysis.focusArea.length > 0) {
                analysis.focusArea.forEach((focus) => {
                  dressageRecommendations.push({
                    reason: `Focus on ${focus.area}`,
                    tip:
                      focus.tip.Exercise ||
                      focus.tip.quickFix ||
                      "Practice specific exercises",
                    priority: "high", // Focus areas are high priority
                  });
                });
              }

              // Add weaknesses as training focus
              if (analysis.weaknesses && analysis.weaknesses.length > 0) {
                analysis.weaknesses.forEach((weakness) => {
                  dressageRecommendations.push({
                    reason: `Address: ${weakness}`,
                    tip: "Work on consistency and relaxation exercises",
                    priority: "high",
                  });
                });
              }
            }
          });
        }
      });

      // Remove duplicates based on similar reasons
      const uniqueRecommendations = dressageRecommendations.filter(
        (rec, index, self) =>
          index ===
          self.findIndex(
            (r) =>
              r.reason
                ?.toLowerCase()
                .includes(rec.reason?.toLowerCase().split(":")[0]) ||
              rec.reason
                ?.toLowerCase()
                .includes(r.reason?.toLowerCase().split(":")[0])
          )
      );

      setTrainingFocus(uniqueRecommendations);
      setLoading(false);
    };

    fetchDressageData();
  }, [user.id]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      default:
        return "Low";
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif font-semibold text-gray-900">
            {language === "en" ? "Training Focus" : "Enfoque de la formación"}
          </h2>
        </div>
        <Card className="border border-gray-100 p-4">
          <div className="text-center py-8 text-gray-500">
            {language === "en"
              ? "Loading training recommendations..."
              : "Cargando recomendaciones de entrenamiento..."}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif font-semibold text-gray-900">
          {language === "en" ? "Training Focus" : "Enfoque de la formación"}
        </h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowEditFocusForm(true)}
        >
          {language === "en" ? "Edit" : "Editar"}
        </Button>
      </div>

      <Card className="border border-gray-100 p-4">
        <div className="space-y-4">
          {trainingFocus.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>
                {language === "en"
                  ? "No training recommendations available."
                  : "No hay recomendaciones de formación disponibles."}
              </p>
              <p className="text-sm">
                {language === "en"
                  ? "Upload a dressage test to get personalized training focus."
                  : "Sube una prueba de doma para obtener un enfoque de entrenamiento personalizado."}
              </p>
            </div>
          ) : (
            trainingFocus.slice(0, 3).map((focus, index) => (
              <div
                key={index}
                className="flex items-start pb-3 border-b border-gray-100 last:border-none last:pb-0"
              >
                <div className="bg-blue-100 text-blue-700 p-1.5 rounded mr-3 flex-shrink-0">
                  <Activity size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {focus.reason}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">
                          <span className="font-semibold">
                            {language === "en" ? "Exercise:" : "Ejercicio:"}
                          </span>
                        </span>{" "}
                        {focus.tip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Edit Training Focus Dialog */}
      <Dialog open={showEditFocusForm} onOpenChange={setShowEditFocusForm}>
        <DialogContent className="sm:max-w-md max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {language === "en"
                ? "Edit Training Focus"
                : "Editar el enfoque del entrenamiento"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] pr-4">
            <div className="py-2">
              <TrainingFocusForm
                onComplete={() => setShowEditFocusForm(false)}
                initialFocus={trainingFocus}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingFocus;
