import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [stage, setStage] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const login = async ({ token, user }) => {
    localStorage.setItem("token", token);
    setUser(user);
    await loadStage();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setStage(null);
    setProfileComplete(false);
  };

  const loadStage = async () => {
    try {
      const stageRes = await api.get("/stage");
    const stageObj = stageRes.data.stage;
const stageNumber = stageObj?.stage_number || 1;

setStage(stageNumber);
setProfileComplete(stageNumber > 1);

    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) loadStage();
    else setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        stage,
        profileComplete,
        loading,
        login,
        logout,
        reloadStage: loadStage
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
