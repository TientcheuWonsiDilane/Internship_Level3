import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-[#050506] text-white flex flex-col pt-32 pb-16">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="flex-grow flex flex-col px-6 md:px-12 relative z-10 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Etrics</span>
        </h1>

        <div className="space-y-8 text-gray-300 leading-relaxed text-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
          <p>
            Etrics was born out of a simple frustration: modern project management tools have become too cluttered, too slow, and too difficult to adopt. We believe that software should empower your team, not get in their way.
          </p>
          
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 my-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full blur-2xl"></div>
            <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
            <p>
              To provide teams with a flawless workspace that prioritizes speed, clarity, and aesthetics. We are building the command center for the next generation of builders, makers, and innovators.
            </p>
          </div>

          <p>
            We focus on core features that matter: intuitive task tracking, seamless team collaboration, and unified organizational management, all wrapped in a premium dark-mode interface that is a joy to look at.
          </p>
          <p>
            Whether you are a solo developer or an enterprise organization, Etrics scales with you. Welcome to the future of work.
          </p>
        </div>
      </main>
    </div>
  );
};

export default About;
