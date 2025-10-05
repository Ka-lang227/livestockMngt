const mongoose = require('mongoose');

const housingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Housing name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Housing type is required'],
    enum: {
      values: ['Barn', 'Pen', 'Coop', 'Stable', 'Paddock', 'Other'],
      message: 'Invalid housing type'
    }
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  currentAnimals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Livestock'
  }],
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['Active', 'Maintenance', 'Inactive'],
      message: 'Invalid status'
    },
    default: 'Active'
  },
  features: [{
    type: String,
    enum: {
      values: ['Water', 'Feed', 'Heating', 'Cooling', 'Lighting', 'Ventilation'],
      message: 'Invalid feature'
    }
  }],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
housingSchema.index({ name: 1 });
housingSchema.index({ status: 1 });

// Virtual for current occupancy
housingSchema.virtual('occupancy').get(function() {
  return this.currentAnimals?.length || 0;
});

// Virtual for available space
housingSchema.virtual('availableSpace').get(function() {
  return this.capacity - (this.currentAnimals?.length || 0);
});

// Pre-save middleware
housingSchema.pre('save', async function(next) {
  // Check capacity
  if (this.currentAnimals?.length > this.capacity) {
    const err = new Error('Housing cannot exceed capacity');
    err.status = 400;
    return next(err);
  }
  next();
});

const Housing = mongoose.model('Housing', housingSchema);

module.exports = Housing;
