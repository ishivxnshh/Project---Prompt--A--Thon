# TimeMap Backend - Render Deployment Guide

## Quick Deploy to Render

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com) and sign up/login
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

3. **Set Environment Variables** (in Render Dashboard)
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string (e.g., `openssl rand -base64 32`)
   - `GEMINI_API_KEY`: Your Google AI API key from [aistudio.google.com](https://aistudio.google.com/app/apikey)
   - `PORT`: 10000 (auto-set by Render)
   - `NODE_ENV`: production (auto-set)

### Option 2: Manual Web Service

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your repository
4. Configure:
   - **Name**: timemap-backend
   - **Region**: Oregon (or closest to you)
   - **Branch**: main
   - **Root Directory**: server
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables (same as above)

## Important Notes

### MongoDB Atlas Setup
Make sure your MongoDB Atlas allows connections from anywhere:
1. Go to MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (allows all IPs - required for Render)
3. Or add Render's IP ranges if you prefer stricter security

### CORS Configuration
The backend is configured to accept requests from any origin. For production, update `server/src/server.js`:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

### Health Check
Render will ping `/health` to verify the service is running.

## After Deployment

Your backend will be available at:
```
https://timemap-backend.onrender.com
```

Update your frontend's API URL to point to this endpoint.

## Troubleshooting

### Service won't start
- Check Render logs for errors
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

### Database connection fails
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check MongoDB URI format and credentials

### API Key Invalid
- Generate a new Gemini API key at [aistudio.google.com](https://aistudio.google.com/app/apikey)
- Update the `GEMINI_API_KEY` environment variable in Render

## Free Tier Limitations

Render's free tier:
- Spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month of runtime
- Sufficient for development and demos
