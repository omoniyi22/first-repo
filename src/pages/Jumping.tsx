import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Calendar, Map, Activity, BarChart, Clock, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO, generateDisciplineMetadata } from '@/lib/seo';

const Jumping = () => {
  // Initialize scroll reveal for animations
  useEffect(() => {
    const initScrollReveal = () => {
      const revealItems = document.querySelectorAll('.reveal-scroll');
      
      const revealCallback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      };
      
      const observer = new IntersectionObserver(revealCallback, {
        threshold: 0.1,
      });
      
      revealItems.forEach((item) => {
        observer.observe(item);
      });
      
      return () => {
        revealItems.forEach((item) => {
          observer.unobserve(item);
        });
      };
    };
    
    initScrollReveal();
  }, []);

  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Get discipline-specific metadata
  const seoMetadata = generateDisciplineMetadata('Jumping', {
    canonicalUrl: '/jumping'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <SEO {...seoMetadata} />
      <Navbar />
      <div className="container mx-auto px-6 pt-24 pb-6">
        <Link to="/">
          <Button variant="ghost" className="flex items-center gap-2 mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to AI Equestrian</span>
          </Button>
        </Link>
        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-2">
          AI Jumping Trainer
        </div>
      </div>
      <main className="pt-0">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-blue-100/50">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          
          <img 
            src="/lovable-uploads/dbb9802b-bed7-4888-96a3-73b68198710b.png" 
            alt="Professional show jumper using AI analytics to improve technique and performance"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            style={{ objectPosition: 'center 30%' }}
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-900/40"></div>
          
          <div className="container relative z-10 mx-auto px-6 text-center">
            <div className="max-w-2xl mx-auto transition-all duration-1000 transform">
              <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/30">
                Next Generation Show Jumping Training
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold leading-tight text-white mb-6 text-shadow">
                Transform Your Jumping Performance with AI
              </h1>
              
              <p className="text-lg text-white/90 mb-8 max-w-lg mx-auto text-shadow-sm">
                Upload your jumping videos, get AI-powered analysis, and receive personalized technique recommendations to improve your performance.
              </p>

              {/* Testimonial */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-8 max-w-md mx-auto border border-white/20">
                <p className="text-white/90 italic">"The AI Jumping Trainer transformed my approach to courses. I'm now placing consistently in the top 5 at my level."</p>
                <p className="text-white/80 text-sm mt-2">— Emma L., Amateur Jumper</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
                <Link to="/sign-in?signup=true">
                  <Button className="group flex items-center gap-2 text-base bg-white hover:bg-white/90 text-blue-800">
                    Get Started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button variant="outline" className="text-base border-white/30 bg-white/10 text-white hover:bg-white/30 hover:text-blue-900 backdrop-blur-sm">
                    How It Works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 reveal-scroll">
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6 text-purple-900">
                How AI Jumping Trainer Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our simple process helps you improve your show jumping technique through AI-powered analysis
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Upload Your Videos",
                  description: "Share your jumping rounds or schooling sessions for our AI to analyze. Works with smartphone video, GoPro footage, or professional recordings. Upload course maps for comprehensive round analysis."
                },
                {
                  title: "Get AI Analysis",
                  description: "Our advanced algorithms track 50+ data points throughout your round. Identify strengths and weaknesses in approach, takeoff, and landing. Compare your performance to ideal parameters for your competition level."
                },
                {
                  title: "Follow Tailored Recommendations",
                  description: "Receive specific exercises targeted to your improvement areas. Track progress with each new video upload. Build a progressive training plan based on your development."
                }
              ].map((step, index) => (
                <div 
                  key={index}
                  className="text-center p-8 reveal-scroll"
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-medium">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-serif font-medium mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-blue-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 reveal-scroll">
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6 text-gray-900">
                Benefits of AI Jumping Analysis
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover how our AI can transform your show jumping performance
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Technique Analysis",
                  description: "Detailed insight into your approach, takeoff, and landing technique. Analysis of striding between fences and approach angles.",
                  icon: Activity
                },
                {
                  title: "Pattern Recognition",
                  description: "Identify recurring issues across different rounds. Spot horse tendencies at specific fence types. Recognize environmental factors affecting performance.",
                  icon: BarChart
                },
                {
                  title: "Progress Tracking",
                  description: "Visualize improvements in your technique over time. Compare rounds at the same height or course type. Set measurable goals and track advancement.",
                  icon: CheckCircle
                },
                {
                  title: "Expert Insights",
                  description: "AI-generated advice based on techniques from top show jumpers. Exercise recommendations from certified trainers. Tailored to your horse's jumping style.",
                  icon: Award
                }
              ].map((benefit, index) => (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm reveal-scroll"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <benefit.icon className="h-8 w-8 text-blue-600 mb-4" />
                  <h3 className="text-xl font-serif font-medium mb-3 text-blue-900">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Course Analysis Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="reveal-scroll">
                <h2 className="text-3xl font-serif font-medium mb-6 text-gray-900">Detailed Course Analysis</h2>
                <ul className="space-y-4">
                  {[
                    "Track your path through the course with GPS-like precision",
                    "Analyze turn efficiency and time-saving opportunities",
                    "Identify where faults occur and why they happen",
                    "Compare different approaches to the same jumps"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link to="/how-it-works">
                    <Button className="flex items-center gap-2">
                      Learn More
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-blue-100 rounded-xl p-4 reveal-scroll">
                <div className="bg-white rounded-lg shadow-lg p-4 aspect-video flex items-center justify-center">
                  <Map className="w-16 h-16 text-blue-400 opacity-50" />
                  {/* This would be an interactive course map with rider path in a real implementation */}
                  <div className="absolute">Interactive course map visualization</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Competition Preparation Section */}
        <section className="py-20 bg-blue-50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-white rounded-xl p-4 shadow-sm reveal-scroll">
                <div className="bg-blue-50 rounded-lg p-4 aspect-video flex items-center justify-center">
                  <Calendar className="w-16 h-16 text-blue-400 opacity-50" />
                  {/* This would be a calendar integration in a real implementation */}
                  <div className="absolute">Competition preparation timeline</div>
                </div>
              </div>
              <div className="order-1 md:order-2 reveal-scroll">
                <h2 className="text-3xl font-serif font-medium mb-6 text-gray-900">Prepare for Competition Success</h2>
                <ul className="space-y-4">
                  {[
                    "Build a pre-competition training strategy based on your analysis",
                    "Identify course types and jumps where you excel or need practice",
                    "Track competition schedule and set focused goals for each event",
                    "Review past performances at specific venues or course designers"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Clock className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link to="/sign-in?signup=true">
                    <Button className="flex items-center gap-2">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-serif font-medium mb-12 text-center text-gray-900 reveal-scroll">
              What Riders Are Saying
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "AI Jumping Trainer helped me identify a recurring approach issue that was causing rails. Fixed it in two weeks!",
                  name: "Michael T.",
                  role: "Adult Amateur, 1.10m Jumpers"
                },
                {
                  quote: "The pattern recognition is incredible. It spotted my horse's tendency to drift right that even my trainer hadn't noticed consistently.",
                  name: "Sarah K.",
                  role: "Junior Rider, 1.20m Jumpers"
                },
                {
                  quote: "As a professional, I use this with all my students. The visual analysis makes it so much easier to explain technique adjustments.",
                  name: "James R.",
                  role: "Professional Trainer"
                }
              ].map((testimonial, index) => (
                <div 
                  key={index} 
                  className="bg-blue-50 p-8 rounded-xl shadow-sm relative reveal-scroll"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="absolute -top-4 -left-2 text-blue-400 text-6xl opacity-20">"</div>
                  <p className="text-gray-700 mb-6 relative z-10">{testimonial.quote}</p>
                  <div>
                    <p className="font-medium text-blue-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-blue-800 to-purple-900 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-serif font-medium mb-6 reveal-scroll">Ready to Transform Your Jumping?</h2>
            <p className="max-w-2xl mx-auto mb-8 text-blue-100 reveal-scroll">
              Join riders who are using AI to achieve their competitive goals and improve their technique.
            </p>
            <div className="reveal-scroll">
              <Link to="/pricing">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 px-8">
                  Start Your Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Jumping;
