import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();
  return (
    <div>
      <div className="hero">
        <h1>Manage Projects. Ship Faster.</h1>
        <p>Organize tasks, track progress, and keep your team aligned.</p>
        {user ? (
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        ) : (
          <>
            <Link to="/register" className="btn btn-primary" style={{marginRight:10}}>Get Started Free</Link>
            <Link to="/login" className="btn btn-ghost" style={{color:"#fff",borderColor:"#fff"}}>Login</Link>
          </>
        )}
      </div>
      {/* Feature highlights */}
      <div className="page">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:20,marginTop:10}}>
          {[
            ["Projects","Create projects and invite team members to collaborate."],
            ["Tasks","Add tasks, set deadlines, and assign them to teammates."],
            ["Progress","Visual progress bars show how close each project is to done."],
          ].map(([title,desc]) => (
            <div className="card" key={title} style={{textAlign:"center"}}>
              <h3 style={{marginBottom:8,color:"#1e293b"}}>{title}</h3>
              <p style={{color:"#64748b",fontSize:14}}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Home;
