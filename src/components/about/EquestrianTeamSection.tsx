
import AnimatedSection from '../ui/AnimatedSection';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  discipline?: 'dressage' | 'jumping' | 'both';
  linkedin?: string;
}

const EquestrianTeamSection = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "Alexandra Parker",
      role: "Founder & CEO",
      bio: "Former international competitor in both dressage and jumping with a passion for technology. Alexandra founded AI Equestrian to revolutionize training across disciplines.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      discipline: 'both',
      linkedin: "https://www.linkedin.com/in/alexandra-parker/"
    },
    {
      name: "David Chen",
      role: "Chief Technology Officer",
      bio: "With a PhD in AI and a background in sports analytics, David leads our engineering team in building innovative solutions for equestrian performance enhancement.",
      image: "https://randomuser.me/api/portraits/men/26.jpg",
      linkedin: "https://www.linkedin.com/in/david-chen-ai/"
    },
    {
      name: "Maria Rodriguez",
      role: "Director of Dressage Education",
      bio: "FEI 5* judge and medal-winning coach who ensures our dressage analysis aligns with classical principles and current competitive standards.",
      image: "https://randomuser.me/api/portraits/women/23.jpg",
      discipline: 'dressage'
    },
    {
      name: "James Wilson",
      role: "Director of Jumping Education",
      bio: "International course designer and former Olympic show jumper who validates our jumping analysis algorithms and training recommendations.",
      image: "https://randomuser.me/api/portraits/men/29.jpg",
      discipline: 'jumping'
    }
  ];

  const executiveTeam: TeamMember[] = [
    {
      name: "Sarah Johnson",
      role: "Chief Operating Officer",
      bio: "Experienced operations leader with a background in scaling technology companies and a lifelong passion for horses.",
      image: "https://randomuser.me/api/portraits/women/22.jpg"
    },
    {
      name: "Thomas Weber",
      role: "VP of Product",
      bio: "Product leader with expertise in sports technology and a focus on creating intuitive user experiences for athletes and coaches.",
      image: "https://randomuser.me/api/portraits/men/45.jpg"
    },
    {
      name: "Elena Martinez",
      role: "VP of Marketing",
      bio: "Marketing strategist with experience in sports technology and deep connections in the global equestrian community.",
      image: "https://randomuser.me/api/portraits/women/67.jpg"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900 mb-4">
            Our Leadership Team
          </h2>
          <p className="text-lg text-gray-700">
            We bring together experts from dressage, jumping, AI technology, and product development to create a comprehensive equestrian training solution.
          </p>
        </AnimatedSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <AnimatedSection 
              key={index}
              animation="fade-in"
              delay={`delay-${(index + 1) * 100}` as any}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-sm h-full">
                <div className="aspect-square overflow-hidden bg-gray-100 relative">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  {member.discipline && (
                    <div className="absolute top-3 right-3">
                      {member.discipline === 'dressage' && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          Dressage Expert
                        </span>
                      )}
                      {member.discipline === 'jumping' && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Jumping Expert
                        </span>
                      )}
                      {member.discipline === 'both' && (
                        <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Multi-Discipline
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-serif font-medium text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  
                  <p className="text-gray-600 font-medium text-sm mb-4">
                    {member.role}
                  </p>
                  
                  <p className="text-gray-700 text-sm">
                    {member.bio}
                  </p>
                  
                  <div className="mt-4 flex space-x-3">
                    {member.linkedin && (
                      <a 
                        href={member.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                        aria-label={`${member.name}'s LinkedIn profile`}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    )}
                    <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">
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
          <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-8 text-center">
            Executive Team
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {executiveTeam.map((member, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row items-center md:items-start p-6">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 mb-4 md:mb-0 md:mr-4">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1 text-center md:text-left">
                    {member.name}
                  </h3>
                  <p className="text-gray-600 font-medium text-sm mb-2 text-center md:text-left">
                    {member.role}
                  </p>
                  <p className="text-gray-700 text-sm">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
        
        <AnimatedSection animation="fade-in" className="mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="p-8 md:p-12 border-b border-gray-100">
                <h3 className="text-2xl font-serif font-semibold text-purple-900 mb-6">
                  AI Dressage Team
                </h3>
                
                <div className="space-y-6">
                  <p className="text-gray-700">
                    Our specialized dressage team combines classical training principles with cutting-edge technology to create a truly innovative dressage analysis platform.
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-purple-100">
                        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Team member" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-purple-100">
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Team member" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-purple-100">
                        <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Team member" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-purple-100">
                        <div className="w-full h-full bg-purple-500 text-white text-xs flex items-center justify-center">+5</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">9 team members</span>
                  </div>
                </div>
                
                <div className="mt-8">
                  <a href="/dressage/about" className="text-purple-600 hover:text-purple-800 font-medium text-sm inline-flex items-center">
                    Learn more about AI Dressage
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="p-8 md:p-12 border-b border-gray-100">
                <h3 className="text-2xl font-serif font-semibold text-blue-900 mb-6">
                  AI Jump Team
                </h3>
                
                <div className="space-y-6">
                  <p className="text-gray-700">
                    Our dedicated jump team combines extensive course design experience with performance analytics to deliver actionable insights for jumping riders of all levels.
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-blue-100">
                        <img src="https://randomuser.me/api/portraits/men/72.jpg" alt="Team member" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-blue-100">
                        <img src="https://randomuser.me/api/portraits/women/32.jpg" alt="Team member" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-blue-100">
                        <img src="https://randomuser.me/api/portraits/men/18.jpg" alt="Team member" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-blue-100">
                        <div className="w-full h-full bg-blue-500 text-white text-xs flex items-center justify-center">+4</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">8 team members</span>
                  </div>
                </div>
                
                <div className="mt-8">
                  <a href="/jumping/about" className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center">
                    Learn more about AI Jump
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      
        <AnimatedSection animation="fade-in" className="mt-20">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-serif font-semibold text-white mb-6">
              Join Our Team
            </h3>
            
            <p className="text-gray-100 mb-8 max-w-2xl mx-auto">
              We're always looking for passionate individuals who combine equestrian expertise with technological innovation. Join us in transforming how riders train and improve across disciplines.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                View Open Positions
              </button>
              
              <button className="bg-transparent border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
                Contact Our Team
              </button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default EquestrianTeamSection;
