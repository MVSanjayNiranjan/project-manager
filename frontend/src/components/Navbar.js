import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/"); };
  return (
    <nav>
      <Link to="/" className="nav-brand">ProjectManager</Link>
      <div>
        {user && <Link to="/dashboard">Dashboard</Link>}
        {user ? (
          <>
            <span style={{color:"#94a3b8",marginLeft:16}}>Hi, {user.name}</span>
            <button onClick={handleLogout} className="btn btn-sm" style={{marginLeft:12,background:"#38bdf8",color:"#fff"}}>Logout</button>
          </>
        ) : (
          <><Link to="/login">Login</Link><Link to="/register">Sign Up</Link></>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
