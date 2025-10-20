const express = require('express');
const router = express.Router();
const {
  recordExpense,
  getAllExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpensesByCategory,
  getExpensesByDateRange,
  getExpenseStats,
  getExpensesByEntity
} = require('../controllers/expensesController');

const { 
  protect,
  restrictTo
} = require('./../controllers/authController');

router.use(protect);

// Base routes
router.route('/')
  .get(getAllExpenses)
  .post(restrictTo('manager', 'admin'), recordExpense);

// Stats and aggregation routes
router.get('/stats', getExpenseStats);
router.get('/by-category', getExpensesByCategory);
router.get('/by-date', getExpensesByDateRange);

// Entity-specific expenses (livestock or housing)
router.get('/entity/:type/:id', getExpensesByEntity);

// Individual expense routes
router.route('/:id')
  .get(getExpense)
  .patch(restrictTo('manager', 'admin'), updateExpense)
  .delete(restrictTo('manager', 'admin'), deleteExpense);

module.exports = router;
