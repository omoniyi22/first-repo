
import AnimatedSection from "@/components/ui/AnimatedSection";

const GeneralProblems = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
      Transforming Equestrian Performance Through Intelligence
    </h3>
    
    <p className="text-gray-700">
      Equestrian sports blend artistry with technical precision, demanding constant refinement from both horse and rider. 
      At AI Equestrian, we're addressing the fundamental challenges that prevent riders from reaching their full potential:
    </p>
    
    <div className="space-y-4 mt-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h4 className="font-medium text-gray-900 mb-1">Limited Feedback Between Lessons</h4>
        <p className="text-gray-600 text-sm">
          Most riders receive feedback only during infrequent lessons, creating long gaps in the learning process. 
          AI Equestrian provides continuous analysis and guidance between professional coaching sessions.
        </p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h4 className="font-medium text-gray-900 mb-1">Difficulty Tracking Progress</h4>
        <p className="text-gray-600 text-sm">
          Traditional methods make it challenging to objectively measure improvement over time. 
          Our platform delivers quantifiable metrics and visual progress tracking to validate your training efforts.
        </p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h4 className="font-medium text-gray-900 mb-1">Inconsistent Performance Analysis</h4>
        <p className="text-gray-600 text-sm">
          Relying solely on memory or scattered notes leads to fragmented analysis. 
          We transform your test sheets and videos into comprehensive, organized insights that reveal meaningful patterns.
        </p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h4 className="font-medium text-gray-900 mb-1">Missing the Unseen Details</h4>
        <p className="text-gray-600 text-sm">
          The human eye can miss subtle elements that impact performance. 
          Our AI technology captures and analyzes nuances in movement and position that might otherwise go unnoticed.
        </p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h4 className="font-medium text-gray-900 mb-1">Training Program Uncertainty</h4>
        <p className="text-gray-600 text-sm">
          Many riders struggle to develop structured training plans that address specific weaknesses. 
          Our recommendation system creates targeted exercises based on your actual performance data.
        </p>
      </div>
    </div>
  </div>
);

const ProblemsWeSolve = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="max-w-3xl mx-auto mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900 mb-4">
            Problems We Solve
          </h2>
          <p className="text-lg text-gray-700">
            We leverage AI technology to address the unique challenges faced by riders across disciplines.
          </p>
        </AnimatedSection>
        
        <div className="max-w-5xl mx-auto">
          <GeneralProblems />
        </div>
      </div>
    </section>
  );
};

export default ProblemsWeSolve;
