const Task = require('../models/Task');
const Project = require('../models/Project');
const Team = require('../models/Team');

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, team, projectId, deadline, priority } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ success: false, message: 'Title and projectId are required' });
    }

    if (!assignedTo && !team) {
      return res.status(400).json({ success: false, message: 'Either assignedTo or team is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo: assignedTo || null,
      team: team || null,
      projectId,
      deadline,
      priority: priority || 'Medium',
      createdBy: req.user._id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('team', 'name')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email');

    res.status(201).json({ success: true, message: 'Task created successfully', task: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, projectId } = req.query;
    let query = {};

    if (req.user.role !== 'admin') {
      const userTeams = await Team.find({ members: req.user._id });
      const teamIds = userTeams.map(t => t._id);

      query = {
        $or: [
          { assignedTo: req.user._id },
          { team: { $in: teamIds } }
        ]
      };
    }

    if (status) query.status = status;
    if (projectId) query.projectId = projectId;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('team', 'name')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('team', 'name members')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.user.role !== 'admin') {
      const userTeams = await Team.find({ members: req.user._id });
      const teamIds = userTeams.map(t => t._id.toString());

      const isAssignedToUser = task.assignedTo && task.assignedTo._id.equals(req.user._id);
      const isAssignedToUserTeam = task.team && teamIds.includes(task.team._id.toString());

      if (!isAssignedToUser && !isAssignedToUserTeam) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check permissions
    if (req.user.role === 'member') {
      const userTeams = await Team.find({ members: req.user._id });
      const teamIds = userTeams.map(t => t._id.toString());

      const isAssignedToUser = task.assignedTo && task.assignedTo.equals(req.user._id);
      const isAssignedToUserTeam = task.team && teamIds.includes(task.team.toString());

      if (!isAssignedToUser && !isAssignedToUserTeam) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      // Members can only update the status
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'Members can only update task status' });
      }
      task.status = status;
      await task.save();
    } else {
      await Task.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
    }

    const updated = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('team', 'name')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email');

    res.status(200).json({ success: true, message: 'Task updated successfully', task: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    let query = {};

    if (req.user.role !== 'admin') {
      const userTeams = await Team.find({ members: req.user._id });
      const teamIds = userTeams.map(t => t._id);

      query = {
        $or: [
          { assignedTo: req.user._id },
          { team: { $in: teamIds } }
        ]
      };
    }

    const [total, completed, pending, inProgress, overdue, myTasks, totalTeams, tasksPerTeam] = await Promise.all([
      Task.countDocuments(query),
      Task.countDocuments({ ...query, status: 'Completed' }),
      Task.countDocuments({ ...query, status: 'Pending' }),
      Task.countDocuments({ ...query, status: 'In Progress' }),
      Task.countDocuments({ ...query, status: { $ne: 'Completed' }, deadline: { $lt: now } }),
      Task.find(query)
        .populate('projectId', 'title')
        .populate('assignedTo', 'name email')
        .populate('team', 'name')
        .sort({ deadline: 1 })
        .limit(5),
      Team.countDocuments(),
      req.user.role === 'admin' ? Task.aggregate([
        { $match: { team: { $ne: null } } },
        { $group: { _id: '$team', count: { $sum: 1 } } },
        { $lookup: { from: 'teams', localField: '_id', foreignField: '_id', as: 'teamInfo' } },
        { $unwind: '$teamInfo' },
        { $project: { name: '$teamInfo.name', count: 1 } }
      ]) : []
    ]);

    res.status(200).json({
      success: true,
      stats: { total, completed, pending, inProgress, overdue, totalTeams },
      myTasks,
      tasksPerTeam
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask, getDashboardStats };

