const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getAllPerformances,
  getPerformance,
  createPerformance,
  updatePerformance,
  deletePerformance,
  getPerformancesByLivestock,
  getMetricsSummary
} = require('../controllers/performanceController');

const { 
  protect,
  restrictTo
} = require('./../controllers/authController');


const metricsRouter = express.Router();
const livestockRouter = express.Router();
const recordRouter = express.Router();

router.use(protect);
// Metrics routes
metricsRouter.get('/summary', getMetricsSummary);

// Livestock-specific routes
livestockRouter.get('/:livestockId', getPerformancesByLivestock);

// Individual record routes
recordRouter
  .route('/:id')
  .get(getPerformance)
  .patch(restrictTo('manager', 'admin'), updatePerformance)
  .delete(restrictTo('manager', 'admin'), deletePerformance);

// Base routes
router.get('/', getAllPerformances);
router.post('/', restrictTo('manager', 'admin'), createPerformance);

// Mount sub-routers
router.use('/metrics', metricsRouter);
router.use('/livestock', livestockRouter);
router.use('/', recordRouter);

module.exports = router;
