const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStats, getUsers, toggleUser, getAllItems,
  toggleItemVisibility, deleteItem,
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUser);
router.get('/items', getAllItems);
router.put('/items/:id/visibility', toggleItemVisibility);
router.delete('/items/:id', deleteItem);

module.exports = router;
