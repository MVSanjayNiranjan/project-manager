import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import { useAuth } from "../context/AuthContext";

const statusCols = [
  { key: "todo",       label: "To Do" },
  { key: "inprogress", label: "In Progress" },
  { key: "done",       label: "Done" },
];

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null); // task being edited
  const [form, setForm] = useState({ title:"", description:"", assignee:"", deadline:"", status:"todo" });
  const [error, setError] = useState("");

  useEffect(() => { if (!user) navigate("/login"); }, [user, navigate]);

  const fetchData = async () => {
    try {
      const { data } = await API.get(`/projects/${id}`);
      setProject(data.project);
      setTasks(data.tasks);
    } catch { navigate("/dashboard"); }
  };

  useEffect(() => {
    fetchData();
    API.get("/users").then(r => setAllUsers(r.data)).catch(() => {});
  }, [id]);

  const resetForm = () => { setForm({ title:"", description:"", assignee:"", deadline:"", status:"todo" }); setEditTask(null); setShowForm(false); setError(""); };

  const handleSubmit = async e => {
    e.preventDefault(); setError("");
    try {
      if (editTask) {
        await API.put(`/tasks/${editTask._id}`, form);
      } else {
        await API.post("/tasks", { ...form, project: id });
      }
      resetForm();
      fetchData();
    } catch (err) { setError(err.response?.data?.message || "Failed"); }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    await API.delete(`/tasks/${taskId}`);
    fetchData();
  };

  const handleStatusChange = async (task, newStatus) => {
    await API.put(`/tasks/${task._id}`, { status: newStatus });
    fetchData();
  };

  const startEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description,
      assignee: task.assignee?._id || "",
      deadline: task.deadline ? task.deadline.slice(0,10) : "",
      status: task.status,
    });
    setEditTask(task);
    setShowForm(true);
    window.scrollTo(0,0);
  };

  // Progress calculation
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "done").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  if (!project) return <div className="page"><p>Loading...</p></div>;

  return (
    <div className="page">
      {/* Project header */}
      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
          <div>
            <h2>{project.title}</h2>
            <p style={{color:"#64748b",marginTop:4}}>{project.description}</p>
            <p style={{fontSize:13,color:"#94a3b8",marginTop:6}}>
              Owner: {project.owner?.name} - Members: {project.members?.map(m => m.name).join(", ") || "None"}
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard")}>Back</button>
        </div>

        {/* Progress bar */}
        <div style={{marginTop:16}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
            <span style={{color:"#64748b"}}>{done} of {total} tasks done</span>
            <span style={{color:"#2563eb",fontWeight:600}}>{pct}%</span>
          </div>
          <div className="progress-wrap">
            <div className="progress-bar" style={{width:`${pct}%`}} />
          </div>
        </div>
      </div>

      {/* Add / Edit task form */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3>Tasks</h3>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm && !editTask ? "Cancel" : "+ Add Task"}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h4 style={{marginBottom:14}}>{editTask ? "Edit Task" : "New Task"}</h4>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div className="form-group" style={{gridColumn:"1/-1"}}>
                <label>Task Title</label>
                <input value={form.title} onChange={e => setForm({...form,title:e.target.value})} required />
              </div>
              <div className="form-group" style={{gridColumn:"1/-1"}}>
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} />
              </div>
              <div className="form-group">
                <label>Assignee</label>
                <select value={form.assignee} onChange={e => setForm({...form,assignee:e.target.value})}>
                  <option value="">Unassigned</option>
                  {allUsers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm({...form,deadline:e.target.value})} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({...form,status:e.target.value})}>
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button type="submit" className="btn btn-primary btn-sm">{editTask ? "Save Changes" : "Add Task"}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Task board — 3 columns */}
      {tasks.length === 0 && <p style={{color:"#94a3b8",marginTop:12}}>No tasks yet. Add your first task above.</p>}
      <div className="task-board">
        {statusCols.map(col => (
          <div className="task-column" key={col.key}>
            <h4>{col.label} ({tasks.filter(t => t.status === col.key).length})</h4>
            {tasks.filter(t => t.status === col.key).map(task => (
              <div className="task-card" key={task._id}>
                <h5>{task.title}</h5>
                {task.description && <p>{task.description.slice(0,60)}{task.description.length>60?"...":""}</p>}
                {task.assignee && <p>Assigned to: {task.assignee.name}</p>}
                {task.deadline && <p>Due: {new Date(task.deadline).toLocaleDateString()}</p>}
                {/* Quick status changer */}
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
                  {statusCols.filter(s => s.key !== task.status).map(s => (
                    <button key={s.key} className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(task, s.key)}>
                      Move to {s.label}
                    </button>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={() => startEdit(task)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task._id)}>Del</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
export default ProjectDetail;
