import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stage, setStage] = useState(1);
  const [shortlisted, setShortlisted] = useState([]);
  const [lockedUniversity, setLockedUniversity] = useState(null);
  const [tasks, setTasks] = useState([]);

  return (
    <AppContext.Provider value={{
      user, setUser,
      profile, setProfile,
      stage, setStage,
      shortlisted, setShortlisted,
      lockedUniversity, setLockedUniversity,
      tasks, setTasks
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
