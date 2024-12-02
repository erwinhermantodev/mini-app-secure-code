import React from "react";
import { Link } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold">
            MyApp
          </Link>
          {isAuthenticated && (
            <nav className="ml-6">
              <Link to="/dashboard" className="mr-4 hover:text-gray-300">
                Dashboard
              </Link>
              <Link to="/profile" className="hover:text-gray-300">
                Profile
              </Link>
            </nav>
          )}
        </div>
        <div>
          {isAuthenticated ? (
            <div className="flex items-center">
              <span className="mr-4">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <div>
              <Link to="/auth/login" className="mr-4 hover:text-gray-300">
                Login
              </Link>
              <Link to="/auth/register" className="hover:text-gray-300">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
