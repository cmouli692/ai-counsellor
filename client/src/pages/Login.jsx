import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async () => {
    const res = await api.post("/auth/login", form);
    login(res.data);
    navigate("/dashboard");
  };

  return (
    <div className="h-screen flex items-center justify-center  bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Login</h2>

        <input
          className="input mb-3"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          className="input mb-4"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={submit}
          className="w-full bg-black text-white py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}
