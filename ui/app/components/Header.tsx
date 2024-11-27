import React from "react";
import { Link } from "@remix-run/react";

const Header: React.FC = () => {
  return (
    <header className="header">
      <nav>
        <Link to="/" className="logo">
          MyApp
        </Link>
        <div className="nav-links">
          <Link to="/profile">Profile</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
