import api from "../api/axios";
import { useState } from "react";

export default function Counsellor() {
  const [chat, setChat] = useState("");
  const [response, setResponse] = useState("");

  const ask = async () => {
    const res = await api.post("/ai/counsellor", { message: chat });
    setResponse(res.data.reply);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <textarea className="w-full border p-3 rounded"
        placeholder="Ask the counsellor..."
        onChange={(e) => setChat(e.target.value)} />

      <button onClick={ask} className="mt-3 bg-black text-white px-4 py-2 rounded">
        Ask AI
      </button>

      {response && <div className="mt-4 p-4 bg-gray-100 rounded">{response}</div>}
    </div>
  );
}
