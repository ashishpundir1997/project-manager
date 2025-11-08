import express from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

const router = express.Router();

// Helper function to calculate and update project progress
const updateProjectProgress = async (projectId) => {
  const tasks = await Task.find({ projectId });
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const status = progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started';

  await Project.findByIdAndUpdate(projectId, { progress, status });
  return { progress, status };
};

// GET /api/projects - List all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().populate('tasks').sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/projects - Add new project
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    const project = new Project({ name });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res) => {
  try {
    const { name, status, progress } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (status) updateData.status = status;
    if (progress !== undefined) updateData.progress = progress;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ projectId: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router, updateProjectProgress };

