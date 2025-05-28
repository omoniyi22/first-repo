
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface TestData {
  id: string;
  file_name: string;
  document_date: string;
  horse_name: string;
  test_level?: string;
  discipline: string;
  status: string;
  document_url: string;
}

const RecentTests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [tests, setTests] = useState<TestData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentTests = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('document_analysis')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          console.error('Error fetching recent tests:', error);
          return;
        }

        setTests(data || []);
      } catch (error) {
        console.error('Error fetching recent tests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTests();
  }, [user]);

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-serif font-semibold text-gray-900 mb-4">
          {language === "en" ? "Recent Tests" : "Pruebas Recientes"}
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex space-x-4">
                <div className="w-48 h-32 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif font-semibold text-gray-900">
            {language === "en" ? "Recent Tests" : "Pruebas Recientes"}
          </h2>
          <Button
            variant="link"
            className="text-blue-700"
            onClick={() => navigate("/analysis")}
          >
            {language === "en" ? "Upload Test" : "Subir Prueba"}
          </Button>
        </div>
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {language === "en" ? "No tests yet" : "Aún no hay pruebas"}
          </h3>
          <p className="text-gray-500 mb-4">
            {language === "en" 
              ? "Upload your first test to get started with AI analysis"
              : "Sube tu primera prueba para comenzar con el análisis de IA"
            }
          </p>
          <Button onClick={() => navigate("/analysis")}>
            {language === "en" ? "Upload Test" : "Subir Prueba"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif font-semibold text-gray-900">
          {language === "en" ? "Recent Tests" : "Pruebas Recientes"}
        </h2>
        <Button
          variant="link"
          className="text-blue-700"
          onClick={() => navigate("/analysis")}
        >
          {language === "en" ? "View All" : "Ver Todas"}
        </Button>
      </div>

      <div className="space-y-4">
        {tests.map((test) => (
          <Card
            key={test.id}
            className="flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="sm:w-48 h-32 sm:h-auto relative bg-gray-100 flex items-center justify-center">
              <FileText className="h-12 w-12 text-gray-400" />
              <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-sm font-medium">
                {test.status === 'completed' ? (
                  <span className="text-green-600">
                    {language === "en" ? "Complete" : "Completo"}
                  </span>
                ) : test.status === 'processing' ? (
                  <span className="text-blue-600">
                    {language === "en" ? "Processing" : "Procesando"}
                  </span>
                ) : (
                  <span className="text-yellow-600">
                    {language === "en" ? "Pending" : "Pendiente"}
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 flex-1">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-700" />
                <h3 className="font-medium text-gray-900">
                  {test.test_level || test.file_name}
                </h3>
              </div>
              <p className="text-sm text-gray-700 mt-1">
                {language === "en" ? "Horse:" : "Caballo:"} {test.horse_name}
              </p>
              <p className="text-sm text-gray-700">
                {language === "en" ? "Analyzed on" : "Analizado el"}{" "}
                {new Date(test.document_date).toLocaleDateString(
                  language === "en" ? "en-GB" : "es-ES",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  }
                )}
              </p>
              <p className="text-sm text-gray-700">
                {language === "en" ? "Discipline:" : "Disciplina:"} {test.discipline}
              </p>
              <div className="mt-4 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-700 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  disabled={test.status !== 'completed'}
                >
                  {language === "en" ? "View Analysis" : "Ver Análisis"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-700 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  disabled={test.status !== 'completed'}
                >
                  {language === "en" ? "Recommendations" : "Recomendaciones"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecentTests;
