
import AnimatedSection from '../ui/AnimatedSection';
import { Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
}

const TeamSection = () => {
  const { language, translations } = useLanguage();
  const t = translations[language];
  
  const teamMembers: TeamMember[] = [
    {
      name: "Jenny Stanley",
      role: "Founder & CEO",
      bio: "With over 20 years experience in international sales management across the media, advertising and creative technology industries, Jenny combines her passion for dressage with her expertise in technology to revolutionize equestrian training through AI.",
      image: "/lovable-uploads/79f64a37-cb8e-4627-b743-c5330837a1b0.png",
      linkedin: "https://www.linkedin.com/in/jenny-stanley/"
    },
    {
      name: "Marcus Chen",
      role: "Chief Technology Officer",
      bio: "With 15+ years of experience in AI and machine learning, Marcus leads our technology team in developing and refining our analysis algorithms and recommendation systems.",
      image: "https://randomuser.me/api/portraits/men/42.jpg"
    }
  ];

  return (
    <section className="py-16 bg-silver-50">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-purple-900 mb-4">
            {t["meet-our-team"]}
          </h2>
          <p className="text-lg text-navy-700">
            {t["team-description"]}
          </p>
        </AnimatedSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {teamMembers.map((member, index) => (
            <AnimatedSection 
              key={index}
              animation="fade-in"
              delay={`delay-${(index + 1) * 100}` as any}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-sm h-full">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="aspect-square overflow-hidden bg-navy-100">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-medium text-navy-900 mb-1">
                      {member.name}
                    </h3>
                    
                    <p className="text-navy-600 font-medium text-sm mb-4">
                      {member.role}
                    </p>
                    
                    <p className="text-navy-700 text-sm">
                      {member.bio}
                    </p>
                    
                    {member.linkedin && (
                      <div className="mt-4">
                        <a 
                          href={member.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center text-navy-600 hover:text-navy-800 transition-colors"
                          aria-label={`${member.name}'s LinkedIn profile`}
                        >
                          <Linkedin className="h-5 w-5 mr-1" />
                          <span className="text-sm">{t["view-linkedin"]}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
        
        <AnimatedSection animation="fade-in" className="mb-12">
          <div className="bg-white rounded-xl p-8 md:p-12 shadow-sm">
            <h3 className="text-2xl md:text-3xl font-serif font-semibold text-navy-900 mb-6 text-center">
              {t["our-approach"]}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-gradient-to-br from-navy-50 to-purple-100 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-navy-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-navy-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium mb-2 text-center text-navy-900">{t["data-driven"]}</h4>
                <p className="text-navy-700 text-sm text-center">
                  {t["data-driven-desc"]}
                </p>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-navy-50 to-purple-100 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-navy-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-navy-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium mb-2 text-center text-navy-900">{t["personalized"]}</h4>
                <p className="text-navy-700 text-sm text-center">
                  {t["personalized-desc"]}
                </p>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-navy-50 to-purple-100 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-navy-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-navy-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium mb-2 text-center text-navy-900">{t["accessible"]}</h4>
                <p className="text-navy-700 text-sm text-center">
                  {t["accessible-desc"]}
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
        
        <AnimatedSection animation="fade-in">
          <div className="bg-gradient-to-br from-navy-800 to-purple-900 rounded-xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-serif font-semibold text-white mb-6">
              {t["experience-ai-training"]}
            </h3>
            
            <div className="md:flex justify-center items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="md:w-1/2 flex-shrink-0">
                <img 
                  src="/lovable-uploads/6782ac64-8d3f-4d9e-902e-7cdb1240c449.png"
                  alt="Jenny Stanley riding demonstration"
                  className="rounded-lg w-full max-h-80 object-cover"
                />
              </div>
              
              <div className="md:w-1/2 text-left">
                <p className="text-navy-100 mb-6">
                  {t["have-questions"]}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 px-6 py-3"
                  >
                    {t["start-free-trial"]}
                  </Button>
                  
                  <Button 
                    className="border border-white text-white hover:bg-navy-700 bg-transparent px-6 py-3"
                  >
                    {t["send-message"]}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default TeamSection;
