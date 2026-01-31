import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

export default function Onboarding() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();
  const { reloadStage, user } = useAuth();

  const submit = async () => {
  try {
    await api.post("/ai/counsellor", {
      message: "User onboarding submission",

      // REQUIRED (your backend already complained about this)
      first_name: user?.email?.split("@")[0] || "Student",

      // SAFE STRUCTURED CONTEXT
      context: {
        onboarding: {
          degree: form.major || "",
          preferred_country: form.country || "",
          budget: form.budget || "",
        },
      },

      // DEFENSIVE FIELDS (won't hurt even if unused)
      source: "onboarding",
      stage: 1,
    });

    await reloadStage();
    navigate("/dashboard");
  } catch (err) {
    console.error("Onboarding error:", err.response?.data || err.message);
    alert(
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Onboarding failed (backend validation error)"
    );
  }
};


  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-4">
        Build your study abroad profile
      </h2>

      <input
        className="input"
        placeholder="Current Degree / Major"
        onChange={(e) => setForm({ ...form, major: e.target.value })}
      />

      <input
        className="input mt-3"
        placeholder="Preferred Country"
        onChange={(e) => setForm({ ...form, country: e.target.value })}
      />

      <input
        className="input mt-3"
        placeholder="Annual Budget"
        onChange={(e) => setForm({ ...form, budget: e.target.value })}
      />

      <button
        onClick={submit}
        className="mt-6 w-full bg-black text-white py-3 rounded"
      >
        Continue
      </button>
    </div>
  );
}
