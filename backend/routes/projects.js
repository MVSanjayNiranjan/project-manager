const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// GET /api/projects - Get all projects for logged-in user (owned or member)
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({ 
      $or: [{ owner: req.user._id }, { members: req.user._id }] 
    })
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/projects/:id - Get single project with tasks
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Get all tasks for this project
    const tasks = await Task.find({ project: project._id })
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ project, tasks });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/projects - Create new project
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, members } = req.body;
    const project = await Project.create({
      title, description,
      owner: req.user._id,
      members: members || []
    });
    res.status(201).json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/projects/:id - Update project
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // Only owner can update
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    
    Object.assign(project, req.body);
    await project.save();
    res.json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    
    // Delete all tasks in this project
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project and all tasks deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
