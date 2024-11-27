import React, { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { loginUser } from "../services/api";
import { useAuth } from "../context/authContext";
import Button from "../components/Button";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await loginUser({ email, password });
      setToken(token); // Updates token in context and localStorage
      navigate("/");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error("Login failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-500"
            />
          </div>
          <Button
            type="submit"
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring focus:ring-blue-300 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
