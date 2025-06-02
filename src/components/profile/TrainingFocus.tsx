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
import TrainingFocusForm from "./TrainingFocusForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TrainingFocus = () => {
  const [showEditFocusForm, setShowEditFocusForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trainingFocus, setTrainingFocus] = useState([]);
  const [userDiscipline, setUserDiscipline] = useState<string>("");
  console.log("🚀 ~ TrainingFocus ~ userDiscipline:", userDiscipline);

  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch user profile to get discipline
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("discipline")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
        } else if (profileData?.discipline) {
          setUserDiscipline(profileData.discipline);
        }
      } catch (error) {
        console.error("Error fetching horses:", error);
      } finally {
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchJumpingData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("document_analysis")
          .select(
            `
            *,
            analysis_results(*)
          `
          )
          .eq("user_id", user.id)
          .eq("discipline", "jumping")
          .order("created_at", { ascending: false });

        if (error) throw error;

        processRecommendationData(data);
      } catch (error) {
        console.error("Error fetching jumping data:", error);
        setLoading(false);
      }
    };
    userDiscipline && fetchJumpingData();

    const processRecommendationData = (data) => {
      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      // Extract jumping analyses from the data
      const jumpingAnalyses = [];

      if (userDiscipline == "dressage") {
        data.forEach((doc) => {
          if (doc.analysis_results && doc.analysis_results.length > 0) {
            doc.analysis_results.forEach((result) => {
              if (
                result.result_json &&
                result.result_json.en &&
                result.result_json.en.round_summary
              ) {
                const recommendations = result.result_json.en.recommendations;
                recommendations.forEach((rec) =>
                  jumpingAnalyses.push({ reason: rec.reason, tip: rec.tip })
                );
              }
            });
          }
        });
      } else {
        data.forEach((doc) => {
          if (doc.analysis_results && doc.analysis_results.length > 0) {
            doc.analysis_results.forEach((result) => {
              if (
                result.result_json &&
                result.result_json.en &&
                result.result_json.en.round_summary
              ) {
                const recommendations = result.result_json.en.recommendations;
                console.log(
                  "🚀 ~ doc.analysis_results.forEach ~ recommendations:",
                  recommendations
                );

                recommendations.forEach((rec) =>
                  jumpingAnalyses.push({ reason: rec.reason, tip: rec.tip })
                );
              }
            });
          }
        });
      }

      setTrainingFocus(jumpingAnalyses);
    };
  }, [userDiscipline]);

  // Example training focuses - in a real app, these would come from your backend
  // const trainingFocus = [
  //   {
  //     id: 1,
  //     movement: "Canter Transitions",
  //     description: "Work on smoothness in and out of canter",
  //     priority: "high",
  //   },
  //   {
  //     id: 2,
  //     movement: "Half Pass",
  //     description: "Improve bend and crossing of legs",
  //     priority: "medium",
  //   },
  //   {
  //     id: 3,
  //     movement: "Extended Trot",
  //     description: "Develop more suspension and ground cover",
  //     priority: "medium",
  //   },
  // ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif font-semibold text-gray-900">
          Training Focus
        </h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowEditFocusForm(true)}
        >
          Edit
        </Button>
      </div>

      <Card className="border border-gray-100 p-4">
        <div className="space-y-4">
          {trainingFocus.slice(0, 5).map((focus, index) => (
            <div
              key={index}
              className="flex items-start pb-3 border-b border-gray-100 last:border-none last:pb-0"
            >
              <div className="bg-blue-100 text-blue-700 p-1.5 rounded mr-3">
                <Activity size={18} />
              </div>
              <div className="flex-1">
                {/* <div className="flex items-center justify-between"> */}
                {/* <h3 className="font-medium text-gray-900">
                    {focus.movement}
                  </h3> */}
                {/* <Badge className={getPriorityColor(focus.priority)}>
                    {focus.priority}
                  </Badge> */}
                {/* </div> */}
                <p className="text-sm text-gray-600 mt-1">{focus.reason}</p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold ">Exercise - </span>{" "}
                  {focus.tip}
                </p>
                {/* <Button variant="link" className="text-blue-700 p-0 h-auto mt-1 text-sm font-normal">
                  <span>View exercises</span>
                  <ChevronRight size={14} className="ml-1" />
                </Button> */}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Edit Training Focus Dialog */}
      <Dialog open={showEditFocusForm} onOpenChange={setShowEditFocusForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              Edit Training Focus
            </DialogTitle>
          </DialogHeader>
          <TrainingFocusForm
            onComplete={() => setShowEditFocusForm(false)}
            initialFocus={trainingFocus}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingFocus;
