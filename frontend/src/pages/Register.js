import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault(); setError("");
    try {
      const { data } = await API.post("/auth/register", form);
      login(data);
      navigate("/dashboard");
    } catch (err) { setError(err.response?.data?.message || "Registration failed"); }
  };
  return (
    <div className="auth-wrapper">
      <h2>Create your account</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Full Name</label><input name="name" value={form.name} onChange={handleChange} required /></div>
        <div className="form-group"><label>Email</label><input name="email" type="email" value={form.email} onChange={handleChange} required /></div>
        <div className="form-group"><label>Password</label><input name="password" type="password" value={form.password} onChange={handleChange} required /></div>
        <button type="submit" className="btn btn-primary" style={{width:"100%"}}>Create Account</button>
      </form>
      <p style={{marginTop:16,textAlign:"center",fontSize:14}}>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};
export default Register;
