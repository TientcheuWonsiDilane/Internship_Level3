import React from "react";

const ModalContext = React.createContext(null);

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = React.useState(null);

  const showModal = (component, props = {}) => setModal({ component, props });
  const closeModal = () => setModal(null);

  return (
    <ModalContext.Provider value={{ modal, showModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => React.useContext(ModalContext);

export default ModalContext;
