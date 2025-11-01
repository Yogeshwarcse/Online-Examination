# 🚨 Quick Fix: MongoDB Atlas Connection Error

If you're seeing this error:
```
❌ MongoDB connection error: Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## ✅ Quick Solution (5 minutes)

### Step 1: Whitelist All IPs in MongoDB Atlas
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click on **Network Access** (left sidebar)
3. Click **Add IP Address** button
4. Click **Allow Access from Anywhere** button
   - This automatically adds `0.0.0.0/0` which allows all IPs
5. Click **Confirm**

**⚠️ Note:** This allows connections from anywhere. For production, you may want to restrict this later, but it's fine for testing/development.

### Step 2: Verify Your Connection String in Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your backend service
3. Go to **Environment** tab
4. Verify `MONGODB_URI` is set correctly:
   ```
   mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/online-exam?retryWrites=true&w=majority
   ```
   - Replace `YOUR_USERNAME` with your MongoDB Atlas username
   - Replace `YOUR_PASSWORD` with your MongoDB Atlas password
   - Replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL
   - If your password has special characters, they must be URL-encoded:
     - `@` → `%40`
     - `#` → `%23`
     - `$` → `%24`
     - `%` → `%25`
     - etc.

### Step 3: Get Your Correct Connection String
1. In MongoDB Atlas, click **Database** → **Connect**
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your actual password (URL-encoded if needed)
5. Replace `<dbname>` with `online-exam` or your preferred database name

Example:
```
mongodb+srv://myuser:myp%40ssw0rd@cluster0.abc123.mongodb.net/online-exam?retryWrites=true&w=majority
```

### Step 4: Update Render Environment Variable
1. In Render, edit the `MONGODB_URI` environment variable
2. Paste your complete connection string
3. Click **Save Changes**
4. Render will automatically redeploy

### Step 5: Wait for Redeployment
- Render will automatically redeploy when you save environment variables
- Wait 1-2 minutes for deployment to complete
- Check the logs to see if MongoDB connects successfully

## ✅ Verify It Works

After redeployment, check:
1. **Render Logs**: Should show `✅ MongoDB connected successfully`
2. **Health Endpoint**: Visit `https://your-service.onrender.com/health`
   - Should return: `{"status":"ok","message":"Server is healthy 🚀"}`

## 🔍 Still Not Working?

### Check These Common Issues:

1. **Wrong Username/Password**
   - Verify in MongoDB Atlas → Database Access
   - Ensure password is URL-encoded in connection string

2. **Database User Not Created**
   - Go to MongoDB Atlas → Database Access
   - Make sure a database user exists with password authentication
   - User should have "Atlas Admin" or "Read and write to any database" privileges

3. **Connection String Format**
   - Must start with `mongodb+srv://`
   - Must include username:password@
   - Must include cluster URL
   - Must include database name in path or query string

4. **Check Render Logs**
   - Go to Render → Your Service → Logs
   - Look for detailed error messages
   - The error message will tell you exactly what's wrong

## 📞 Need More Help?

See the complete [DEPLOYMENT.md](./DEPLOYMENT.md) guide for detailed instructions.

