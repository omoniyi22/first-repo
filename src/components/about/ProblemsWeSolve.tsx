import { Card, CardContent } from "@/components/ui/card";
import AnimatedSection from "@/components/ui/AnimatedSection";
import {
  ArrowRight,
  BarChart3,
  FileText,
  Eye,
  LightbulbIcon,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const ProblemsWeSolve = () => {
  const { language } = useLanguage();
  return (
    <section className="py-16 bg-gradient-to-b from-purple-50 to-blue-50">
      <div className="container mx-auto px-6">
        <AnimatedSection
          animation="fade-in"
          className="max-w-3xl mx-auto mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-purple-900 mb-4">
            {language === "en"
              ? "Problems We Solve"
              : "Problemas que resolvemos"}
          </h2>
          <p className="text-lg text-gray-700">
            {language === "en"
              ? "We leverage AI technology to address the unique challenges faced by riders across disciplines."
              : "Aprovechamos la tecnología de inteligencia artificial para abordar los desafíos únicos que enfrentan los ciclistas en todas las disciplinas."}
          </p>
        </AnimatedSection>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Column - Introduction */}
            <AnimatedSection
              animation="fade-in"
              className="flex flex-col justify-center"
            >
              <h3 className="text-2xl font-serif font-medium text-purple-900 mb-4">
                {language === "en"
                  ? "Transforming Equestrian Performance Through Intelligence"
                  : "Transformando el rendimiento ecuestre a través de la inteligencia"}
              </h3>

              <p className="text-gray-700 mb-6">
                {language === "en"
                  ? "Equestrian sports blend artistry with technical precision, demanding constant refinement from both horse and rider. At AI Equestrian, we're addressing the fundamental challenges that prevent riders from reaching their full potential."
                  : "Los deportes ecuestres combinan el arte con la precisión técnica, exigiendo un perfeccionamiento constante tanto del caballo como del jinete. En AI Equestrian, abordamos los desafíos fundamentales que impiden a los jinetes alcanzar su máximo potencial."}
              </p>

              <Link
                to="/how-it-works"
                className="inline-flex items-center py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors duration-300 font-medium self-start mt-4"
              >
                {language === "en"
                  ? "Learn how our technology works"
                  : "Descubra cómo funciona nuestra tecnología"}{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </AnimatedSection>

            {/* Right Column - Challenges and Solutions */}
            <AnimatedSection animation="fade-in" className="space-y-5">
              {/* Challenge 1 */}
              <Card className="bg-white shadow-sm border-l-4 border-l-purple-500 hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-full shrink-0">
                      <Users className="w-5 h-5 text-purple-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">
                        {language === "en"
                          ? "Limited Feedback Between Lessons"
                          : "Retroalimentación limitada entre lecciones"}
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {language === "en"
                          ? "Most riders receive guidance only during infrequent lessons. AI Equestrian provides continuous analysis between coaching sessions."
                          : "La mayoría de los jinetes reciben orientación solo durante las clases esporádicas. AI Equestrian proporciona un análisis continuo entre sesiones de entrenamiento."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Challenge 2 */}
              <Card className="bg-white shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full shrink-0">
                      <BarChart3 className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-900 mb-1">
                        {language === "en"
                          ? "Difficulty Tracking Progress"
                          : "Dificultad para seguir el progreso"}
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {language === "en"
                          ? "Traditional methods make it challenging to measure improvement objectively. Our platform delivers quantifiable metrics and visual progress tracking."
                          : "Los métodos tradicionales dificultan la medición objetiva de las mejoras. Nuestra plataforma ofrece métricas cuantificables y seguimiento visual del progreso."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Challenge 3 */}
              <Card className="bg-white shadow-sm border-l-4 border-l-purple-500 hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-full shrink-0">
                      <FileText className="w-5 h-5 text-purple-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">
                        {language === "en"
                          ? "Inconsistent Performance Analysis"
                          : "Análisis de rendimiento inconsistente"}
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {language === "en"
                          ? "Relying on memory or scattered notes leads to fragmented insights. We transform test sheets and videos into comprehensive, organized analysis."
                          : "Confiar en la memoria o en notas dispersas genera información fragmentada. Transformamos hojas de examen y videos en análisis completos y organizados."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Challenge 4 */}
              <Card className="bg-white shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full shrink-0">
                      <Eye className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-900 mb-1">
                        {language === "en"
                          ? "Missing the Unseen Details"
                          : "Perdiendo los detalles invisibles"}
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {language === "en"
                          ? "The human eye can miss subtle elements that impact performance. Our technology captures movement nuances that might otherwise go unnoticed."
                          : "El ojo humano puede pasar por alto elementos sutiles que afectan el rendimiento. Nuestra tecnología captura matices de movimiento que, de otro modo, podrían pasar desapercibidos."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Challenge 5 */}
              <Card className="bg-white shadow-sm border-l-4 border-l-purple-500 hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-full shrink-0">
                      <LightbulbIcon className="w-5 h-5 text-purple-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">
                        {language === "en"
                          ? "Training Program Uncertainty"
                          : "Incertidumbre del programa de formación"}
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {language === "en"
                          ? "Many riders struggle to develop structured training plans. Our recommendation system creates targeted exercises based on your actual performance data."
                          : "A muchos ciclistas les cuesta desarrollar planes de entrenamiento estructurados. Nuestro sistema de recomendaciones crea ejercicios específicos según tus datos de rendimiento."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemsWeSolve;
