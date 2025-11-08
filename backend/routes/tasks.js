import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import TeamMember from '../models/TeamMember.js';
import { updateProjectProgress } from './projects.js';

const router = express.Router();

// GET /api/projects/:id/tasks - List all tasks for a project
router.get('/projects/:projectId/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/projects/:id/tasks - Add task
router.post('/projects/:projectId/tasks', async (req, res) => {
  try {
    const { name, assignedTo } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Task name is required' });
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = new Task({
      projectId: req.params.projectId,
      name,
      assignedTo: assignedTo || null
    });
    await task.save();

    // Add task to project
    project.tasks.push(task._id);
    await project.save();

    // Add task to team member's assignedTasks if assigned
    if (assignedTo) {
      await TeamMember.findByIdAndUpdate(assignedTo, {
        $addToSet: { assignedTasks: task._id }
      });
    }

    // Update project progress
    const { progress, status } = await updateProjectProgress(req.params.projectId);
    const updatedProject = await Project.findById(req.params.projectId);

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name');
    res.status(201).json({ task: populatedTask, project: updatedProject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tasks/:taskId - Update task
router.put('/:taskId', async (req, res) => {
  try {
    const { name, completed, assignedTo } = req.body;
    
    // Get the current task to check previous assignment
    const currentTask = await Task.findById(req.params.taskId);
    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (completed !== undefined) updateData.completed = completed;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;

    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name');

    // Handle task assignment changes
    if (assignedTo !== undefined) {
      const oldAssignedTo = currentTask.assignedTo?.toString();
      const newAssignedTo = assignedTo || null;

      // Remove task from old team member's assignedTasks
      if (oldAssignedTo && oldAssignedTo !== newAssignedTo) {
        await TeamMember.findByIdAndUpdate(oldAssignedTo, {
          $pull: { assignedTasks: req.params.taskId }
        });
      }

      // Add task to new team member's assignedTasks
      if (newAssignedTo && oldAssignedTo !== newAssignedTo) {
        await TeamMember.findByIdAndUpdate(newAssignedTo, {
          $addToSet: { assignedTasks: req.params.taskId }
        });
      }
    }

    // Update project progress when task completion changes
    if (completed !== undefined) {
      const { progress, status } = await updateProjectProgress(task.projectId);
      const updatedProject = await Project.findById(task.projectId);
      return res.json({ task, project: updatedProject });
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tasks/:taskId - Delete task
router.delete('/:taskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const projectId = task.projectId;
    const assignedTo = task.assignedTo;

    // Remove task from project
    await Project.findByIdAndUpdate(projectId, {
      $pull: { tasks: req.params.taskId }
    });

    // Remove task from team member's assignedTasks if assigned
    if (assignedTo) {
      await TeamMember.findByIdAndUpdate(assignedTo, {
        $pull: { assignedTasks: req.params.taskId }
      });
    }

    await Task.findByIdAndDelete(req.params.taskId);

    // Update project progress
    const { progress, status } = await updateProjectProgress(projectId);
    const updatedProject = await Project.findById(projectId);

    res.json({ message: 'Task deleted successfully', project: updatedProject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

