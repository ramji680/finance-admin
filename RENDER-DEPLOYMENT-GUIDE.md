# 🚀 Fynito Admin Portal - Complete Render Deployment Guide

## 📋 Overview

This guide will help you deploy both the backend API and frontend web application to Render as separate services.

## 🏗️ Architecture

- **Backend Service**: Node.js API server (Port 5000)
- **Frontend Service**: React SPA with static file serving (Port 10000)
- **Database**: External MySQL database (already configured)

## 📁 Project Structure

```
finito-admin/
├── src/                    # Backend source code
├── frontend/               # Frontend source code
│   ├── src/               # React components
│   ├── dist/              # Built frontend (created during build)
│   └── package.json
├── render.yaml            # Render configuration
├── deploy-render.sh       # Deployment script
└── package.json           # Backend dependencies
```

## 🚀 Quick Deployment

### Option 1: Automated Script
```bash
./deploy-render.sh
```

### Option 2: Manual Steps

1. **Build Applications**
   ```bash
   # Build frontend
   cd frontend
   npm run build:static
   cd ..
   
   # Build backend
   npm run build:backend
   ```

2. **Commit Changes**
   ```bash
   git add .
   git commit -m "Deploy: Build and prepare for Render deployment"
   git push origin main
   ```

3. **Deploy to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Create new Web Service
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

## ⚙️ Render Configuration

The `render.yaml` file configures two services:

### Backend Service (`fynito-admin-backend`)
- **Build Command**: `npm install && npm run build:backend`
- **Start Command**: `npm start`
- **Port**: 5000
- **Environment**: Node.js

### Frontend Service (`fynito-admin-frontend`)
- **Build Command**: `cd frontend && npm install && npm run build:static`
- **Start Command**: `cd frontend/dist && npm start`
- **Port**: 10000
- **Root Directory**: `frontend`

## 🔧 Environment Variables

### Backend Environment Variables
```env
NODE_ENV=production
PORT=5000
DB_HOST=88.222.212.192
DB_PORT=3306
DB_NAME=fynito_admin
DB_USER=Fynito
DB_PASSWORD=Fynito
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
RAZORPAY_KEY_ID=rzp_test_RBU1qWeDXMeWZZ
RAZORPAY_KEY_SECRET=VBxDAxJic3mpQ6gEFyvQ3zD4
RAZORPAY_MERCHANT_ID=OcMLVZATeZMsGc
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
SOCKET_CORS_ORIGIN=https://fynito-admin-frontend.onrender.com
```

### Frontend Environment Variables
```env
NODE_ENV=production
PORT=10000
VITE_API_URL=https://fynito-admin-backend.onrender.com
```

## 🌐 Service URLs

After deployment, your services will be available at:

- **Backend API**: `https://fynito-admin-backend.onrender.com`
- **Frontend App**: `https://fynito-admin-frontend.onrender.com`

## 🔍 Health Checks

Both services include health check endpoints:

- **Backend**: `GET /health`
- **Frontend**: `GET /` (serves the React app)

## 📊 Monitoring

Render provides built-in monitoring for:
- Service uptime
- Response times
- Error rates
- Resource usage

## 🔄 Auto-Deploy

Render automatically deploys when you push to your main branch:
1. Push code to GitHub
2. Render detects changes
3. Builds and deploys both services
4. Services are updated with zero downtime

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18+ required)
   - Verify all dependencies are in package.json
   - Check build logs in Render dashboard

2. **Service Not Starting**
   - Verify start commands in render.yaml
   - Check environment variables
   - Review service logs

3. **Database Connection Issues**
   - Verify database credentials
   - Check network connectivity
   - Ensure database is accessible from Render

4. **CORS Issues**
   - Update `SOCKET_CORS_ORIGIN` in backend
   - Verify frontend URL in environment variables

### Debug Commands

```bash
# Check build locally
npm run build:backend
cd frontend && npm run build:static

# Test backend locally
npm start

# Test frontend locally
cd frontend/dist && npm start
```

## 🔐 Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **JWT Secret**: Use a strong, unique secret
3. **Database**: Use strong passwords
4. **CORS**: Configure properly for production
5. **Rate Limiting**: Enabled by default

## 📈 Performance Optimization

1. **Frontend**: Built with Vite for optimal bundle size
2. **Backend**: Compression and rate limiting enabled
3. **Static Assets**: Served efficiently by Node.js
4. **Database**: Connection pooling configured

## 🎯 Success Indicators

✅ **Deployment Successful When:**
- Both services show "Live" status
- Health checks return 200 OK
- Frontend loads without errors
- API endpoints respond correctly
- Database connections work

## 📞 Support

If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test locally first
4. Check database connectivity
5. Review this guide

---

**Happy Deploying! 🚀**

Your Fynito Admin Portal will be live and ready to manage restaurants, payments, and support tickets!
