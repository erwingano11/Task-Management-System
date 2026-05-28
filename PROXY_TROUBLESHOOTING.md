# Proxy Troubleshooting Guide

## Issues with Frontend-Backend Communication

### Symptoms:

- ❌ "Failed to fetch tasks" errors
- ❌ Browser console shows "Cannot connect to backend"
- ❌ Network tab shows 503 or proxy errors
- ❌ API calls return 500 errors

### Checklist:

#### 1. **Backend Server is Running**

```bash
# Terminal 1
cd backend
npm start

# Should see: "Server running on http://localhost:5000"
```

#### 2. **Frontend Proxy is Configured Correctly**

- Check `frontend/vite.config.js` has proxy pointing to `http://localhost:5000`
- Frontend dev server should be running on port 3000

```bash
# Terminal 2
cd frontend
npm run dev

# Should see: "Local: http://localhost:3000"
```

#### 3. **Test Proxy Directly**

Open browser console and run:

```javascript
fetch("/api/tasks")
  .then((res) => res.json())
  .then((data) => console.log("Success:", data))
  .catch((err) => console.error("Error:", err));
```

#### 4. **Check Backend Health**

Visit `http://localhost:5000/health` in your browser.
Should see: `{"status":"Server is running"}`

#### 5. **Check Database**

Backend needs the database to be set up:

```bash
cd backend
npm run setup    # Create database
npm run seed     # Create test users
```

#### 6. **Browser Console Debugging**

Open DevTools (F12) → Console tab and look for:

- `API Base URL: /api` - Shows proxy is configured
- `✅ API Connection Healthy` - Connection is working
- `❌ API Connection Error` - Backend not running

### Common Solutions:

**Problem:** "Cannot GET /api/tasks"

- **Solution:** Backend server is not running. Run `npm start` in backend folder.

**Problem:** Connection refused / Cannot connect

- **Solution:** Check backend port. Edit `backend/.env` to ensure PORT=5000

**Problem:** CORS errors in console

- **Solution:** Backend has CORS enabled. This is normal for dev. Check server has `cors()` middleware.

**Problem:** 503 Service Unavailable

- **Solution:** Database connection failed. Run `npm run setup` in backend.

### Full Debug Sequence:

```bash
# Terminal 1 - Backend Setup
cd backend
npm install
npm run setup      # Create database
npm run seed       # Create test users
npm start          # Start server (should show "Server running on port 5000")

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev        # Start dev server (should show "Local: http://localhost:3000")

# Browser
# Visit http://localhost:3000
# Check browser console for connection status
```

### Still Not Working?

1. **Restart both servers** - Kill and restart both terminals
2. **Clear browser cache** - Ctrl+Shift+Delete → Clear all
3. **Check firewall** - Port 5000 might be blocked
4. **Verify MySQL is running** - `mysql -u root -p`
5. **Check for port conflicts** - Another app might be using ports 3000 or 5000

### Verify Setup Works

Visit the test page at `http://localhost:5000/` to test API directly (no proxy needed).
This confirms the backend is working properly.
