import logo from "../assets/logo.png";
import workspaceImg from "../assets/workspace.png";
import Button from "./Button";
const Hero = () => {
  return (
    <section className="relative overflow-hidden w-full bg-[#050506] text-white">
      <div className="max-w-8xl mx-auto px-6 py-24 lg:py-32">
        <div className="flex flex-col items-center text-center gap-6">
          <img src={logo} alt="" className="w-12 md:w-24 lg:w-48 h-auto mb-2 opacity-90" />

          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight max-w-3xl mx-auto"
            style={{ textShadow: "0 30px 120px rgba(255,255,255,0.06)" }}>
            Metrics Workspace, Flawless Project Management
          </h1>

          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
            Automated DCA & investing platform, spreading investments over time
            to reduce risk and grow wealth steadily.
          </p>

          <div className="flex items-center justify-center gap-4 mt-6">
            <Button type="white" title="Get Started" className="px-6 py-2.5" />
            <Button type="glow" title="Get a Demo" className="px-5 py-2.5" />
          </div>

          <div className="relative w-full max-w-[1200px] mt-10">
            <div
              className="absolute -left-50 -top-50 w-144 h-144 rounded-full blur-xl opacity-95 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.25) 40%, rgba(255,140,60,0) 70%)",
              }}
            />

            <div
              className="absolute -right-50 -top-50 w-144 h-144 rounded-full blur-xl opacity-90 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.25) 40%, rgba(32,255,160,0) 70%)",
              }}
            />

            <div
              className="relative mx-auto w-full"
              style={{ maxWidth: "1400px" }}>
              <div className="rounded-3xl overflow-hidden bg-[#080809] border border-white/6 shadow-[0_60px_180px_rgba(255,255,255,0.06)]">
                <img
                  src={workspaceImg}
                  alt="Workspace preview"
                  className="w-full h-auto block object-cover"
                  style={{ transform: "scale(1.02)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
