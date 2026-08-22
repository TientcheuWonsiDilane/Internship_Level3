import React from "react";
import { useModal } from "../context/ModalContext";

const ModalHost = () => {
  const { modal, closeModal } = useModal();
  if (!modal) return null;
  const Component = modal.component;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-w-2xl w-full p-4">
        <div className="bg-white dark:bg-[#0b0710] text-black dark:text-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4">
            <Component {...modal.props} close={closeModal} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalHost;
