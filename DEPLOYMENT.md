# Vercel Deployment Guide

## ✅ Files Created/Updated

1. **api/index.js** - Serverless function entry point
2. **vercel.json** - Updated with correct build configuration
3. **package.json** - Updated start script for production
4. **.vercelignore** - Excludes unnecessary files from deployment

## 🔐 Environment Variables to Set in Vercel

Go to your Vercel project settings → Environment Variables and add:

### Required Variables:
- `DATABASE` - MongoDB connection string (e.g., mongodb+srv://username:password@cluster.mongodb.net/dbname)
- `DATABASE_PASSWORD` - Your MongoDB password
- `NODE_ENV` - Set to `production`
- `JWT_SECRET` - Your JWT secret key
- `JWT_EXPIRES_IN` - JWT expiration time (e.g., 90d)
- `JWT_COOKIE_EXPIRES_IN` - Cookie expiration in days (e.g., 90)

### Optional Variables (based on your config.env):
- `ALLOWED_ORIGINS` - Comma-separated frontend URLs (e.g., https://yourdomain.com,https://www.yourdomain.com)
- `EMAIL_USERNAME` - Email service username (for nodemailer)
- `EMAIL_PASSWORD` - Email service password
- `EMAIL_HOST` - Email service host
- `EMAIL_PORT` - Email service port
- `EMAIL_FROM` - Default sender email address

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas Setup:
  - [ ] Whitelist Vercel IPs or allow access from anywhere (0.0.0.0/0)
  - [ ] Verify connection string is correct
  - [ ] Test connection from external source

- [ ] Environment Variables:
  - [ ] All variables added to Vercel dashboard
  - [ ] Verify no typos in variable names
  - [ ] Check connection string format

- [ ] Code Review:
  - [ ] Remove any console.logs with sensitive data (optional)
  - [ ] Verify CORS settings in src/app.js match your frontend URL
  - [ ] Check rate limiting settings are appropriate

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: Deploy via GitHub (Recommended)
1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Vercel will auto-detect the configuration
5. Add environment variables
6. Deploy!

### Option 3: Deploy via Vercel Dashboard
1. Go to https://vercel.com/new
2. Select "Import Project"
3. Choose your repository or upload folder
4. Add environment variables
5. Deploy!

## 🧪 Testing Your Deployment

After deployment, test these endpoints:

1. **Health Check:**
   ```
   GET https://your-app.vercel.app/api/v1/health
   ```

2. **Test API Routes:**
   ```
   GET https://your-app.vercel.app/api/v1/livestock
   GET https://your-app.vercel.app/api/v1/users
   ```

## ⚠️ Important Notes

1. **Serverless Timeout**: Vercel functions timeout after 10 seconds (Hobby) or 60 seconds (Pro)
2. **Cold Starts**: First request may be slower due to serverless cold starts
3. **Database Connections**: Each request creates new connections - MongoDB connection pooling helps
4. **File System**: Don't store files on the filesystem (use cloud storage like S3 or Cloudinary)
5. **Logs**: View logs in Vercel dashboard under Deployments → [Your Deployment] → Runtime Logs

## 🐛 Troubleshooting

### Database Connection Issues:
- Verify MongoDB Atlas allows connections from 0.0.0.0/0
- Check environment variables are set correctly
- Ensure connection string format is correct

### CORS Errors:
- Update ALLOWED_ORIGINS environment variable
- Check CORS configuration in src/app.js

### 404 Errors:
- Verify vercel.json routes configuration
- Check that api/index.js exists and exports app correctly

## 📚 Useful Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Pull environment variables locally
vercel env pull

# Remove a deployment
vercel rm [deployment-url]
```

## 🔗 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Node.js Runtime](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [MongoDB Atlas IP Whitelist](https://docs.atlas.mongodb.com/security/ip-access-list/)
