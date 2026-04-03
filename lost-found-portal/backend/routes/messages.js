const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { sendMessage, getMessages, getUnreadCount } = require('../controllers/messageController');

router.use(protect);
router.get('/', getMessages);
router.post('/', sendMessage);
router.get('/unread-count', getUnreadCount);

module.exports = router;
