import React, { createContext, ReactNode, useState } from "react";

export type EditContextType = {
  isEditOpen: boolean;
  setIsEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const EditContext = createContext<EditContextType | undefined>(
  undefined
);

// export const IsEditOpenContext = createContext<boolean>(false);
// export const SetIsEditOpenContext = createContext<React.Dispatch<boolean>>(() => {});

export const EditProvider = ({ children }: { children: ReactNode }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <EditContext.Provider value={{ isEditOpen, setIsEditOpen }}>
      {children}
    </EditContext.Provider>
  );
};
