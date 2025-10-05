const mongoose = require('mongoose');
const { getSpecies, getCategoriesForSpecies } = require('../utils/categories');

const livestockSchema = new mongoose.Schema({
  species: {
    type: String,
    required: [true, 'Species is required'],
    enum: {
      values: getSpecies(),
      message: 'Invalid species. Valid options are: {VALUES}'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    validate: {
      validator: function(value) {
        return getCategoriesForSpecies(this.species).includes(value);
      },
      message: props => `${props.value} is not a valid category for ${this.species}`
    }
  },
  identifier: {
    type: String,
    required: [true, 'Identifier is required'],
    unique: true,
    trim: true
  },
  birthDate: {
    type: Date,
    required: [true, 'Birth date is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['Male', 'Female'],
      message: 'Gender must be either Male or Female'
    }
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [0, 'Weight cannot be negative']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['Active', 'Sold', 'Deceased'],
      message: 'Status must be either Active, Sold, or Deceased'
    },
    default: 'Active'
  },
  notes: {
    type: String,
    trim: true
  },
  parentMale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Livestock'
  },
  parentFemale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Livestock'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
livestockSchema.index({ species: 1, identifier: 1 });
livestockSchema.index({ status: 1 });

// Virtual field for age
livestockSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.birthDate) / (1000 * 60 * 60 * 24 * 365.25));
});

// Pre-save middleware
livestockSchema.pre('save', async function(next) {
  // Any pre-save operations can go here
  next();
});

const Livestock = mongoose.model('Livestock', livestockSchema);

module.exports = Livestock;
