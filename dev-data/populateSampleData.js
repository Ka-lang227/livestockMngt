const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { asyncHandler } = require('../src/utils/asyncHandler');
const User = require('../src/models/user');
const Livestock = require('../src/models/livestock');
const Housing = require('../src/models/housing');
const Performance = require('../src/models/performance');

// Load environment variables
dotenv.config({ path: './config.env' });

// Connect to database
const DB = process.env.DATABASE?.replace('<PASSWORD>', process.env.DATABASE_PASSWORD) 
  || 'mongodb://localhost:27017/livestock-management';

// Load sample data
const sampleUsers = require('./sample-users-data.json');
const sampleLivestock = require('./sample-livestock-data.json').map(animal => ({
  ...animal,
  birthDate: new Date(animal.birthDate)
}));

const sampleHousing = require('./sample-housing-data.json');
const samplePerformanceTemplate = require('./sample-performance-data.json');

// Generate performance data for livestock based on template
const generatePerformanceData = (livestock, days = 30) => {
  const performanceData = [];
  const today = new Date();
  
  // Find matching template record
  const template = samplePerformanceTemplate.find(record => {
    if (livestock.species === 'Cattle' && livestock.category === 'Dairy' && record.milkYield) return true;
    if (livestock.species === 'Chicken' && livestock.category === 'Layer' && record.eggCount) return true;
    if (livestock.species === livestock.species) return true;
    return false;
  }) || samplePerformanceTemplate[0];

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const baseWeight = livestock.weight;
    const weightVariation = baseWeight * 0.02; // 2% variation

    let record = {
      livestock: livestock._id,
      date,
      weight: baseWeight + (Math.random() * weightVariation * 2 - weightVariation),
      healthScore: template.healthScore + (Math.floor(Math.random() * 3) - 1), // Vary by ±1
      notes: template.notes
    };

    // Add specific metrics based on template
    if (template.milkYield) {
      record.milkYield = template.milkYield + (Math.floor(Math.random() * 5) - 2); // Vary by ±2
    }
    if (template.eggCount) {
      record.eggCount = Math.max(0, template.eggCount + (Math.floor(Math.random() * 3) - 1)); // Vary by ±1, min 0
    }

    performanceData.push(record);
  }

  return performanceData;
};

// Clear existing data
const clearData = asyncHandler(async () => {
    await Promise.all([
    Performance.deleteMany(),
    Livestock.deleteMany(),
    Housing.deleteMany(),
    User.deleteMany()
  ]);
  console.log('🗑️  Existing data cleared');
});

// Insert sample data
const insertSampleData = asyncHandler(async () => {

  const users = await User.create(sampleUsers);
  console.log(`✅ Created ${users.length} users`);

  // Create housing units 
  const housingUnits = await Housing.create(sampleHousing);
  console.log(`✅ Created ${housingUnits.length} housing units`);

  // Create livestock and assign to housing
  const livestock = await Promise.all(
    sampleLivestock.map(async (animal, index) => {
      const newAnimal = await Livestock.create(animal);
      
      // Assign to housing units in a round-robin fashion
      const housing = housingUnits[index % housingUnits.length];
      housing.currentAnimals.push(newAnimal._id);
      await housing.save();

      return newAnimal;
    })
  );
  console.log(`✅ Created ${livestock.length} livestock records`);

  // Generate and create performance records
  const performanceRecords = await Performance.create(
    livestock.flatMap(animal => generatePerformanceData(animal, 30))
  );
  console.log(`✅ Created ${performanceRecords.length} performance records`);

  // Display summary
  const summary = livestock.reduce((acc, animal) => {
    acc[animal.species] = (acc[animal.species] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📊 Data Summary:');
  console.log(`   Users: ${users.length}`);
  Object.entries(summary).forEach(([species, count]) => {
    console.log(`   ${species}: ${count} animals`);
  });

});

// Main execution function
const populateData = asyncHandler(async (shouldClear = true) => {
  try {
    console.log('🚀 Starting sample data population...\n');
    
    await mongoose.connect(DB);
    console.log('✅ Database connected successfully');

    if (shouldClear) {
      await clearData();
    }
    
    await insertSampleData();
    console.log('\n✅ Sample data population complete!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.errors) {
      console.log('\n🔍 Validation Errors:');
      Object.entries(error.errors).forEach(([field, err]) => {
        console.log(`   ${field}: ${err.message}`);
      });
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
  }
});

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const skipClear = args.includes('--no-clear') || args.includes('-n');
  
  populateData(!skipClear)
    .catch(err => {
      console.error('\n❌ Fatal error:', err);
      process.exit(1);
    });
};

module.exports = { populateData, clearData, insertSampleData };
