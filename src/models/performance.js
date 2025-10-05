const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  livestock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Livestock',
    required: [true, 'Livestock reference is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  // Weight in kilograms
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  // Daily milk yield in liters
  milkYield: {
    type: Number,
    min: [0, 'Milk yield cannot be negative']
  },
  // Daily egg count
  eggCount: {
    type: Number,
    min: [0, 'Egg count cannot be negative']
  },
  // Health score (1-10)
  healthScore: {
    type: Number,
    min: [1, 'Health score must be between 1 and 10'],
    max: [10, 'Health score must be between 1 and 10']
  },
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
performanceSchema.index({ livestock: 1, date: -1 });
performanceSchema.index({ date: -1 });

// Validate that at least one metric is provided
performanceSchema.pre('save', function(next) {
  const hasMetric = this.weight || this.milkYield || this.eggCount || this.healthScore;
  if (!hasMetric) {
    const err = new Error('At least one performance metric (weight, milkYield, eggCount, or healthScore) must be provided');
    err.status = 400;
    return next(err);
  }
  next();
});

const Performance = mongoose.model('Performance', performanceSchema);

module.exports = Performance;
