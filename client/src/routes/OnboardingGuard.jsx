import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function OnboardingGuard({ children }) {
  const { profileComplete, loading } = useAuth();

  if (loading) return null;
  // return profileComplete ? children : <Navigate to="/onboarding" />;
  return children;

}
