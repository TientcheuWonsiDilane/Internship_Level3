import React from "react";
import logo from "../assets/logo.png";

const Hero = () => {
  return (
    <section
      className="relative overflow-hidden h-[50dvh] md:h-[60dvh] lg:h-screen w-full [clip-path:polygon(0_0,_100%_0,_100%_calc(100%-40px),_95%_calc(100%-40px),_95%_100%,_90%_100%,_90%_calc(100%-20px),_85%_calc(100%-20px),_85%_calc(100%-60px),_80%_calc(100%-60px),_80%_calc(100%-20px),_75%_calc(100%-20px),_70%_calc(100%-40px),_65%_calc(100%-40px),_65%_100%,_55%_100%,_55%_calc(100%-20px),_50%_calc(100%-20px),_50%_calc(100%-50px),_45%_calc(100%-50px),_45%_calc(100%-20px),_35%_calc(100%-20px),_35%_100%,_30%_100%,_30%_calc(100%-30px),_25%_calc(100%-30px),_20%_calc(100%-60px),_15%_calc(100%-60px),_15%_calc(100%-20px),_10%_calc(100%-20px),_10%_100%,_0_100%)]">
      <video
        className=" h-full w-full absolute inset-0 -z-10 object-cover"
        preload="auto"
        muted
        loop
        playsInline
        autoPlay>
        <source src="/bgVideo.mp4" type="video/mp4" />
      </video>
      <div className=" absolute top-[30%] left-[7%] text-gray-300">
        <p className=" tracking-tight  flex  items-center text-2xl md:text-5xl lg:text-7xl mb-2 ">
          <img src={logo} className="w-18 md:w-24 lg:w-48" />{" "}
          <span className="-ml-5 md:-ml-7 lg:-ml-13 ">Etrics WorkSpace</span>
        </p>
        <span className="text-lg md:text-2xl lg:text-3xl md:pl-7 pl-5  ">
          Flowless Project Management
        </span>
        <p className=" pl-5 md:pl-7 text-sm md:text-[0.95rem] lg:text-lg max-w-[600px] md:max-w-[450px] mt-6">
          Welcome to Metrics! A powerful project management and collaboration
          platform for developers. Register your organization, create a team ,
          and start working together today.
        </p>
      </div>
      <div>
        
      </div>
    </section>
  );
};

export default Hero;
