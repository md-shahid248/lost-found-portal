const express = require('express');
const router = express.Router();
const {
  getItems, searchItems, getItem, createItem, updateItem,
  deleteItem, getMyItems, resolveItem, reportItem,
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', getItems);
router.get('/search', searchItems);
router.get('/my-items', protect, getMyItems);
router.get('/:id', getItem);

// Protected routes
router.post('/', protect, upload.single('image'), createItem);
router.put('/:id', protect, upload.single('image'), updateItem);
router.delete('/:id', protect, deleteItem);
router.put('/:id/resolve', protect, resolveItem);
router.post('/:id/report', protect, reportItem);

module.exports = router;
