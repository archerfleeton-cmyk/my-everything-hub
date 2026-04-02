import { createContext, useContext, useState, ReactNode } from "react";

interface EditModeContextType {
  editMode: boolean;
  toggleEditMode: () => void;
}

const EditModeContext = createContext<EditModeContextType>({ editMode: false, toggleEditMode: () => {} });

export const useEditMode = () => useContext(EditModeContext);

export const EditModeProvider = ({ children }: { children: ReactNode }) => {
  const [editMode, setEditMode] = useState(false);
  return (
    <EditModeContext.Provider value={{ editMode, toggleEditMode: () => setEditMode((v) => !v) }}>
      {children}
    </EditModeContext.Provider>
  );
};
