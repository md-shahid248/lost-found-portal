const mongoose = require('mongoose');

/**
 * Item Schema
 * Represents both lost and found items posted by users
 */
const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'electronics',
        'wallet',
        'keys',
        'documents',
        'bags',
        'clothing',
        'jewelry',
        'books',
        'sports',
        'other',
      ],
    },
    status: {
      type: String,
      required: true,
      enum: ['lost', 'found'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }, // Cloudinary public ID for deletion
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true, // Admin can hide posts
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient searching
itemSchema.index({ title: 'text', description: 'text', location: 'text' });
itemSchema.index({ status: 1, category: 1, resolved: 1 });
itemSchema.index({ userId: 1 });
itemSchema.index({ createdAt: -1 });

// Virtual: formatted date
itemSchema.virtual('formattedDate').get(function () {
  return this.date ? this.date.toLocaleDateString('en-IN') : '';
});

module.exports = mongoose.model('Item', itemSchema);
