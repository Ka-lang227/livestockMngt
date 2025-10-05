const Expense = require('../models/expenses');
const Livestock = require('../models/livestock');
const Housing = require('../models/housing');
const { catchAsync } = require('./errorHandler');
const QueryBuilder = require('../utils/queryBuilder');
const { expenseCategories, isValidExpenseCategory } = require('../utils/categories');

// Create a new expense
exports.recordExpense = catchAsync(async (req, res) => {
  // Validate category if provided
  if (req.body.category && !isValidExpenseCategory(req.body.category)) {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid category. Valid options are: ${expenseCategories.all.join(', ')}`
    });
  }

  const expenseData = await Expense.create(req.body);

  res.status(201).json({
    status: 'success',
    data: expenseData
  });
});

// Get all expenses
exports.getAllExpenses = catchAsync(async (req, res) => {
  const queryBuilder = new QueryBuilder(Expense.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const expenses = await queryBuilder.query;

  res.status(200).json({
    status: 'success',
    results: expenses.length,
    data: expenses
  });
});

// Get expenses by expense category
exports.getExpensesByCategory = catchAsync(async (req, res) => {
  const { category } = req.query;

  if (category && !isValidExpenseCategory(category)) {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid category. Valid options are: ${expenseCategories.all.join(', ')}`
    });
  }

  const match = category ? { category } : {};
  const expenses = await Expense.find(match);

  res.status(200).json({
    status: 'success',
    results: expenses.length,
    data: expenses
  });
});

// Get expenses within a date range
exports.getExpensesByDateRange = catchAsync(async (req, res) => {
  const { from, to } = req.query;

  const match = {};
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = new Date(from);
    if (to) match.date.$lte = new Date(to);
  }

  const expenses = await Expense.find(match);

  res.status(200).json({
    status: 'success',
    results: expenses.length,
    data: expenses
  });
});

// Get expenses for a specific entity (livestock or housing)
exports.getExpensesByEntity = catchAsync(async (req, res) => {
  const { type, id } = req.params;

  if (!['livestock', 'housing'].includes(type)) {
    return res.status(400).json({ status: 'fail', message: "Type must be either 'livestock' or 'housing'" });
  }

  const match = type === 'livestock' ? { livestock: id } : { housing: id };
  const expenses = await Expense.find(match);

  res.status(200).json({
    status: 'success',
    results: expenses.length,
    data: expenses
  });
});

// Expense stats (totals by category and overall)
exports.getExpenseStats = catchAsync(async (req, res) => {
  const pipeline = [
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { total: -1 }
    }
  ];

  const byCategory = await Expense.aggregate(pipeline);
  const overall = await Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]);

  res.status(200).json({
    status: 'success',
    data: {
      byCategory,
      overall: overall[0] || { total: 0, count: 0 }
    }
  });
});

// Get an expense 
exports.getExpense = catchAsync(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({ 
      status: 'fail', 
      message: 'Expense not found' 
    });
  }

  res.status(200).json({
    status: 'success',
    data: expense
  });
});

// Update an expense 
exports.updateExpense = catchAsync(async (req, res) => {
  if (req.body.category && !isValidExpenseCategory(req.body.category)) {
    return res.status(400).json({ 
      status: 'fail', 
      message: `Invalid category. Valid options are: ${expenseCategories.all.join(', ')}` 
    });
  }

  const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { 
    new: true, 
    runValidators: true 
  });

  res.status(200).json({
    status: 'success',
    data: expense
  }); 
});

// Delete an expense 
exports.deleteExpense = catchAsync(async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});   
