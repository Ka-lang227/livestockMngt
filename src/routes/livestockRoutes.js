const express = require('express');
const router = express.Router();

// Import controller
const {
  getAllSpecies,
  getLivestockBySpecies,
  getSpeciesCategories,
  getAllLivestock,
  getLivestock,
  createLivestock,
  updateLivestock,
  deleteLivestock
} = require('../controllers/livestock');

const { 
  protect,
  restrictTo
} = require('./../controllers/authController')

// router.use(protect);
// Base routes
router
  .route('/')
  .get(getAllLivestock)
  .post(createLivestock);

// Species routes
router.get('/species', getAllSpecies);
router.get('/species/:speciesName', getLivestockBySpecies)
router.get('/species/:speciesName/categories', getSpeciesCategories);

// Individual livestock routes
router
  .route('/:livestockId')
  .get(getLivestock)
  .patch(restrictTo('manager', 'admin'), updateLivestock)
  .delete(restrictTo('manager', 'admin'), deleteLivestock);

module.exports = router;
