const Item = require('../models/Item');
const { cloudinary } = require('../config/cloudinary');

/**
 * @desc    Get all items (with filtering, search, pagination)
 * @route   GET /api/items
 * @access  Public
 */
exports.getItems = async (req, res, next) => {
  try {
    const {
      status,
      category,
      location,
      resolved,
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = req.query;

    const filter = { isVisible: true };

    if (status && ['lost', 'found'].includes(status)) filter.status = status;
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (resolved !== undefined) filter.resolved = resolved === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('userId', 'name email phone avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Item.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search items by text
 * @route   GET /api/items/search
 * @access  Public
 */
exports.searchItems = async (req, res, next) => {
  try {
    const { q, status, category, page = 1, limit = 12 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const filter = {
      isVisible: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
      ],
    };

    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('userId', 'name email avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Item.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      query: q,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single item
 * @route   GET /api/items/:id
 * @access  Public
 */
exports.getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      'userId',
      'name email phone avatar createdAt'
    );

    if (!item || !item.isVisible) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create item (lost or found)
 * @route   POST /api/items
 * @access  Private
 */
exports.createItem = async (req, res, next) => {
  try {
    const { title, description, category, status, location, date, contactEmail, contactPhone } =
      req.body;

    // Handle image upload
    let image = { url: '', publicId: '' };
    if (req.file) {
      if (req.file.path) {
        // Cloudinary
        image = { url: req.file.path, publicId: req.file.filename };
      } else {
        // Local storage
        image = { url: `/uploads/${req.file.filename}`, publicId: req.file.filename };
      }
    }

    const item = await Item.create({
      title,
      description,
      category,
      status,
      location,
      date: new Date(date),
      image,
      userId: req.user._id,
      contactEmail: contactEmail || req.user.email,
      contactPhone: contactPhone || req.user.phone,
    });

    const populatedItem = await item.populate('userId', 'name email avatar');

    res.status(201).json({
      success: true,
      message: `${status === 'lost' ? 'Lost' : 'Found'} item posted successfully!`,
      data: populatedItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update item
 * @route   PUT /api/items/:id
 * @access  Private (owner or admin)
 */
exports.updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Check ownership (admin can edit any)
    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this item' });
    }

    const updateData = { ...req.body };

    // Handle new image upload
    if (req.file) {
      // Delete old Cloudinary image if exists
      if (item.image.publicId) {
        try {
          await cloudinary.uploader.destroy(item.image.publicId);
        } catch (err) {
          console.log('Could not delete old image:', err.message);
        }
      }
      updateData.image = {
        url: req.file.path || `/uploads/${req.file.filename}`,
        publicId: req.file.filename,
      };
    }

    // Handle resolved status
    if (updateData.resolved === true || updateData.resolved === 'true') {
      updateData.resolvedAt = new Date();
    }

    item = await Item.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('userId', 'name email avatar');

    res.json({ success: true, message: 'Item updated successfully!', data: item });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete item
 * @route   DELETE /api/items/:id
 * @access  Private (owner or admin)
 */
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete image from Cloudinary
    if (item.image.publicId) {
      try {
        await cloudinary.uploader.destroy(item.image.publicId);
      } catch (err) {
        console.log('Could not delete image:', err.message);
      }
    }

    await item.deleteOne();

    res.json({ success: true, message: 'Item deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's items
 * @route   GET /api/items/my-items
 * @access  Private
 */
exports.getMyItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, resolved } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (resolved !== undefined) filter.resolved = resolved === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Item.find(filter).sort('-createdAt').skip(skip).limit(parseInt(limit)),
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
 * @desc    Mark item as resolved
 * @route   PUT /api/items/:id/resolve
 * @access  Private (owner)
 */
exports.resolveItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    item.resolved = !item.resolved;
    item.resolvedAt = item.resolved ? new Date() : undefined;
    await item.save();

    res.json({
      success: true,
      message: item.resolved ? '🎉 Item marked as resolved!' : 'Item marked as unresolved',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Report an item
 * @route   POST /api/items/:id/report
 * @access  Private
 */
exports.reportItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $inc: { reportCount: 1 } },
      { new: true }
    );

    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    res.json({ success: true, message: 'Item reported. Admin will review it.' });
  } catch (error) {
    next(error);
  }
};
