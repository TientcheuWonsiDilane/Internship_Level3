import React from "react";
import { Link } from "react-router-dom";
import { Users, Zap, Shield, ArrowRight } from "lucide-react";
import Footer from "../components/Footer";

const PublicTeams = () => {
  return (
    <>
    <div className="min-h-screen bg-[#050506] text-white flex flex-col pt-32 pb-16">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="flex-grow flex flex-col items-center justify-center px-6 relative z-10 text-center max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-in slide-in-from-bottom-6 fade-in duration-500">
          Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">High-Performing Teams</span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 animate-in slide-in-from-bottom-8 fade-in duration-700">
          Unify your workflows, streamline communication, and deliver projects faster with our enterprise-grade collaboration workspace.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-12 animate-in slide-in-from-bottom-10 fade-in duration-1000">
            
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left flex flex-col items-start shadow-lg shadow-black/20 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Seamless Collaboration</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
                Bring everyone together in one place. Break down silos and keep your team aligned with real-time updates and shared context.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left flex flex-col items-start shadow-lg shadow-black/20 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
                Experience unparalleled speed. Our platform is optimized to keep up with your team's rapid pace without any lag or friction.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left flex flex-col items-start shadow-lg shadow-black/20 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Enterprise Security</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
                Your data is safe with us. We employ robust security measures and advanced permissions to ensure complete peace of mind.
            </p>
          </div>

        </div>

        <div className="mt-20 flex flex-col sm:flex-row gap-4">
          <Link
            to="/register"
            className="group px-8 py-3.5 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-all flex items-center justify-center"
          >
            Get Started with your Team
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>
    </div>
    <Footer />
    </>
  );
};

export default PublicTeams;

