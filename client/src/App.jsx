import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Counsellor from "./pages/Counsellor";
import Universities from "./pages/Universities";
import LockUniversity from "./pages/LockUniversity";
import Applications from "./pages/Applications";
import ProtectedRoute from "./routes/ProtectedRoute";
import OnboardingGuard from "./routes/OnboardingGuard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/onboarding" element={
          <ProtectedRoute><Onboarding /></ProtectedRoute>
        } />

        {/* <Route path="/dashboard" element={
          <ProtectedRoute><OnboardingGuard><Dashboard /></OnboardingGuard></ProtectedRoute>
        } /> */}

        <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

        <Route path="/counsellor" element={
          <ProtectedRoute><OnboardingGuard><Counsellor /></OnboardingGuard></ProtectedRoute>
        } />

        <Route path="/universities" element={
          <ProtectedRoute><OnboardingGuard><Universities /></OnboardingGuard></ProtectedRoute>
        } />

        <Route path="/lock" element={
          <ProtectedRoute><OnboardingGuard><LockUniversity /></OnboardingGuard></ProtectedRoute>
        } />

        <Route path="/applications" element={
          <ProtectedRoute><OnboardingGuard><Applications /></OnboardingGuard></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
