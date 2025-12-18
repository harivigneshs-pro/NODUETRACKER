import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  // 🔹 Auto-redirect if already logged in
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "student") navigate("/student/dashboard");
    if (role === "teacher") navigate("/teacher/dashboard");
    if (role === "admin") navigate("/admin/dashboard");
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      const { token, user } = res.data;

      // 🔹 Save token, role, and name for future use
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("name", user.name);

      // 🔹 Redirect based on role
      switch (user.role) {
        case "student":
          navigate("/student/dashboard");
          break;
        case "teacher":
          navigate("/teacher/dashboard");
          break;
        case "admin":
          navigate("/admin/dashboard");
          break;
        default:
          alert("Unknown role");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">
          No Due Tracker
        </h2>

        <p className="text-center text-sm text-gray-500">
          Sign in to continue
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            placeholder="example@email.com"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Password
          </label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
        >
          Login
        </button>

        <p className="text-center text-xs text-gray-400">
          © 2025 No Due Tracker
        </p>
      </form>
    </div>
  );
};

export default Login;
