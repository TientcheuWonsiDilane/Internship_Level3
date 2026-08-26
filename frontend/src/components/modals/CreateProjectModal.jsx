import React, { useState } from "react";
import api from "../../lib/api";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const CreateProjectModal = ({ close }) => {
  const { currentTeam, refreshProjects } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/projects", { name, slug, description: desc, teamId: currentTeam });
      await refreshProjects(currentTeam);
      setStep(4);
    } catch (e) {
      setError(e.body?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (val) => {
    setName(val);
    if (step === 1) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  };

  return (
    <div className="text-white p-2">
      <h3 className="text-2xl font-bold mb-1">Create Project</h3>
      <p className="text-sm text-gray-400 mb-6">Initialize a new project in your workspace</p>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? "bg-white" : "bg-white/10"}`} />
        ))}
      </div>

      <div className="min-h-[220px]">
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">{error}</div>}

        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Project Name</label>
              <input
                value={name}
                onChange={(e) => generateSlug(e.target.value)}
                placeholder="e.g. Titan Integration"
                className="w-full px-4 py-2.5 rounded-xl bg-[#0b0b0d] border border-white/10 focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all outline-none"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Project Slug (URL friendly)</label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-gray-500 text-sm">/projects/</span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="titan-integration"
                  className="w-full px-4 py-2.5 rounded-r-xl bg-[#0b0b0d] border border-white/10 focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description (Optional)</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Briefly describe what this project is about..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0b0b0d] border border-white/10 focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all outline-none resize-none"
                autoFocus
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-1">Review Details</h4>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Slug</span>
                  <span className="font-bold text-white">{slug}</span>
                </div>
                <div className="flex flex-col mt-2">
                  <span className="text-gray-500 mb-1">Description</span>
                  <span className="text-gray-300 line-clamp-3 bg-[#0b0b0d] p-3 rounded-lg border border-white/5">{desc || "No description provided."}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center text-center py-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold mb-2">Project Created!</h4>
            <p className="text-gray-400 text-sm">Your project '{name}' is ready to go.</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-white/10 flex justify-between">
        {step < 4 ? (
          <>
            <button
              onClick={step === 1 ? close : () => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
            >
              {step === 1 ? "Cancel" : <><ArrowLeft className="w-4 h-4"/> Back</>}
            </button>
            <button
              disabled={loading || (step === 1 && (!name || !slug))}
              onClick={step === 3 ? submit : () => setStep(step + 1)}
              className="px-6 py-2 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : step === 3 ? "Create Project" : <>Next <ArrowRight className="w-4 h-4"/></>}
            </button>
          </>
        ) : (
          <button
            onClick={close}
            className="w-full px-6 py-2.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-200 transition-all hover:opacity-90"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateProjectModal;
