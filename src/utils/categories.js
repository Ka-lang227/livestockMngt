/**
 * Constants and utilities for managing categories across the application
 */

// Livestock categories by species
const livestockCategories = {
  Cattle: ['Calf', 'Heifer', 'Dairy', 'Beef', 'Breeding'],
  Sheep: ['Lamb', 'Ewe', 'Ram', 'Breeding'],
  Goat: ['Kid', 'Doe', 'Buck', 'Breeding'],
  Pig: ['Piglet', 'Grower', 'Finisher', 'Sow', 'Boar'],
  Poultry: ['Chick', 'Layer', 'Broiler', 'Breeder']
};

// Housing configurations
const housingTypes = {
  // Housing unit types
  types: ['Barn', 'Pen', 'Coop', 'Stable', 'Paddock', 'Other'],
  // Available features
  features: ['Water', 'Feed', 'Heating', 'Cooling', 'Lighting', 'Ventilation'],
  // Operational status
  status: ['Active', 'Maintenance', 'Inactive'],
  // Feature requirements by type
  requirements: {
    Barn: ['Water', 'Feed', 'Ventilation'],
    Coop: ['Water', 'Feed', 'Lighting'],
    Stable: ['Water', 'Feed', 'Ventilation'],
    Paddock: ['Water']
  }
};

// Expense categorization
const expenseCategories = {
  // All valid expense categories
  all: ['feed', 'medicine', 'labor', 'utilities', 'housing_maintenance', 'transport', 'other'],
  // Grouped by priority/type
  essential: ['feed', 'medicine'],
  operational: ['labor', 'utilities', 'housing_maintenance'],
  additional: ['transport', 'other'],
  // Category descriptions for UI
  descriptions: {
    feed: 'Food and nutrition costs',
    medicine: 'Veterinary care and medications',
    labor: 'Staff and worker payments',
    utilities: 'Electricity, water, and other utilities',
    housing_maintenance: 'Repairs and upkeep of facilities',
    transport: 'Transportation and logistics costs',
    other: 'Miscellaneous expenses'
  }
};

// Performance metrics configuration
const performanceMetrics = {
  // Metrics tracked for all animals
  common: ['weight', 'healthScore'],
  // Species and category specific metrics
  special: {
    Cattle: { 
      Dairy: ['milkYield'],
      all: ['weightGain']
    },
    Poultry: { 
      Layer: ['eggCount'],
      all: ['feedConversion']
    }
  },
  // All possible metrics
  all: ['weight', 'milkYield', 'eggCount', 'healthScore', 'weightGain', 'feedConversion'],
  // Metric units and ranges
  units: {
    weight: 'kg',
    milkYield: 'L/day',
    eggCount: 'eggs/day',
    healthScore: '1-10',
    weightGain: 'kg/month',
    feedConversion: 'ratio'
  }
};

/**
 * Livestock Species and Categories
 */

// Get all available species
const getSpecies = () => Object.keys(livestockCategories);

// Get categories for a specific species
const getCategoriesForSpecies = (species) => livestockCategories[species] || [];

// Validate if a category is valid for a species
const isValidCategory = (species, category) => {
  const validCategories = livestockCategories[species];
  return validCategories && validCategories.includes(category);
};

/**
 * Performance Metrics
 */

// Get available metrics for a specific species and category
const getMetricsForSpeciesAndCategory = (species, category) => {
  const metrics = [...performanceMetrics.common];
  
  // Add species-wide metrics
  if (performanceMetrics.special[species]?.all) {
    metrics.push(...performanceMetrics.special[species].all);
  }
  
  // Add category-specific metrics
  if (performanceMetrics.special[species]?.[category]) {
    metrics.push(...performanceMetrics.special[species][category]);
  }
  
  return metrics;
};

// Validate if a metric is valid
const isValidMetric = (metric) => performanceMetrics.all.includes(metric);

// Get unit for a metric
const getMetricUnit = (metric) => performanceMetrics.units[metric];

/**
 * Housing Management
 */

// Get valid housing types
const getHousingTypes = () => housingTypes.types;

// Get valid housing features
const getHousingFeatures = () => housingTypes.features;

// Get valid housing status options
const getHousingStatus = () => housingTypes.status;

// Get required features for a housing type
const getRequiredFeatures = (type) => housingTypes.requirements[type] || [];

// Validate housing features
const validateHousingFeatures = (type, features) => {
  const required = getRequiredFeatures(type);
  return required.every(feature => features.includes(feature));
};

/**
 * Expense Management
 */

// Get all expense categories
const getExpenseCategories = () => expenseCategories.all;

// Get expense categories by type
const getExpenseCategoriesByType = (type) => expenseCategories[type] || [];

// Get expense category description
const getExpenseCategoryDescription = (category) => expenseCategories.descriptions[category];

// Validate if an expense category is valid
const isValidExpenseCategory = (category) => expenseCategories.all.includes(category);

module.exports = {
  // Constants
  livestockCategories,
  housingTypes,
  performanceMetrics,
  expenseCategories,
  
  // Livestock functions
  getSpecies,
  getCategoriesForSpecies,
  isValidCategory,
  
  // Performance functions
  getMetricsForSpeciesAndCategory,
  isValidMetric,
  getMetricUnit,
  
  // Housing functions
  getHousingTypes,
  getHousingFeatures,
  getHousingStatus,
  getRequiredFeatures,
  validateHousingFeatures,

  // Expense functions
  getExpenseCategories,
  getExpenseCategoriesByType,
  getExpenseCategoryDescription,
  isValidExpenseCategory
};
