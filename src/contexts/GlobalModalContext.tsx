'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Size {
  id: string;
  name: string;
  dimensions?: string;
  price_adjustment?: number;
}

interface FrameType {
  id: string;
  name: string;
  material?: string;
  price_adjustment?: number;
}

interface ModalData {
  product: any;
  frameTypes: FrameType[];
  sizes: Size[];
  pauseCarousel?: () => void;
  resumeCarousel?: () => void;
}

interface GlobalModalContextType {
  isModalOpen: boolean;
  modalData: ModalData | null;
  openModal: (data: ModalData) => void;
  closeModal: () => void;
}

const GlobalModalContext = createContext<GlobalModalContextType | undefined>(undefined);

export const useGlobalModal = () => {
  const context = useContext(GlobalModalContext);
  if (!context) {
    throw new Error('useGlobalModal must be used within a GlobalModalProvider');
  }
  return context;
};

interface GlobalModalProviderProps {
  children: ReactNode;
}

export const GlobalModalProvider: React.FC<GlobalModalProviderProps> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  const openModal = (data: ModalData) => {
    setModalData(data);
    setIsModalOpen(true);

    // Pause carousel if function is provided
    if (data.pauseCarousel) {
      data.pauseCarousel();
    }
  };

  const closeModal = () => {
    // Resume carousel if function is provided
    if (modalData?.resumeCarousel) {
      modalData.resumeCarousel();
    }

    setIsModalOpen(false);
    setModalData(null);
  };

  return (
    <GlobalModalContext.Provider value={{
      isModalOpen,
      modalData,
      openModal,
      closeModal
    }}>
      {children}
    </GlobalModalContext.Provider>
  );
};
