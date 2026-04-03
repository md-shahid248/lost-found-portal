const User = require('../models/User');
const Item = require('../models/Item');

/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/stats
 * @access  Admin
 */
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalItems, lostItems, foundItems, resolvedItems, reportedItems] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        Item.countDocuments(),
        Item.countDocuments({ status: 'lost', resolved: false }),
        Item.countDocuments({ status: 'found', resolved: false }),
        Item.countDocuments({ resolved: true }),
        Item.countDocuments({ reportCount: { $gt: 0 } }),
      ]);

    // Recent activity
    const recentItems = await Item.find()
      .populate('userId', 'name email')
      .sort('-createdAt')
      .limit(5);

    res.json({
      success: true,
      stats: { totalUsers, totalItems, lostItems, foundItems, resolvedItems, reportedItems },
      recentItems,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Admin
 */
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { current: parseInt(page), total: Math.ceil(total / parseInt(limit)), count: total },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user active status
 * @route   PUT /api/admin/users/:id/toggle
 * @access  Admin
 */
exports.toggleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot deactivate admin' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? 'User activated' : 'User deactivated',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all items for admin
 * @route   GET /api/admin/items
 * @access  Admin
 */
exports.getAllItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, reported } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (reported === 'true') filter.reportCount = { $gt: 0 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('userId', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Item.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { current: parseInt(page), total: Math.ceil(total / parseInt(limit)), count: total },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle item visibility
 * @route   PUT /api/admin/items/:id/visibility
 * @access  Admin
 */
exports.toggleItemVisibility = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    item.isVisible = !item.isVisible;
    item.reportCount = 0; // Clear reports when reviewed
    await item.save();

    res.json({
      success: true,
      message: item.isVisible ? 'Item restored' : 'Item hidden',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete item (admin)
 * @route   DELETE /api/admin/items/:id
 * @access  Admin
 */
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item permanently deleted' });
  } catch (error) {
    next(error);
  }
};
