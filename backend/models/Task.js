const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  // Which project this task belongs to
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  // User assigned to this task
  assignee:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  deadline:    { type: Date, default: null },
  // status: "todo" | "inprogress" | "done"
  status:      { type: String, enum: ['todo', 'inprogress', 'done'], default: 'todo' },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
