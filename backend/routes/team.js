import express from 'express';
import TeamMember from '../models/TeamMember.js';
import Task from '../models/Task.js';

const router = express.Router();

// GET /api/team - List members with task counts
router.get('/', async (req, res) => {
  try {
    const members = await TeamMember.find();
    const membersWithCounts = await Promise.all(
      members.map(async (member) => {
        // Count actual tasks assigned to this member
        const taskCount = await Task.countDocuments({ assignedTo: member._id });
        return {
          _id: member._id,
          name: member.name,
          assignedTasks: member.assignedTasks || [],
          taskCount: taskCount
        };
      })
    );
    res.json(membersWithCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/team - Add member
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Member name is required' });
    }
    const member = new TeamMember({ name });
    await member.save();
    
    // Return member with taskCount (0 for new members)
    const taskCount = await Task.countDocuments({ assignedTo: member._id });
    res.status(201).json({
      _id: member._id,
      name: member.name,
      assignedTasks: member.assignedTasks || [],
      taskCount: taskCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

