
import AnimatedSection from '../ui/AnimatedSection';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
}

const TeamSection = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "Jenny Stanley",
      role: "Founder & CEO",
      bio: "Former international dressage competitor with a passion for innovation. Jenny combined her dedication to dressage and expertise in technology to create a revolutionary training platform.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
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
    <section className="py-20 bg-silver-50">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-navy-900 mb-4">
            Meet Our Team
          </h2>
          <p className="text-lg text-navy-700">
            We're a dedicated team of dressage experts and AI specialists passionate about transforming dressage training.
          </p>
        </AnimatedSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {teamMembers.map((member, index) => (
            <AnimatedSection 
              key={index}
              animation="fade-in"
              delay={`delay-${(index + 1) * 100}` as any}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-sm h-full">
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
                  
                  <div className="mt-4 flex space-x-3">
                    {member.linkedin && (
                      <a 
                        href={member.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-navy-600 hover:text-navy-800 transition-colors"
                        aria-label={`${member.name}'s LinkedIn profile`}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    )}
                    <a href="#" className="text-navy-600 hover:text-navy-800 transition-colors">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.162 5.656a8.384 8.384 0 01-2.402.658A4.196 4.196 0 0021.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 00-7.126 3.814 11.874 11.874 0 01-8.62-4.37 4.168 4.168 0 00-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 01-1.894-.523v.052a4.185 4.185 0 003.355 4.101 4.21 4.21 0 01-1.89.072A4.185 4.185 0 007.97 16.65a8.394 8.394 0 01-6.191 1.732 11.83 11.83 0 006.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 002.087-2.165z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
        
        <AnimatedSection animation="fade-in" className="mt-20">
          <div className="bg-navy-800 rounded-xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-serif font-semibold text-white mb-6">
              Contact Us
            </h3>
            
            <p className="text-navy-100 mb-8 max-w-2xl mx-auto">
              Have questions about our platform or want to learn more about how AI Dressage Trainer can help you achieve your riding goals? Get in touch with our team.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-white text-navy-800 px-6 py-3 rounded-lg font-medium hover:bg-navy-50 transition-colors">
                Send a Message
              </button>
              
              <button className="bg-transparent border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-navy-700 transition-colors">
                Schedule a Demo
              </button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default TeamSection;
