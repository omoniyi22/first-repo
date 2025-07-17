import AnimatedSection from "@/components/ui/AnimatedSection";
import { useLanguage } from "@/contexts/LanguageContext";

const MissionAndVision = () => {
  const { language } = useLanguage();
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-center text-purple-900 mb-8">
            {language === "en"
              ? "Our Mission & Vision"
              : "Nuestra Misión y Visión"}
          </h2>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p>
              {language === "en"
                ? "At AI Equestrian, we believe that technology can enhance the time-honored traditions of equestrian sports. Our mission is to democratize access to elite-level training by leveraging artificial intelligence to provide personalized, data-driven insights to riders of all levels."
                : "En AI Equestrian, creemos que la tecnología puede enriquecer las tradiciones ancestrales de los deportes ecuestres. Nuestra misión es democratizar el acceso al entrenamiento de élite aprovechando la inteligencia artificial para brindar información personalizada y basada en datos a jinetes de todos los niveles."}
            </p>

            <p>
              {language === "en"
                ? "We envision a world where every equestrian, regardless of location or resources, can receive tailored guidance to improve their performance and strengthen the partnership with their horse."
                : "Imaginamos un mundo donde cada jinete, independientemente de su ubicación o recursos, pueda recibir asesoramiento personalizado para mejorar su rendimiento y fortalecer la relación con su caballo."}
            </p>

            <p>
              {language === "en"
                ? "Our platform was born from a simple observation: while competition feedback contains valuable insights, riders often struggle to translate that feedback into effective training strategies. By harnessing the power of AI, we bridge that gap, turning competition results and video analysis into actionable training plans."
                : "Nuestra plataforma nació de una simple observación: si bien el feedback de la competición contiene información valiosa, los ciclistas suelen tener dificultades para traducirlo en estrategias de entrenamiento efectivas. Al aprovechar el poder de la IA, acortamos esa distancia, convirtiendo los resultados de la competición y el análisis de vídeo en planes de entrenamiento prácticos."}
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default MissionAndVision;
