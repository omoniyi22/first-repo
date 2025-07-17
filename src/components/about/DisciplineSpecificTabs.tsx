import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLanguage } from "@/contexts/LanguageContext";

const DressageTab = () => {
  const { language } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="md:flex gap-8 items-center mb-8">
        <div className="md:w-1/2 mb-6 md:mb-0">
          <h3 className="text-2xl font-serif font-semibold text-purple-900 mb-4">
            {language === "en"
              ? "Elevating Your Dressage Journey"
              : "Elevando tu experiencia en doma clásica"}
          </h3>
          <p className="text-gray-700 mb-4">
            {language === "en"
              ? "Dressage demands precision, harmony, and consistent improvement. AI Dressage tackles the specific challenges faced by dressage riders."
              : "La doma exige precisión, armonía y una mejora constante. AI Dressage aborda los retos específicos de los jinetes de doma."}
          </p>
        </div>
        <div className="md:w-1/2">
          <img
            src="/lovable-uploads/f21e0183-a564-4222-87bb-f424b3ed4c87.png"
            alt="Dressage rider performing in an arena"
            className="rounded-lg w-full object-cover shadow-md h-64"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100">
          <h4 className="font-medium text-purple-800 mb-2">
            {language === "en"
              ? "Inconsistent Test Scores"
              : "Puntuaciones de pruebas inconsistentes"}
          </h4>
          <p className="text-gray-600 text-sm">
            {language === "en"
              ? "Dressage riders often experience frustrating score fluctuations without understanding why. AI Dressage analyzes your test sheets to identify patterns and specific movements affecting your overall performance."
              : "Los jinetes de doma clásica a menudo experimentan fluctuaciones de puntuación frustrantes sin comprender el motivo. AI Dressage analiza sus hojas de prueba para identificar patrones y movimientos específicos que afectan su rendimiento general."}
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100">
          <h4 className="font-medium text-purple-800 mb-2">
            {language === "en"
              ? "Difficulty Interpreting Judge Comments"
              : "Dificultad para interpretar los comentarios del juez"}
          </h4>
          <p className="text-gray-600 text-sm">
            {language === "en"
              ? "Judge feedback can be cryptic or overwhelming. Our system synthesizes comments across multiple tests to reveal actionable insights about your technical execution."
              : "Los comentarios de los jueces pueden ser crípticos o abrumadores. Nuestro sistema sintetiza los comentarios de múltiples pruebas para revelar información útil sobre su ejecución técnica."}
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100">
          <h4 className="font-medium text-purple-800 mb-2">
            {language === "en"
              ? "Position Flaws During Movements"
              : "Defectos de posición durante los movimientos"}
          </h4>
          <p className="text-gray-600 text-sm">
            {language === "en"
              ? "Small alignment issues can significantly impact movement quality. Our video analysis identifies position inconsistencies at critical moments in your ride."
              : "Pequeños problemas de alineación pueden afectar significativamente la calidad del movimiento. Nuestro análisis de video identifica inconsistencias de posición en momentos críticos de tu recorrido."}
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100">
          <h4 className="font-medium text-purple-800 mb-2">
            {language === "en"
              ? "Gait Quality Assessment"
              : "Evaluación de la calidad de la marcha"}
          </h4>
          <p className="text-gray-600 text-sm">
            {language === "en"
              ? "It's challenging to objectively evaluate the quality of your horse's gaits while riding. AI Dressage provides detailed analysis of rhythm, impulsion, and other key qualities across all gaits."
              : "Evaluar objetivamente la calidad de los aires de tu caballo al montar es un reto. AI Dressage proporciona un análisis detallado del ritmo, la impulsión y otras cualidades clave en todos los aires."}
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100 md:col-span-2">
          <h4 className="font-medium text-purple-800 mb-2">
            {language === "en"
              ? "Training Progression Plateaus"
              : "Mesetas de progresión del entrenamiento"}
          </h4>
          <p className="text-gray-600 text-sm">
            {language === "en"
              ? "Many riders struggle to break through scoring plateaus. Our system identifies the highest-impact areas for improvement and suggests targeted exercises to elevate your performance."
              : "Muchos ciclistas tienen dificultades para superar los estancamientos en su puntuación. Nuestro sistema identifica las áreas de mayor impacto para mejorar y sugiere ejercicios específicos para mejorar tu rendimiento."}
          </p>
        </div>
      </div>
    </div>
  );
};

