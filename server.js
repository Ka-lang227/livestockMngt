const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./src/app');
const { handleUncaughtException, handleUnhandledRejection } = require('./src/controllers/errorHandler');

// Must be at the top, before any Promise-based code
handleUncaughtException();

// Load environment variables
dotenv.config({ path: path.join(__dirname, './config.env') });

// Database connection
const DB = process.env.DATABASE?.replace('<PASSWORD>', process.env.DATABASE_PASSWORD) 
  || 'mongodb://localhost:27017/livestock-management';

const connectDB = async () => {
  try {
    await mongoose.connect(DB, {
    });
    console.log('✅ DB connection successful!');
  } catch (err) {
    console.log('❌ DB connection failed:', err.message);
    console.log('Make sure MongoDB is running or check your connection string');
    process.exit(1);
  }
};

// Start server and connect to DB
const startServer = async () => {
  await connectDB();

  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log(`🚀 App running on port ${port}...`);
  });

  // Must be at the bottom, after server initialization
  handleUnhandledRejection(server);

  // Handle SIGTERM
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('💥 Process terminated!');
      mongoose.connection.close(false, () => {
        process.exit(0);
      });
    });
  });
};

startServer();
