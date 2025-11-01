# Deployment Guide

This guide will help you deploy the Online Examination System to Vercel (Frontend) and Render (Backend).

## 🗄️ MongoDB Atlas Setup (Required for Backend)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new cluster (Free tier M0 is sufficient)

### Step 2: Configure Database Access
1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Create a username and password (save these securely!)
5. Set user privileges to **Atlas Admin** or **Read and write to any database**
6. Click **Add User**

### Step 3: Configure Network Access (CRITICAL!)
1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. **For Render deployment, you have two options:**
   
   **Option A (Recommended for Development/Testing):**
   - Click **Allow Access from Anywhere**
   - This adds `0.0.0.0/0` to the whitelist
   - ⚠️ Note: This is less secure but convenient for testing
   
   **Option B (More Secure):**
   - Add Render's IP ranges (contact Render support or check their docs)
   - Or add specific IPs as needed

4. Click **Confirm**

### Step 4: Get Connection String
1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select **Node.js** and version **5.5 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```
6. Replace `<username>`, `<password>`, and `<dbname>` with your actual values
   - Example: `mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/online-exam?retryWrites=true&w=majority`

---

## 🚀 Backend Deployment on Render

### Step 1: Create Render Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository: `Yogeshwarcse/Online-Examination-System`
4. Configure the service:
   - **Name**: `online-exam-backend` (or any name you prefer)
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose paid plan)

### Step 2: Configure Environment Variables
Click on **Environment Variables** and add:

```
MONGODB_URI = mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/online-exam?retryWrites=true&w=majority
JWT_SECRET = your-super-secret-jwt-key-minimum-32-characters-long
NODE_ENV = production
PORT = 5000
```

**Important Notes:**
- Replace `username`, `password`, and `cluster0.xxxxx.mongodb.net` with your actual MongoDB Atlas credentials
- Generate a strong JWT_SECRET (at least 32 characters)
- PORT will be set automatically by Render, but you can set it to 5000

### Step 3: Deploy
1. Click **Create Web Service**
2. Render will automatically build and deploy your backend
3. Wait for deployment to complete
4. Your backend URL will be: `https://your-service-name.onrender.com`

### Step 4: Test Backend
Visit: `https://your-service-name.onrender.com/health`
You should see: `{"status":"ok","message":"Server is healthy 🚀"}`

---

## 🎨 Frontend Deployment on Vercel

### Step 1: Create Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository: `Yogeshwarcse/Online-Examination-System`

### Step 2: Configure Project Settings
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Configure Environment Variables
Add the following environment variable:
```
VITE_API_URL = https://your-service-name.onrender.com/api
```
Replace `your-service-name.onrender.com` with your actual Render backend URL.

### Step 4: Deploy
1. Click **Deploy**
2. Vercel will build and deploy your frontend
3. Your frontend will be live at: `https://your-project.vercel.app`

---

## ✅ Post-Deployment Checklist

### Backend (Render)
- [ ] MongoDB Atlas IP whitelist configured (0.0.0.0/0 or Render IPs)
- [ ] Environment variables set correctly
- [ ] Backend URL is accessible (check /health endpoint)
- [ ] MongoDB connection successful (check Render logs)

### Frontend (Vercel)
- [ ] Environment variable `VITE_API_URL` points to backend URL
- [ ] Frontend is accessible
- [ ] Frontend can communicate with backend (check browser console)

---

## 🔍 Troubleshooting

### MongoDB Connection Errors

**Error: "Could not connect to any servers"**
- ✅ Check MongoDB Atlas Network Access whitelist
- ✅ Verify connection string is correct (username, password, cluster URL)
- ✅ Ensure database user has correct permissions
- ✅ Check Render logs for detailed error messages

**Error: "Authentication failed"**
- ✅ Verify username and password in connection string
- ✅ Check if database user exists and has correct privileges
- ✅ Ensure special characters in password are URL-encoded

### Backend Issues

**Error: "Port already in use"**
- ✅ Remove PORT from environment variables (Render sets it automatically)

**Error: "Module not found"**
- ✅ Check that all dependencies are in package.json
- ✅ Verify build command runs `npm install`

### Frontend Issues

**Error: "API calls failing"**
- ✅ Verify `VITE_API_URL` environment variable is set correctly
- ✅ Ensure backend URL is accessible (test in browser)
- ✅ Check CORS settings in backend (should allow your Vercel domain)

---

## 📝 Important Notes

1. **MongoDB Atlas Free Tier**: Has limitations (512MB storage, connection limits). For production, consider upgrading.

2. **Render Free Tier**: 
   - Services spin down after 15 minutes of inactivity
   - First request after spin-down may take 30-60 seconds
   - Consider upgrading for production use

3. **Vercel Free Tier**: 
   - Unlimited deployments
   - Good performance
   - Perfect for frontend hosting

4. **Security**: 
   - Never commit `.env` files to Git
   - Use strong secrets for JWT_SECRET
   - Regularly rotate passwords and secrets
   - Consider restricting MongoDB Atlas IP whitelist to specific IPs in production

---

## 🆘 Need Help?

If you encounter issues:
1. Check Render logs: Render Dashboard → Your Service → Logs
2. Check Vercel logs: Vercel Dashboard → Your Project → Deployments → Logs
3. Check MongoDB Atlas logs: Atlas Dashboard → Metrics
4. Verify all environment variables are set correctly

