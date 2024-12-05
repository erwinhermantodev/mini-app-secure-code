import React, { useEffect, useState } from "react";
import { User, Mail, Save, LogOut } from "lucide-react";
import { getUserProfile, updateUserProfile } from "../../services/api";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  // Simulated authentication and API calls
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setHasMounted(true);
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      console.log("token");
      console.log(token);
      if (token) {
        // Simulated profile fetch
        setIsLoading(true);
        try {
          // Simulate API call
          const userProfile = await getUserProfile(token);
          setProfile(userProfile);
        } catch (error) {
          navigate("/login");
          setMessage("Failed to fetch profile");
        } finally {
          setIsLoading(false);
        }
      } else {
        navigate("/login");
      }
    };
    fetchProfile();
  }, [token]);

  if (!hasMounted) {
    return null; // Prevent rendering on the server
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Call the updateUserProfile function from the API service
        await updateUserProfile(token, profile.name, profile.email);
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile");
      }
    } catch (error) {
      setMessage("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Simulate logout process
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Clear token from local storage and reset state
      localStorage.removeItem("token");
      navigate("/login");
      setToken("");
      setProfile({ name: "", email: "" });
      setIsLoggedIn(false);
    } catch (error) {
      setMessage("Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  // If not logged in, simulate redirect to login
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">You have been logged out</h2>
          <p className="mb-6">Redirecting to login page...</p>
          <div className="animate-pulse">
            <svg
              className="mx-auto h-10 w-10 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6 space-y-6">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
          <p className="text-gray-600 mt-2">Manage your personal information</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            {/* Unsafe rendering of profile name with styling */}
            <div>
              User input: <span id="user-input"></span>
            </div>
            <script>
              const userInput = "<script>alert('XSS Attack!');</script>";
              document.getElementById('user-input').innerHTML = userInput;
            </script>

            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>

          {message && (
            <div
              className={`
              p-3 rounded-md text-sm 
              ${
                message.includes("successfully")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }
            `}
            >
              {message}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-2 px-4 
                bg-blue-600 text-white 
                rounded-md 
                hover:bg-blue-700 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                flex items-center justify-center
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-300
              "
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Update Profile
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoading}
              className="
                w-full py-2 px-4 
                bg-red-600 text-white 
                rounded-md 
                hover:bg-red-700 
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                flex items-center justify-center
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-300
              "
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <>
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
