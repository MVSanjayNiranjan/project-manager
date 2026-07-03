import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", members: [] });
  const [error, setError] = useState("");

  useEffect(() => { if (!user) navigate("/login"); }, [user, navigate]);

  const fetchProjects = () => API.get("/projects").then(r => setProjects(r.data)).catch(() => {});

  useEffect(() => {
    fetchProjects();
    API.get("/users").then(r => setAllUsers(r.data)).catch(() => {});
  }, []);

  // Calculate progress for a project based on its task counts
  // We store taskStats on each project when we fetch them with a separate call
  const [taskStats, setTaskStats] = useState({});

  useEffect(() => {
    // Fetch task stats for each project
    projects.forEach(async (p) => {
      try {
        const { data } = await API.get(`/projects/${p._id}`);
        const tasks = data.tasks;
        const total = tasks.length;
        const done = tasks.filter(t => t.status === "done").length;
        setTaskStats(prev => ({ ...prev, [p._id]: { total, done } }));
      } catch {}
    });
  }, [projects]);

  const handleSubmit = async e => {
    e.preventDefault(); setError("");
    try {
      await API.post("/projects", form);
      setForm({ title: "", description: "", members: [] });
      setShowForm(false);
      fetchProjects();
    } catch (err) { setError(err.response?.data?.message || "Failed to create project"); }
  };

  const handleMemberToggle = (userId) => {
    setForm(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  return (
    <div className="page">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
        <h2>My Projects</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Project"}
        </button>
      </div>

      {/* New project form */}
      {showForm && (
        <div className="card" style={{marginTop:20}}>
          <h3 style={{marginBottom:14}}>Create Project</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Project Title</label><input value={form.title} onChange={e => setForm({...form,title:e.target.value})} required /></div>
            <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="What is this project about?" /></div>
            <div className="form-group">
              <label>Add Team Members</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:6}}>
                {allUsers.filter(u => u._id !== user._id).map(u => (
                  <label key={u._id} style={{display:"flex",alignItems:"center",gap:6,background:form.members.includes(u._id)?"#dbeafe":"#f1f5f9",padding:"4px 10px",borderRadius:20,cursor:"pointer",fontSize:13}}>
                    <input type="checkbox" checked={form.members.includes(u._id)} onChange={() => handleMemberToggle(u._id)} style={{width:"auto"}} />
                    {u.name}
                  </label>
                ))}
                {allUsers.filter(u => u._id !== user._id).length === 0 && <p style={{fontSize:13,color:"#94a3b8"}}>No other users yet.</p>}
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Create Project</button>
          </form>
        </div>
      )}

      {/* Projects grid */}
      {projects.length === 0 && !showForm && (
        <div className="card" style={{marginTop:24,textAlign:"center",padding:40}}>
          <p style={{color:"#94a3b8"}}>No projects yet. Create your first one!</p>
        </div>
      )}
      <div className="project-grid">
        {projects.map(p => {
          const stats = taskStats[p._id] || { total: 0, done: 0 };
          const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
          return (
            <div className="project-card" key={p._id} onClick={() => navigate(`/projects/${p._id}`)}>
              <h3>{p.title}</h3>
              <p>{p.description || "No description"}</p>
              <div style={{fontSize:12,color:"#94a3b8",marginBottom:8}}>
                {stats.total} tasks - {stats.done} done
              </div>
              {/* Progress bar */}
              <div className="progress-wrap">
                <div className="progress-bar" style={{width:`${pct}%`}} />
              </div>
              <div style={{fontSize:12,color:"#2563eb",fontWeight:600,marginTop:4}}>{pct}% complete</div>
              <div style={{fontSize:12,color:"#94a3b8",marginTop:8}}>
                Owner: {p.owner?.name} - {p.members?.length} member(s)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Dashboard;
