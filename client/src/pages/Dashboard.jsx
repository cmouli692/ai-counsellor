import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Dashboard() {
  const [stage, setStage] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiMessage, setAiMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [aiLoading, setAiLoading] = useState(false);

  const askCounsellor = async () => {
    if (!aiMessage.trim()) return;

    setAiLoading(true);
    try {
      const res = await api.post("/ai/counsellor", {
        message: aiMessage,
      });

      setMessages((prev) => [
        ...prev,
        { role: "user", text: aiMessage },
        { role: "ai", text: res.data.data.counsellor.message },
      ]);

      setAiMessage("");
    } catch (err) {
      alert("AI failed. Check backend.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const stageRes = await api.get("/stage");
        const meRes = await api.get("/auth/me");

        setStage(stageRes.data.stage.stage_number);
        setProfile(meRes.data.profile);
      } catch (err) {
        console.error("Dashboard load error", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stage Indicator */}
      <div className="bg-gray-100 p-4 rounded">
        <p className="font-semibold">Current Stage</p>
        <p>Stage {stage}</p>
      </div>

      {/* Profile Summary */}
      <div className="bg-gray-100 p-4 rounded">
        <p className="font-semibold">Profile Summary</p>
        <p>Name: {profile?.personal_info?.first_name || "—"}</p>
        <p>
          Target Countries:{" "}
          {profile?.preferences?.target_countries?.join(", ") || "—"}
        </p>
      </div>

      {/* Next Step */}
      <div className="bg-black text-white p-4 rounded">
        {stage === 1 && "Complete your profile"}
        {stage === 2 && "Discover universities"}
        {stage === 3 && "Finalize and lock a university"}
        {stage === 4 && "Prepare applications"}
      </div>

      {/* AI Counsellor */}
      <div className="bg-gray-50 p-4 rounded border space-y-3">
        <h2 className="font-semibold text-lg">AI Counsellor</h2>

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Ask the AI about universities, risks, next steps..."
          value={aiMessage}
          onChange={(e) => setAiMessage(e.target.value)}
        />

        <button
          onClick={askCounsellor}
          disabled={aiLoading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {aiLoading ? "Thinking..." : "Ask AI"}
        </button>

        {/* {aiResponse && (
    <div className="mt-4 space-y-2">
      <p className="font-medium">AI Response:</p>
      <p className="text-gray-800">{aiResponse.message}</p>

      <div className="text-sm text-gray-600">
        <p>Dream: {aiResponse.recommended?.dream?.length || 0}</p>
        <p>Target: {aiResponse.recommended?.target?.length || 0}</p>
        <p>Safe: {aiResponse.recommended?.safe?.length || 0}</p>
      </div>
    </div>
  )} */}
      </div>
      <div className="space-y-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              m.role === "ai"
                ? "bg-gray-100 text-gray-800"
                : "bg-black text-white"
            }`}
          >
            <strong>{m.role === "ai" ? "AI" : "You"}:</strong> {m.text}
          </div>
        ))}
      </div>
    </div>
  );
}
