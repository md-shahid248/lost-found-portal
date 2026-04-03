const Message = require('../models/Message');
const Item = require('../models/Item');
const User = require('../models/User');

/**
 * @desc    Send a message about an item
 * @route   POST /api/messages
 * @access  Private
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { itemId, content } = req.body;

    const item = await Item.findById(itemId).populate('userId');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    // Can't message yourself
    if (item.userId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't message yourself" });
    }

    const message = await Message.create({
      itemId,
      senderId: req.user._id,
      receiverId: item.userId._id,
      content,
    });

    await message.populate([
      { path: 'senderId', select: 'name avatar' },
      { path: 'receiverId', select: 'name avatar' },
      { path: 'itemId', select: 'title status' },
    ]);

    res.status(201).json({ success: true, message: 'Message sent!', data: message });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get messages for current user (inbox)
 * @route   GET /api/messages
 * @access  Private
 */
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    })
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar')
      .populate('itemId', 'title status image')
      .sort('-createdAt');

    // Mark received messages as read
    await Message.updateMany(
      { receiverId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unread message count
 * @route   GET /api/messages/unread-count
 * @access  Private
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      isRead: false,
    });
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};
