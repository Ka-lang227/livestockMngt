const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getAllHousing,
  getHousing,
  createHousing,
  updateHousing,
  deleteHousing,
  getHousingHistory,
  assignLivestock
} = require('../controllers/housingController');

const { 
  protect,
  restrictTo
} = require('./../controllers/authController');


const housingUnitRouter = express.Router();


// router.use(protect);
// Base routes
router.get('/', getAllHousing);
router.post('/', restrictTo('manager', 'admin'), createHousing);

// Individual housing unit routes
housingUnitRouter
  .route('/:housingId')
  .get(getHousing)
  .patch(restrictTo('manager', 'admin'), updateHousing)
  .delete(restrictTo('manager', 'admin'), deleteHousing);

// Housing unit actions
housingUnitRouter.get('/:housingId/history', getHousingHistory);
housingUnitRouter.patch('/:housingId/assign', restrictTo('manager', 'admin'), assignLivestock);

// Mount housing unit router
router.use('/', housingUnitRouter);

module.exports = router;
