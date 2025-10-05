const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const { errorHandler, notFound } = require('./controllers/errorHandler');
const userRouter = require('./routes/userRoutes');
const livestockRouter = require('./routes/livestockRoutes');
const housingRouter = require('./routes/housingRoutes');
const performanceRouter = require('./routes/performanceRoutes');
const expenseRouter = require('./routes/expensesRoutes');
const salesRouter = require('./routes/salesRoutes');

const app = express();

// Trust proxy (important for rate limiting behind reverse proxies)
app.set('trust proxy', 1);

// Basic parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? (process.env.ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim())
      : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // Cache preflight for 24 hours
};

app.use(cors(corsOptions));

// Set security HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.url === '/api/v1/health';
  }
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['sort', 'fields', 'page', 'limit', 'species', 'status', 'category']
}));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${req.method} ${req.originalUrl} - ${timestamp}`);
  req.requestTime = timestamp;
  next();
});

// Health check route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Debug middleware (optional - can remove in production)
app.use((req, res, next) => {
  console.log('Request Body:', req.body);
  console.log('Query Parameters:', req.query);
  next();
});

// API routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/livestock', livestockRouter);
app.use('/api/v1/housing', housingRouter);
app.use('/api/v1/performance', performanceRouter);
app.use('/api/v1/expenses', expenseRouter);
app.use('/api/v1/sales', salesRouter);

// 404 handler and global error handler (must come after routes)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
