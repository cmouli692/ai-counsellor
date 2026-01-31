import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function LockUniversity() {
  const navigate = useNavigate();

  const lock = async () => {
    await api.post("/universities/lock");
    navigate("/applications");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Lock a University</h2>
      <button onClick={lock} className="w-full bg-red-600 text-white py-3 rounded">
        Lock Selected University
      </button>
    </div>
  );
}
