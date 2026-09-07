import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";
import api from "../lib/api";
import BrandLogo from "../components/BrandLogo";
import Footer from "../components/Footer";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setStatus("success");
      setMessage(res.message || "Password reset link sent to your email.");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(err.body?.message || "Failed to send reset link.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050506] text-white p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[440px] z-10">
        <div className="text-center mb-8">
          <BrandLogo
            to="/"
            className="justify-center mb-4"
            imageClassName="h-12 sm:h-14 md:h-16"
          />
          <h2 className="text-3xl font-extrabold tracking-tight">
            Reset password
          </h2>
          <p className="text-gray-400 mt-2">
            Enter your email to receive a reset link
          </p>
        </div>

        <div className="bg-[#0b0b0d] border border-white/5 p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
          {status === "success" ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Check your email</h3>
              <p className="text-sm text-gray-400 mb-6">{message}</p>
              <Link
                to="/login"
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold bg-white text-black hover:bg-gray-200 focus:outline-none transition-all">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              {status === "error" && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                  {message}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!email || status === "loading"}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold bg-white text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0b0d] focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {status === "loading" ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          <Link
            to="/login"
            className="inline-flex items-center font-medium text-white hover:text-gray-300 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to sign in
          </Link>
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;

