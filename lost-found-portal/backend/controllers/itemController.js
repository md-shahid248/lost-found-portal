const Item = require('../models/Item');
const { cloudinary } = require('../config/cloudinary');

/**
 * @desc    Get all items
 * @route   GET /api/items
 */
exports.getItems = async (req, res, next) => {
  try {
    const { status, category, location, resolved, page = 1, limit = 12 } = req.query;

    const filter = { isVisible: true };

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (resolved !== undefined) filter.resolved = resolved === 'true';

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('userId', 'name email avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Item.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: total,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single item
 * @route   GET /api/items/:id
 */
exports.getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      'userId',
      'name email phone avatar'
    );

    if (!item || !item.isVisible) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create item
 * @route   POST /api/items
 */
exports.createItem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      status,
      location,
      date,
      contactEmail,
      contactPhone,
    } = req.body;

    if (!title || !category || !status || !location) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing',
      });
    }

    // ✅ Cloudinary only
    let image = null;

    if (req.file) {
      image = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    const item = await Item.create({
      title,
      description,
      category,
      status,
      location,
      date: date ? new Date(date) : new Date(),
      image,
      userId: req.user._id,
      contactEmail: contactEmail || req.user.email,
      contactPhone: contactPhone || req.user.phone,
    });

    const populated = await item.populate('userId', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Item posted successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update item
 * @route   PUT /api/items/:id
 */
exports.updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Authorization
    if (
      item.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateData = { ...req.body };

    // Handle image update
    if (req.file) {
      // delete old image
      if (item.image?.publicId) {
        await cloudinary.uploader.destroy(item.image.publicId);
      }

      updateData.image = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    // Handle resolve toggle
    if (updateData.resolved === true || updateData.resolved === 'true') {
      updateData.resolvedAt = new Date();
    }

    item = await Item.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('userId', 'name email avatar');

    res.json({
      success: true,
      message: 'Item updated',
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete item
 * @route   DELETE /api/items/:id
 */
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (
      item.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // delete image
    if (item.image?.publicId) {
      await cloudinary.uploader.destroy(item.image.publicId);
    }

    await item.deleteOne();

    res.json({
      success: true,
      message: 'Item deleted',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    My items
 * @route   GET /api/items/my-items
 */
exports.getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ userId: req.user._id }).sort('-createdAt');

    res.json({
      success: true,
      data: items,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Toggle resolve
 * @route   PUT /api/items/:id/resolve
 */
exports.resolveItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    item.resolved = !item.resolved;
    item.resolvedAt = item.resolved ? new Date() : null;

    await item.save();

    res.json({
      success: true,
      message: 'Status updated',
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Report item
 * @route   POST /api/items/:id/report
 */
exports.reportItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $inc: { reportCount: 1 } },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({
      success: true,
      message: 'Item reported',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Search items
 * @route   GET /api/items/search
 */
exports.searchItems = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const items = await Item.find({
      isVisible: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
      ],
    })
      .populate('userId', 'name email avatar')
      .sort('-createdAt');

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
};
