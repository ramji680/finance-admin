# 🚀 Fynito Admin Portal - Render Deployment Guide

## 📋 Render Configuration

### **Option 1: Use render.yaml (Recommended)**
Upload your entire project to Render and it will automatically use the `render.yaml` configuration.

### **Option 2: Manual Configuration**
If you prefer manual setup, use these settings:

## 🔧 **Build Settings:**

**Build Command:**
```bash
cd frontend && npm install && npm run build:static
```

**Start Command:**
```bash
cd frontend/dist && npm install && npm start
```

**Root Directory:** `frontend`

## ⚙️ **Environment Variables:**

- `NODE_ENV`: `production`
- `PORT`: `10000` (or leave empty for auto-assignment)

## 📁 **File Structure for Render:**

```
your-project/
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── dist/          ← Built files (created during build)
│   │   ├── index.html
│   │   ├── assets/
│   │   ├── server.js
│   │   └── package.json
│   └── scripts/
├── render.yaml
└── README.md
```

## 🚀 **Deployment Steps:**

1. **Push to Git** (GitHub, GitLab, etc.)
2. **Connect to Render** from your repository
3. **Render will automatically:**
   - Run the build command
   - Install dependencies
   - Start the server

## 🔍 **Troubleshooting:**

### **Port Issues:**
- Ensure `server.js` uses `process.env.PORT`
- Render automatically assigns ports

### **Build Failures:**
- Check Node.js version (16+ required)
- Verify all dependencies are in package.json

### **Start Command Issues:**
- Make sure `server.js` exists in `frontend/dist/`
- Verify `package.json` has correct start script

## 📱 **Your App Will Be Available At:**
- **Render URL**: `https://your-app-name.onrender.com`
- **Custom Domain**: If configured

## ✅ **Success Indicators:**
- Build completes without errors
- Server starts and shows "🚀 Fynito Admin Portal running"
- Health check endpoint responds: `/health`

---

**Happy Deploying on Render! 🚀**