const JumpingTab = () => {
  const { language } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="md:flex gap-8 items-center mb-8">
        <div className="md:w-1/2 mb-6 md:mb-0">
          <h3 className="text-2xl font-serif font-semibold text-blue-900 mb-4">
            {language === "en"
              ? "Clearing Obstacles to Success"
              : "Eliminando obstáculos para el éxito"}
          </h3>
          <p className="text-gray-700 mb-4">
            {language === "en"
              ? "Show jumping requires split-second decisions and technical accuracy. AI Jump addresses the unique challenges jumpers face."
              : "El salto ecuestre requiere decisiones instantáneas y precisión técnica. AI Jump aborda los desafíos únicos que enfrentan los saltadores."}
          </p>
        </div>
        <div className="md:w-1/2">
          <img
            src="/lovable-uploads/f4342e41-2c55-47a0-84c0-9fbe7a192de5.png"
            alt="Show jumping competition with horse and rider"
            className="rounded-lg w-full object-cover shadow-md h-64"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-2">
            {language === "en"
              ? "Approach and Distance Inconsistency"
              : "Inconsistencia entre aproximación y distancia"}
          </h4>
          <p className="text-gray-600 text-sm">
            {language === "en"
              ? "Finding the right distance to jumps consistently is a commonstruggle. AI Jump analyzes your approaches to identify patterns andhelp you develop more reliable distance control."
              : "Encontrar la distancia correcta para saltar de forma consistente es una dificultad común. AI Jump analiza tus estrategias para identificar patrones y ayudarte a desarrollar un control de distancia más fiable."}
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-2">
            {language === "en"
              ? "Position Faults at Critical Moments"
              : "Fallas de posición en momentos críticos"}
          </h4>
          <p className="text-gray-600 text-sm">
            {language === "en"
              ? "Many riders don't realize how their position affects their horse's jumping technique. video analysis pinpoints exactly where position issues occur and how they impact performance."
              : "Muchos jinetes no se dan cuenta de cómo su posición afecta la técnica de salto de su caballo. El análisis de video señala exactamente dónde ocurren los problemas de posición y cómo afectan el rendimiento."}
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-2">
            {language === "en"
              ? "Course Strategy Optimization"
              : "Optimización de la estrategia del curso"}
          </h4>
          <p className="text-gray-600 text-sm">
            {language === "en"
              ? "Planning the ideal path and pace for complex courses is challenging. Our course map analysis helps you identify optimal approaches and potential trouble spots before you enter the arena."
              : "Planificar la ruta y el ritmo ideales para recorridos complejos es un reto. Nuestro análisis del mapa del recorrido te ayuda a identificar los enfoques óptimos y los posibles puntos problemáticos antes de entrar en acción."}
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-2">
            {language === "en"
              ? "Fault Pattern Recognition"
              : "Reconocimiento de patrones de fallas"}
          </h4>
          <p className="text-gray-600 text-sm">
            {language === "en"
              ? "Rails down or refusals often follow consistent patterns. AI Jump tracks these patterns across multiple rounds to reveal the underlying technical issues."
              : "Las caídas o rechazos de carriles suelen seguir patrones consistentes. AI Jump rastrea estos patrones a lo largo de varias rondas para revelar los problemas técnicos subyacentes."}
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100 md:col-span-2">
          <h4 className="font-medium text-blue-800 mb-2">
            {language === "en"
              ? "Jump Type Difficulties"
              : "Dificultades del tipo de salto"}
          </h4>
          <p className="text-gray-600 text-sm">
            {language === "en"
              ? "Many horses and riders struggle with specific jump types. Our system identifies which obstacles consistently cause problems and recommends targeted exercises to build confidence."
              : "Muchos caballos y jinetes tienen dificultades con ciertos tipos de salto. Nuestro sistema identifica qué obstáculos suelen causar problemas y recomienda ejercicios específicos para desarrollar confianza."}
          </p>
        </div>
      </div>
    </div>
  );
};

const DisciplineSpecificTabs = () => {
  const [activeTab, setActiveTab] = useState("dressage");
  const { language } = useLanguage();
  return (
    <section className="py-16 bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="container mx-auto px-6">
        <AnimatedSection
          animation="fade-in"
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-purple-900 mb-4">
            {language === "en"
              ? "Discipline-Specific Challenges"
              : "Desafíos específicos de la disciplina"}
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            {language === "en"
              ? "Our specialized AI systems address the unique needs of different equestrian disciplines."
              : "Nuestros sistemas de inteligencia artificial especializados abordan las necesidades únicas de diferentes disciplinas ecuestres."}
          </p>
          <p className="text-sm text-gray-600 font-medium mb-4">
            {language === "en"
              ? "Click a discipline below to view challenges"
              : "Haga clic en una disciplina a continuación para ver los desafíos."}
          </p>
        </AnimatedSection>

        {/* Completely redesigned tabs section */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex justify-center">
            <div className="inline-flex bg-white rounded-xl shadow-lg p-2 border border-gray-200">
              <button
                onClick={() => setActiveTab("dressage")}
                className={`relative px-8 py-4 rounded-lg transition-all duration-300 font-serif text-2xl ${
                  activeTab === "dressage"
                    ? "bg-purple-100 text-purple-900 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {language === "en" ? "AI Dressage" : "Doma clásica IA"}
                {activeTab === "dressage" && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-purple-700 rounded-b-lg"></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("jumping")}
                className={`relative px-8 py-4 rounded-lg transition-all duration-300 font-serif text-2xl ${
                  activeTab === "jumping"
                    ? "bg-blue-100 text-blue-900 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {language === "en" ? "AI Jump" : "Salto de IA"}

                {activeTab === "jumping" && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-700 rounded-b-lg"></span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {activeTab === "dressage" ? <DressageTab /> : <JumpingTab />}
        </div>
      </div>
    </section>
  );
};

export default DisciplineSpecificTabs;
