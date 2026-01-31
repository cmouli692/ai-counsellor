export default function StageIndicator({ stage }) {
  const stages = [
    "Building Profile",
    "Discovering Universities",
    "Finalizing Universities",
    "Preparing Applications",
  ];

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">Current Stage</h3>
      <div className="flex gap-2">
        {stages.map((s, i) => (
          <div
            key={i}
            className={`px-3 py-1 rounded text-sm ${
              i + 1 === stage
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
