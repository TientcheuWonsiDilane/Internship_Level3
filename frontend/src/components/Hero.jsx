import React from "react";
import workspaceImg from "../assets/workspace.png";
import BrandLogo from "./BrandLogo";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative overflow-hidden w-full bg-[#050506] text-white min-h-screen flex items-center pt-12 pb-16">
      <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent via-[#050506]/80 to-[#050506] pointer-events-none" />

      <div className="max-w-7xl mx-auto  w-full flex flex-col lg:flex-row items-center gap-12 relative z-10">
        <div className=" pl-6 flex-1 flex flex-col items-start text-left z-20 w-full">
          <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.16] md:leading-[1.12] tracking-normal mb-4 text-white">
            Metrics Workspace
          </h1>

          <h2 className="text-2xl md:text-3xl leading-snug text-gray-300 mb-6">
            Flawless project management
          </h2>

          <p className="text-gray-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
            Metrics is a workspace environment for developers to collaborate
            more efficiently. Unify your team, streamline workflows, and
            accelerate delivery from idea to production.
          </p>

          <div className="flex flex-wrap items-center gap-6 mb-16">
            <Link
              to="/login"
              className="px-8 py-3.5 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-all text-sm md:text-base">
              Get Started
            </Link>
            <Link
              to="/about"
              className="px-2 py-3.5 text-white font-medium hover:text-gray-300 transition-colors flex items-center gap-2 group text-sm md:text-base">
              Learn More{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div
          className="flex-1 w-full lg:h-[700px] relative mt-16 lg:mt-0 flex items-center justify-center z-10"
          style={{ perspective: "1500px" }}>
          <div
            className="absolute w-[200%] lg:w-[290%] -left-[10%] lg:-left-[15%] top-1/2 -translate-y-1/2 transform-gpu"
            style={{
              transform: "rotateY(-25deg) rotateX(15deg) rotateZ(2deg)",
            }}>
            <div className="rounded-2xl border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,1)] overflow-hidden bg-[#0a0a0c] relative">
              <img
                src={workspaceImg}
                alt="Dashboard Preview"
                className="w-full h-auto object-cover grayscale opacity-90"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#050506]/40 via-transparent to-[#050506]/90 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#050506] via-transparent to-[#050506] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
