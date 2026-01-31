import api from "../api/axios";

export default function UniversityCard({ uni }) {
  const shortlist = async () => {
    await api.post(`/universities/${uni.id}/shortlist`);
    alert("University shortlisted");
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <h3 className="text-lg font-semibold">{uni.name}</h3>

      <p className="text-sm text-gray-600">{uni.country}</p>

      <div className="mt-2 text-sm">
        <p>💰 Cost: ${uni.costPerYear}/year</p>
        <p>📊 Acceptance Chance: {uni.chance}%</p>
        <p>
          ⚠️ Risk:
          <span
            className={`ml-1 font-medium ${
              uni.risk === "High"
                ? "text-red-600"
                : uni.risk === "Medium"
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {uni.risk}
          </span>
        </p>
      </div>

      <button
        onClick={shortlist}
        className="mt-4 w-full bg-black text-white py-2 rounded"
      >
        Shortlist
      </button>
    </div>
  );
}
