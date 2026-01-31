export default function Landing() {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-3">AI Counsellor</h1>
      <p className="text-gray-600 mb-6">
        Plan your study-abroad journey with a guided AI counsellor.
      </p>
      <div className="flex gap-4">
        <a href="/signup" className="px-6 py-3 bg-black text-white rounded-lg">Get Started</a>
        <a href="/login" className="px-6 py-3 border rounded-lg">Login</a>
      </div>
    </div>
  );
}
