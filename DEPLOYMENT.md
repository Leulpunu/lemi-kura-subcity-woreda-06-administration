# Deployment Guide

## Option 1: Local Development

### Running Locally

1. Start the Backend

```
bash
cd backend
npm install
npm start
```

Backend runs at: <http://localhost:3000>

2. Start the Frontend

```
bash
npm install
npm start
```

Frontend runs at: <http://localhost:5000>

---

## Option 2: Deploy Backend to Render.com

### Step 1: Create Render Account

1. Go to [Render.com](https://render.com) and sign up with GitHub
2. Click "New +" and select "Web Service"

### Step 2: Connect Your Repository

1. Select your GitHub repository: `leulpunu/lemi-kura-subcity-woreda-06-administration`
2. Select the `backend` folder

### Step 3: Configure the Web Service

- Name: `lemi-kura-backend`
- Region: Oregon (or closest to you)
- Branch: main
- Build Command: `npm install`
- Start Command: `node server.js`

### Step 4: Add Environment Variables

Click "Advanced" and add these environment variables

| Key          | Value                                                                                                                       |
|--------------|-----------------------------------------------------------------------------------------------------------------------------|
| DATABASE_URL | `postgresql://neondb_owner:npg_Awke48RKBaVi@ep-weathered-rice-aia4pyx5-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| JWT_SECRET   | `your-secret-key-here`                                                                                                     |
| PORT         | `3000`                                                                                                                      |

### Step 5: Deploy

Click "Create Web Service" and wait for deployment to complete.

Once deployed, you'll get a URL like: `https://lemi-kura-backend.onrender.com`

---

## Option 3: Deploy Frontend to Vercel

### Step 1: Configure Vercel

1. Go to [Vercel.com](https://vercel.com) and sign up with GitHub
2. Import your repository
3. Set the following:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

### Step 2: Add Environment Variables

In Vercel dashboard, go to Settings > Environment Variables and add

| Key               | Value                                                                              |
|-------------------|------------------------------------------------------------------------------------|
| REACT_APP_API_URL | `<your-render-backend-url>` (e.g., `https://lemi-kura-backend.onrender.com`)    |

### Step 3: Deploy

Click "Deploy" and wait for deployment to complete.

---

## Default Login Credentials

After deploying, you can login with:

- Admin: username: `tesfaye`, password: `password123`
- User: username: `mikael`, password: `password123`

---

## Troubleshooting

### Backend Issues

- Check Render logs for errors
- Ensure DATABASE_URL is correct
- Verify Neon database is active

### Frontend Issues

- Check Vercel deployment logs
- Ensure REACT_APP_API_URL is set correctly
- The API URL should NOT have a trailing slash

### CORS Errors

- Ensure the backend allows requests from your Vercel domain
- Update CORS configuration in `backend/server.js` if needed
