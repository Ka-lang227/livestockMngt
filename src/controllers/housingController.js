const Housing = require('../models/housing');
const Livestock = require('../models/livestock');
const AppError = require('../utils/appError');
const { catchAsync } = require('./errorHandler');
const { validateHousingFeatures } = require('../utils/categories');

exports.createHousing = catchAsync(async (req, res, next) => {
  // Validate required features for housing type
  if (!validateHousingFeatures(req.body.type, req.body.features)) {
    return next(new AppError(`Missing required features for ${req.body.type}`, 400));
  }
  const housing = await Housing.create(req.body);

  res.status(201).json({ 
    status: "success", 
    data: housing 
  });
});

exports.getAllHousing = catchAsync(async (req, res) => {
  const housings = await Housing.find().populate("currentAnimals");

  res.status(200).json({ 
    status: "success", 
    results: housings.length, 
    data: housings 
  });
});

exports.getHousing = catchAsync(async (req, res, next) => {
  const housing = await Housing.findById(req.params.id).populate("currentAnimals");
  
  if (!housing) {
    return next(new AppError('Housing unit not found', 404));
  }

  res.status(200).json({ 
    status: "success", 
    data: housing 
  });
});

exports.updateHousing = catchAsync(async (req, res, next) => {
  // Validate features if updating type or features
  if (req.body.type || req.body.features) {
    const housing = await Housing.findById(req.params.id);
    if (!housing) {
      return next(new AppError('Housing unit not found', 404));
    }
    
    const type = req.body.type || housing.type;
    const features = req.body.features || housing.features;
    
    if (!validateHousingFeatures(type, features)) {
      return next(new AppError(`Missing required features for ${type}`, 400));
    }
  }
  const housing = await Housing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  
  res.status(200).json({ 
    status: "success", 
    data: housing 
  });
});

exports.deleteHousing = catchAsync(async (req, res, next) => {
  const housing = await Housing.findById(req.params.id);
  if (!housing) {
    return next(new AppError('Housing unit not found', 404));
  }

  // Check if housing has animals
  if (housing.currentAnimals?.length > 0) {
    return next(new AppError('Cannot delete housing with active animals. Please relocate animals first.', 400));
  }
  await Housing.findByIdAndUpdate(req.params.id, { status: 'Inactive' });

  res.status(204).json({ 
    status: "success", 
    data: null 
  });
});

// Get housing history (you need to implement this based on your needs)
exports.getHousingHistory = catchAsync(async (req, res, next) => {
  const housing = await Housing.findById(req.params.id);
  if (!housing) {
    return next(new AppError('Housing unit not found', 404));
  }
  // This is a placeholder - implement based on your requirements
  
  const housingId = req.params.id;
  
  // You might want to query a history table or get livestock records
  // that reference this housing (past and present)
  const history = await Livestock.find({ 
    $or: [
      { housingId: housingId },
      { previousHousing: housingId } // if you track previous housing
    ]
  });

  res.status(200).json({
    status: "success",
    results: history.length,
    data: history
  });
});

// Assign livestock to housing
exports.assignLivestock = catchAsync(async (req, res, next) => {
  const { livestockId, housingId } = req.body;

  const livestock = await Livestock.findById(livestockId);
  const housing = await Housing.findById(housingId);

  if (!livestock) {
    return next(new AppError('Livestock not found', 404));
  }

  if (!housing) {
    return next(new AppError('Housing unit not found', 404));
  }

  // Check if housing is active
  if (housing.status !== 'Active') {
    return next(new AppError(`Cannot assign animals to ${housing.status.toLowerCase()} housing unit`, 400));
  }

  // Check capacity
  if (housing.currentAnimals.length >= housing.capacity) {
    return next(new AppError('Housing unit is at maximum capacity', 400));
  }

  // Check if livestock is already assigned somewhere
  if (livestock.housingId) {
    return next(new AppError('Livestock is already assigned to a housing unit', 400));
  }

  // Update livestock record
  livestock.housingId = housingId;
  await livestock.save();

  // Add livestock to housing
  housing.currentAnimals.push(livestockId);
  await housing.save();

  res.status(200).json({ 
    status: "success", 
    message: "Livestock assigned successfully", 
    data: housing 
  });
});