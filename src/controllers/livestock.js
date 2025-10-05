const Livestock = require('../models/livestock');
const { categories, getSpecies, getCategoriesForSpecies, isValidCategory } = require('../utils/categories');
const { catchAsync } = require('./errorHandler');

// Get all species and their categories
exports.getAllSpecies = catchAsync(async (req, res) => {
  const allSpecies = getSpecies();
  
  // Get counts for each species
  const counts = await Promise.all(
    allSpecies.map(async species => {
      const count = await Livestock.countDocuments({ species });
      return { species, count };
    })
  );

  res.status(200).json({
    status: 'success',
    data: {
      species: allSpecies.map(species => ({
        name: species,
        categories: getCategoriesForSpecies(species),
        count: counts.find(c => c.species === species)?.count || 0
      }))
    }
  });
});

// Get livestock by species
exports.getLivestockBySpecies = catchAsync(async (req, res) => {
  const { speciesName } = req.params;
  
  if (!getSpecies().includes(speciesName)) {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid species. Valid options are: ${getSpecies().join(', ')}`
    });
  }

  const livestock = await Livestock.find({ species: speciesName });

  res.status(200).json({
    status: 'success',
    data: {
      species: speciesName,
      count: livestock.length,
      livestock
    }
  });
});

// Get categories for a specific species
exports.getSpeciesCategories = catchAsync(async (req, res) => {
  const { speciesName } = req.params;

  if (!getSpecies().includes(speciesName)) {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid species. Valid options are: ${getSpecies().join(', ')}`
    });
  }

  const validCategories = getCategoriesForSpecies(speciesName);
  const categoryStats = await Livestock.aggregate([
    { $match: { species: speciesName } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      species: speciesName,
      categories: validCategories.map(category => ({
        name: category,
        count: categoryStats.find(stat => stat._id === category)?.count || 0
      }))
    }
  });
});

// Get all livestock
exports.getAllLivestock = catchAsync(async (req, res) => {
  // Build base query
  let query = Livestock.find();

  // Apply filters
  const filterFields = ['species', 'category', 'status'];
  const filters = {};
  
  if (req.query) {
    filterFields.forEach(field => {
      if (req.query[field]) {
        filters[field] = req.query[field];
      }
    });
  }
  
  if (Object.keys(filters).length > 0) {
    query = query.find(filters);
  }

  // Sorting
  const sortBy = req.query && req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt';
  query = query.sort(sortBy);

  // Field limiting
  if (req.query && req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  }

  // Pagination
  const page = req.query && req.query.page ? parseInt(req.query.page, 10) : 1;
  const limit = req.query && req.query.limit ? parseInt(req.query.limit, 10) : 100;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  // Execute query
  const livestock = await query;

  res.status(200).json({
    status: 'success',
    results: livestock.length,
    data: { livestock }
  });
});

// Get single livestock
exports.getLivestock = catchAsync(async (req, res) => {
  const livestock = await Livestock.findById(req.params.livestockId);

  if (!livestock) {
    return res.status(404).json({
      status: 'fail',
      message: 'Livestock not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: { livestock }
  });
});

// Create new livestock
exports.createLivestock = catchAsync(async (req, res) => {
  const { species, category } = req.body;

  // Validate species
  if (!getSpecies().includes(species)) {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid species. Valid options are: ${getSpecies().join(', ')}`
    });
  }

  // Validate category
  if (!isValidCategory(species, category)) {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid category for ${species}. Valid options are: ${getCategoriesForSpecies(species).join(', ')}`
    });
  }

  const livestock = await Livestock.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { livestock }
  });
});

// Update livestock
exports.updateLivestock = catchAsync(async (req, res) => {
  const { species, category } = req.body;

  // Validate species if provided
  if (species && !getSpecies().includes(species)) {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid species. Valid options are: ${getSpecies().join(', ')}`
    });
  }

  // Validate category if provided
  if (species && category && !isValidCategory(species, category)) {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid category for ${species}. Valid options are: ${getCategoriesForSpecies(species).join(', ')}`
    });
  }

  const livestock = await Livestock.findByIdAndUpdate(
    req.params.livestockId,
    req.body,
    { new: true, runValidators: true }
  );

  if (!livestock) {
    return res.status(404).json({
      status: 'fail',
      message: 'Livestock not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: { livestock }
  });
});

// Delete livestock
exports.deleteLivestock = catchAsync(async (req, res) => {
  const livestock = await Livestock.findByIdAndDelete(req.params.livestockId);

  if (!livestock) {
    return res.status(404).json({
      status: 'fail',
      message: 'Livestock not found'
    });
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
