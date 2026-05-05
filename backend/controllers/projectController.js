const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Team = require('../models/Team');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  try {
    const { title, description, deadline, members, teams } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Project title is required' });
    }

    const project = await Project.create({
      title,
      description,
      deadline,
      members: members || [],
      teams: teams || [],
      createdBy: req.user._id,
    });

    const populated = await Project.findById(project._id)
      .populate('members', 'name email role')
      .populate('teams', 'name')
      .populate('createdBy', 'name email');

    res.status(201).json({ success: true, message: 'Project created successfully', project: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let query = {};

    if (req.user.role !== 'admin') {
      // Find teams the user belongs to
      const userTeams = await Team.find({ members: req.user._id });
      const teamIds = userTeams.map(t => t._id);

      query = {
        $or: [
          { members: req.user._id },
          { teams: { $in: teamIds } }
        ]
      };
    }

    const projects = await Project.find(query)
      .populate('members', 'name email role')
      .populate('teams', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email role')
      .populate('teams', 'name members')
      .populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Members can only view their own projects or projects assigned to their teams
    if (req.user.role !== 'admin') {
      const userTeams = await Team.find({ members: req.user._id });
      const teamIds = userTeams.map(t => t._id.toString());
      
      const isInMembers = project.members.some((m) => m._id.equals(req.user._id));
      const isInTeams = project.teams.some((t) => teamIds.includes(t._id.toString()));

      if (!isInMembers && !isInTeams) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('members', 'name email role')
      .populate('teams', 'name')
      .populate('createdBy', 'name email');

    res.status(200).json({ success: true, message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await Task.deleteMany({ projectId: req.params.id });
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Project and associated tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private/Admin
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.members.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User is already a member' });
    }

    project.members.push(userId);
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('members', 'name email role')
      .populate('teams', 'name')
      .populate('createdBy', 'name email');

    res.status(200).json({ success: true, message: 'Member added successfully', project: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private/Admin
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.members = project.members.filter((m) => !m.equals(req.params.userId));
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('members', 'name email role')
      .populate('teams', 'name')
      .populate('createdBy', 'name email');

    res.status(200).json({ success: true, message: 'Member removed successfully', project: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add team to project
// @route   POST /api/projects/:id/teams
// @access  Private/Admin
const addTeam = async (req, res) => {
  try {
    const { teamId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.teams.includes(teamId)) {
      return res.status(400).json({ success: false, message: 'Team is already assigned to this project' });
    }

    project.teams.push(teamId);
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('members', 'name email role')
      .populate('teams', 'name')
      .populate('createdBy', 'name email');

    res.status(200).json({ success: true, message: 'Team added successfully', project: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove team from project
// @route   DELETE /api/projects/:id/teams/:teamId
// @access  Private/Admin
const removeTeam = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.teams = project.teams.filter((t) => !t.equals(req.params.teamId));
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('members', 'name email role')
      .populate('teams', 'name')
      .populate('createdBy', 'name email');

    res.status(200).json({ success: true, message: 'Team removed successfully', project: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  createProject, 
  getProjects, 
  getProjectById, 
  updateProject, 
  deleteProject, 
  addMember, 
  removeMember,
  addTeam,
  removeTeam
};

