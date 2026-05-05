const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.get('/dashboard', protect, getDashboardStats);
router.route('/').get(protect, getTasks).post(protect, adminOnly, createTask);
router.route('/:id').get(protect, getTaskById).put(protect, updateTask).delete(protect, adminOnly, deleteTask);

module.exports = router;
