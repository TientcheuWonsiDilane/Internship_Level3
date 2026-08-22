import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import CreateTeamModal from "../components/modals/CreateTeamModal";

const OrganizationOnboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showModal } = useModal();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-[#07030a] text-white">
      <div className="max-w-3xl w-full p-8 bg-[#07030a] rounded-2xl">
        <h2 className="text-2xl font-semibold mb-4">
          Welcome to your organization
        </h2>
        <p className="text-gray-300 mb-6">
          Organization ID: {id}. Create your first team to get started.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => showModal(CreateTeamModal)}
            className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-md transition-colors">
            Create Team
          </button>
          <button
            onClick={() => navigate("/teams")}
            className="px-4 py-2 border border-white/10 rounded-md">
            Go to Teams
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationOnboard;
