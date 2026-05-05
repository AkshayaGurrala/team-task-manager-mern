const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  addTeam,
  removeTeam,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.route('/').get(protect, getProjects).post(protect, adminOnly, createProject);
router.route('/:id').get(protect, getProjectById).put(protect, adminOnly, updateProject).delete(protect, adminOnly, deleteProject);
router.route('/:id/members').post(protect, adminOnly, addMember);
router.route('/:id/members/:userId').delete(protect, adminOnly, removeMember);
router.route('/:id/teams').post(protect, adminOnly, addTeam);
router.route('/:id/teams/:teamId').delete(protect, adminOnly, removeTeam);

module.exports = router;
