
import { Card, CardContent } from "@/components/ui/card";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { ArrowRight, BarChart3, FileText, Eye, LightbulbIcon, Users } from "lucide-react";
import { Link } from "react-router-dom";

const ProblemsWeSolve = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-purple-50 to-blue-50">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="max-w-3xl mx-auto mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-purple-900 mb-4">
            Problems We Solve
          </h2>
          <p className="text-lg text-gray-700">
            We leverage AI technology to address the unique challenges faced by riders across disciplines.
          </p>
        </AnimatedSection>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Column - Introduction */}
            <AnimatedSection animation="fade-in" className="flex flex-col justify-center">
              <h3 className="text-2xl font-serif font-medium text-purple-900 mb-4">
                Transforming Equestrian Performance Through Intelligence
              </h3>
              
              <p className="text-gray-700 mb-6">
                Equestrian sports blend artistry with technical precision, demanding constant refinement from both horse and rider. 
                At AI Equestrian, we're addressing the fundamental challenges that prevent riders from reaching their full potential.
              </p>
              
              <Link to="/how-it-works" className="inline-flex items-center py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors duration-300 font-medium self-start mt-4">
                Learn how our technology works <ArrowRight className="ml-2 h-4 w-4" />
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
                      <h4 className="font-medium text-blue-900 mb-1">Limited Feedback Between Lessons</h4>
                      <p className="text-gray-700 text-sm">
                        Most riders receive guidance only during infrequent lessons. AI Equestrian provides continuous analysis between coaching sessions.
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
                      <h4 className="font-medium text-purple-900 mb-1">Difficulty Tracking Progress</h4>
                      <p className="text-gray-700 text-sm">
                        Traditional methods make it challenging to measure improvement objectively. Our platform delivers quantifiable metrics and visual progress tracking.
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
                      <h4 className="font-medium text-blue-900 mb-1">Inconsistent Performance Analysis</h4>
                      <p className="text-gray-700 text-sm">
                        Relying on memory or scattered notes leads to fragmented insights. We transform test sheets and videos into comprehensive, organized analysis.
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
                      <h4 className="font-medium text-purple-900 mb-1">Missing the Unseen Details</h4>
                      <p className="text-gray-700 text-sm">
                        The human eye can miss subtle elements that impact performance. Our technology captures movement nuances that might otherwise go unnoticed.
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
                      <h4 className="font-medium text-blue-900 mb-1">Training Program Uncertainty</h4>
                      <p className="text-gray-700 text-sm">
                        Many riders struggle to develop structured training plans. Our recommendation system creates targeted exercises based on your actual performance data.
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
