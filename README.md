# Livestock Management System

A comprehensive RESTful API for managing livestock operations, designed to help farmers and agricultural organizations efficiently track livestock, monitor performance metrics, manage housing facilities, and analyze farm operations.

## 📋 Overview

The Livestock Management System provides a robust backend platform for managing livestock operations, enabling users to maintain detailed records, track health and performance metrics, manage expenses and sales, and generate insights for better farm management decisions.

## ✨ Features

- **Livestock Management** - Complete CRUD operations for livestock with species-based categorization
- **Performance Tracking** - Monitor weight, milk yield, egg count, and health scores
- **Housing Management** - Manage facilities with capacity tracking and animal assignment
- **Expense Tracking** - Record and categorize farm expenses by type and entity
- **Sales Management** - Track individual and batch sales with buyer information
- **User Management** - Role-based access control with email verification
- **Advanced Querying** - Filtering, sorting, pagination, and field limiting

## 🛠️ Tech Stack

**Backend:**
- Node.js with Express.js 5
- MongoDB with Mongoose ODM
- JWT Authentication
- bcrypt for password hashing

**Security & Utilities:**
- Helmet for security headers
- Express Rate Limiter
- CORS configuration
- Email service with Nodemailer

## 📦 Installation

### Prerequisites

- Node.js 14+ and npm
- MongoDB (local or Atlas)
- Email service credentials (development/production)

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd livestock-mngt
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `config.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=3000
   
   # Database
   DATABASE=mongodb://localhost:27017/livestock-management
   # Or for MongoDB Atlas:
   # DATABASE=mongodb+srv://<username>:<PASSWORD>@cluster.mongodb.net/livestock-management
   # DATABASE_PASSWORD=your_password
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90
   
   # Email Configuration (Development)
   EMAIL_HOST_DEV=smtp.mailtrap.io
   EMAIL_PORT_DEV=2525
   EMAIL_USERNAME_DEV=your_mailtrap_username
   EMAIL_PASSWORD_DEV=your_mailtrap_password
   EMAIL_FROM_DEV=noreply@livestock.local
   
   # Email Configuration (Production) - Optional
   EMAIL_HOST_PROD=smtp.sendgrid.net
   EMAIL_PORT_PROD=587
   EMAIL_USERNAME_PROD=apikey
   EMAIL_PASSWORD_PROD=your_sendgrid_api_key
   EMAIL_FROM_PROD=noreply@yourdomain.com
   
   # CORS (Production)
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

4. **Start MongoDB**
   - Ensure MongoDB is running locally or your Atlas connection is configured

5. **Run the Application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run prod
   ```

6. **Access the API**
   - Base URL: `http://localhost:3000`
   - API Health: `http://localhost:3000/api/v1/health`

## 🚀 API Endpoints

### Authentication
- `POST /api/v1/users/signup` - Register new user
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/verifyEmail/:token` - Verify email
- `POST /api/v1/users/forgotPassword` - Request password reset
- `PATCH /api/v1/users/resetPassword/:token` - Reset password

### Livestock
- `GET /api/v1/livestock` - Get all livestock
- `POST /api/v1/livestock` - Create livestock record
- `GET /api/v1/livestock/species` - Get all species
- `GET /api/v1/livestock/:id` - Get single livestock
- `PATCH /api/v1/livestock/:id` - Update livestock
- `DELETE /api/v1/livestock/:id` - Delete livestock

### Performance
- `GET /api/v1/performance` - Get all performance records
- `POST /api/v1/performance` - Create performance record
- `GET /api/v1/performance/livestock/:livestockId` - Get records by livestock
- `GET /api/v1/performance/metrics/summary` - Get metrics summary

### Housing
- `GET /api/v1/housing` - Get all housing units
- `POST /api/v1/housing` - Create housing unit
- `PATCH /api/v1/housing/:id/assign` - Assign livestock to housing

### Expenses & Sales
- `GET /api/v1/expenses` - Get all expenses
- `GET /api/v1/expenses/stats` - Get expense statistics
- `GET /api/v1/sales` - Get all sales
- `POST /api/v1/sales` - Record new sale

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Email verification for new accounts
- Rate limiting on API endpoints
- CORS protection
- Security headers with Helmet
- Role-based access control (admin, manager, worker)

## 📁 Project Structure

```
livestock-mngt/
├── api/
│   └── index.js              # Vercel serverless entry
├── src/
│   ├── app.js                # Express app configuration
│   ├── controllers/          # Route controllers
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API routes
│   └── utils/                # Helper utilities
├── server.js                 # Server entry point
├── config.env                # Environment variables (not in repo)
├── package.json
└── vercel.json               # Vercel deployment config
```

## 👨‍💻 Author

**Kwatpan Dalang**
- Email: kwatpandavid@gmail.com
- GitHub: [@Ka-lang227](https://github.com/Ka-lang227)

## 📝 License

ISC

---

**⭐ Private Repository**
