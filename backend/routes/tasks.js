const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// POST /api/tasks - Create a task inside a project
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, project, assignee, deadline, status } = req.body;
    const task = await Task.create({ title, description, project, assignee, deadline, status });
    await task.populate('assignee', 'name email');
    res.status(201).json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/tasks/:id - Update a task (status, assignee, etc.)
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    Object.assign(task, req.body);
    await task.save();
    await task.populate('assignee', 'name email');
    res.json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
