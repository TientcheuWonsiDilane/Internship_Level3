import React, { useState } from "react";
import api from "../../lib/api";
import { ArrowRight, ArrowLeft, CheckCircle, Mail, Shield } from "lucide-react";

const InviteMemberModal = ({ close }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("developer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/invitations", { email, role });
      setStep(4);
    } catch (e) {
      setError(e.body?.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white p-2">
      <h3 className="text-2xl font-bold mb-1">Invite Member</h3>
      <p className="text-sm text-gray-400 mb-6">Send an invitation to collaborate</p>

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
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b0b0d] border border-white/10 focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all outline-none"
                  autoFocus
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Shield className="h-5 w-5" />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b0b0d] border border-white/10 focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all outline-none appearance-none"
                >
                  <option value="developer">Developer</option>
                  <option value="team_head">Team Head</option>
                </select>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {role === "developer" ? "Can view and contribute to assigned projects." : "Has full access to manage projects and team settings."}
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-1">Review Details</h4>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Email</span>
                  <span className="font-bold text-white">{email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Role</span>
                  <span className="px-2 py-1 bg-white/5 rounded-md text-gray-300 capitalize text-xs">
                    {role.replace('_', ' ')}
                  </span>
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
            <h4 className="text-xl font-bold mb-2">Invitation Sent!</h4>
            <p className="text-gray-400 text-sm">An email has been sent to {email}.</p>
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
              disabled={loading || (step === 1 && !email)}
              onClick={step === 3 ? submit : () => setStep(step + 1)}
              className="px-6 py-2 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : step === 3 ? "Send Invite" : <>Next <ArrowRight className="w-4 h-4"/></>}
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

export default InviteMemberModal;
