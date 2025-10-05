const express = require('express');
const router = express.Router();

// Import controller functions 
const { 
  createSale,
  getAllSales,
  getAllBatchSales,
  getSale,
  getBatchSale,
  updateSale,
  deleteSale,
  getBuyers
} = require('../controllers/salesController');

const { 
  protect,
  restrictTo
} = require('./../controllers/authController');

router.use(protect);
// Base routes 
router
  .route('/')
  .get(getAllSales)
  .post(restrictTo('manager', 'admin'), createSale);

// Individual sale routes
router
  .route('/:id')
  .get(getSale)
  .patch(restrictTo('manager', 'admin'), updateSale)
  .delete(restrictTo('manager', 'admin'), deleteSale);

// Batch sale routes 
router.
  route('/batch')
  .get(getAllBatchSales);
router
  .route('/batch/:id')
  .get(getBatchSale);

// Buyer route 
router.route('/buyers')
  .get(getBuyers);

module.exports = router;