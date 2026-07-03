const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  // The user who created this project
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Team members who can be assigned tasks
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
