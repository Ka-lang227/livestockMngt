const User = require('../models/user');
const { catchAsync } = require('../controllers/errorHandler')
const AppError = require('../utils/appError');
const QueryBuilder = require('../utils/queryBuilder')

// Create a new sale 
exports.createUser = catchAsync( async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: user
      }
    });
});

// Get all Users
exports.getAllUsers = catchAsync(async (req, res, next) => {

    const features = new QueryBuilder(User.find({ active: true }), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const users = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        data: users
      }
    });
});

exports.getUser = catchAsync( async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
});

exports.updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: user
      }
    });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, { active: false }, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

