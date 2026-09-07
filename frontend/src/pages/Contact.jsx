import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import Footer from "../components/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#050506] text-white flex flex-col pt-32 pb-16">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-white/5 rounded-full blur-[140px] pointer-events-none" />

      <main className="flex-grow flex flex-col md:flex-row gap-12 px-6 md:px-12 relative z-10 max-w-6xl mx-auto w-full">
        
        <div className="flex-1 animate-in slide-in-from-left-8 fade-in duration-700">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Touch</span>
          </h1>
          <p className="text-gray-400 text-lg mb-12 max-w-md">
            Have a question, feedback, or need support? We're here to help you make the most out of Etrics.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Email Us</h3>
                <p className="text-gray-400 mt-1">support@etrics.com</p>
                <p className="text-gray-400">sales@etrics.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Headquarters</h3>
                <p className="text-gray-400 mt-1">123 Innovation Drive</p>
                <p className="text-gray-400">Tech City, TC 94103</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 animate-in slide-in-from-right-8 fade-in duration-700">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-xl shadow-black/40">
            <h2 className="text-2xl font-semibold mb-6">Send a Message</h2>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl bg-[#0b0b0d] border border-white/10 focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#0b0b0d] border border-white/10 focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Message</label>
                <textarea
                  rows={4}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 rounded-xl bg-[#0b0b0d] border border-white/10 focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 mt-2 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-200 transition-all"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default Contact;

