# Backend Setup Guide for Lemi Kura Subcity Administration

This guide will help you set up a free backend so all users can share data across PC, phone, tablet, etc.

## Step 1: Create Free MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) and sign up for free
2. After signup, create a free cluster (choose the free tier)
3. Create a database user
   - Username: admin
   - Password: choose a strong password
4. In "Network Access", click "Add IP Address" and select "Allow Access from Anywhere" (0.0.0.0/0)
5. In "Database", click "Connect" → "Connect your application"
6. Copy the connection string - it will look like:

```
text
mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. Replace `<password>` with your actual password
8. Save this connection string somewhere safe

## Step 2: Deploy Backend on Render.com

1. Go to [Render.com](https://render.com) and sign up (use GitHub)
2. Connect your GitHub repository
3. Create a new "Web Service"
   - Name: lemikura-backend
   - Environment: Node
   - Build Command: npm install
   - Start Command: node server.js
4. In Environment Variables, add:
   - Key: MONGODB_URI
   - Value: (paste your MongoDB connection string from Step 1)
5. Click "Create Web Service"
6. Wait for deployment to complete (may take 5-10 minutes)
7. Once deployed, you will get a URL like: `https://lemikura-backend.onrender.com`
8. Save this URL

## Step 3: Update Frontend to Use Backend

After you have the backend deployed, I will update the frontend code to use the backend API instead of localStorage.

## Important Notes

- Both MongoDB Atlas and Render.com have free tiers
- No credit card required for either
- The free tier has some limitations but should work for your use case

## Next Steps

Once you have completed Steps 1 and 2, let me know:

1. Your MongoDB connection string (just confirm it is set up)
2. Your Render backend URL (such as `https://lemikura-backend.onrender.com`)

Then I will update the frontend code to connect to the backend
