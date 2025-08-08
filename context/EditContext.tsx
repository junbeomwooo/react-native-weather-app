import React, { createContext, ReactNode, useState } from "react";

export type EditContextType = {
  isEditOpen: boolean;
  setIsEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  textInputPressIn: boolean;
  setTextInputPressIn: React.Dispatch<React.SetStateAction<boolean>>;
  searchInput: string | null;
  setSearchInput: React.Dispatch<React.SetStateAction<string | null>>;

};

export const ListContext = createContext<EditContextType | undefined>(
  undefined
);

// export const IsEditOpenContext = createContext<boolean>(false);
// export const SetIsEditOpenContext = createContext<React.Dispatch<boolean>>(() => {});

export const ListProvider = ({ children }: { children: ReactNode }) => {
  // State value for checking if user clicked edit button
  const [isEditOpen, setIsEditOpen] = useState(false);

  // State value for checking if user is focusing on textInput
  const [textInputPressIn, setTextInputPressIn] = useState(false);

  // State value for seaching input
  const [searchInput, setSearchInput] = useState<string | null>(null);

  return (
    <ListContext.Provider
      value={{
        isEditOpen,
        setIsEditOpen,
        textInputPressIn,
        setTextInputPressIn,
        searchInput,
        setSearchInput
      }}
    >
      {children}
    </ListContext.Provider>
  );
};
