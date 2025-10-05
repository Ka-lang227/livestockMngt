const mongoose = require('mongoose');
const Performance = require('../models/performance');
const Livestock = require('../models/livestock');
const { catchAsync } = require('./errorHandler');
const QueryBuilder = require('../utils/queryBuilder');
const { performanceMetrics, isValidMetric, getMetricsForSpeciesAndCategory } = require('../utils/categories');

// Create a performance record 
exports.createPerformance = catchAsync(async (req, res) => {
  const { livestock: livestockId } = req.body;

  // ensure livestock exists
  const livestock = await Livestock.findById(livestockId);
  if (!livestock) {
    return res.status(400).json({
      status: "fail",
      message: "Referenced livestock not found",
    });
  }

  const record = await Performance.create(req.body);
  res.status(201).json({ 
    status: "success", 
    data: record 
  });
});

//Get all performance records
exports.getAllPerformances = catchAsync(async (req, res) => {
  const queryBuilder = new QueryBuilder(Performance.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate('livestock');

  const records = await queryBuilder.query;
  res.status(200).json({ 
    status: "success", 
    results: records.length, 
    data: records 
  });
});

//Get a single performance record by ID
exports.getPerformance = catchAsync(async (req, res) => {
  const record = await Performance.findById(req.params.id).populate("livestock");
  if (!record) {
    return res.status(404).json({ 
      status: "fail", 
      message: "Performance record not found" 
    });
  }
  res.status(200).json({ 
    status: "success", 
    data: record 
  });
});

// Update a performance record. If livestock is changed, validate the new livestock exists.
exports.updatePerformance = catchAsync(async (req, res) => {
  if (req.body.livestock) {
    const newLivestock = await Livestock.findById(req.body.livestock);
    if (!newLivestock) {
      return res.status(400).json({ 
        status: "fail", 
        message: "Referenced livestock not found" 
      });
    }
  }

  const record = await Performance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("livestock");

  if (!record) {
    return res.status(404).json({ 
      status: "fail", 
      message: "Performance record not found" 
    });
  }

  res.status(200).json({ 
    status: "success", 
    data: record 
  });
});

// Delete a performance record
exports.deletePerformance = catchAsync(async (req, res) => {
  const record = await Performance.findByIdAndDelete(req.params.id);
  if (!record) {
    return res.status(404).json({ 
      status: "fail", 
      message: "Performance record not found" 
    });
  }
  res.status(204).json({ 
    status: "success", 
    data: null 
  });
});

// Get performance history for a specific livestock
exports.getPerformancesByLivestock = catchAsync(async (req, res) => {
  const { livestockId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(livestockId)) {
    return res.status(400).json({ 
      status: "fail",
      message: "Invalid livestock ID" 
    });
  }

  const livestock = await Livestock.findById(livestockId);
  if (!livestock) {
    return res.status(404).json({ 
      status: "fail",
      message: "Livestock not found" 
    });
  }

  const queryBuilder = new QueryBuilder(Performance.find({ livestock: livestockId }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate('livestock');

  const records = await queryBuilder.query;

  res.status(200).json({ status: "success", results: records.length, data: records });
});

//Aggregation endpoint: get avg/min/max for a metric
exports.getMetricsSummary = catchAsync(async (req, res) => {
  const { metric, livestock: livestockId, from, to } = req.query;

  if (!metric || !isValidMetric(metric)) {
    return res.status(400).json({
      status: "fail",
      message: `Please provide valid metric query param. Valid metrics: ${performanceMetrics.all.join(", ")}`,
    });
  }

  const match = {};

  // optional livestock filter
  if (livestockId) {
    if (!mongoose.Types.ObjectId.isValid(livestockId)) {
      return res.status(400).json({ 
        status: "fail", 
        message: "Invalid livestock ID" 
      });
    }
    // ✅ FIXED: Use 'new' keyword for ObjectId creation
    match.livestock = new mongoose.Types.ObjectId(livestockId);
  }

  // optional date range
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = new Date(from);
    if (to) match.date.$lte = new Date(to);
  }

  // ensure only records with the metric present are considered
  match[metric] = { $ne: null };

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: "$livestock",
        avg: { $avg: `$${metric}` },
        min: { $min: `$${metric}` },
        max: { $max: `$${metric}` },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "livestock", // collection name (usually the lowercase plural)
        localField: "_id",
        foreignField: "_id",
        as: "livestock",
      },
    },
    { $unwind: { path: "$livestock", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        livestock: { _id: "$livestock._id", tag: "$livestock.tag", species: "$livestock.species" },
        avg: 1,
        min: 1,
        max: 1,
        count: 1,
      },
    },
  ];

  const summary = await Performance.aggregate(pipeline);

  res.status(200).json({ 
    status: "success",
    results: summary.length,
    data: summary 
  });
});