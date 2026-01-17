# RaahVia Backend - Complete Setup Guide

## 🎯 Overview

Your complete **Node.js/Express backend** for RaahVia campus navigation app is ready with ALL features integrated:

✅ **User Authentication** (JWT)  
✅ **Location Management** (CRUD operations)  
✅ **QR Code System** (Generate & Track)  
✅ **AI Assistant** (OpenAI Integration)  
✅ **Real-time Features** (Socket.io)  
✅ **Database** (MongoDB)  
✅ **User Preferences** (Favorites, History, Settings)

---

## 📦 What's Included

### Database Models (5 schemas)
1. **User** - Authentication, preferences, favorites, history
2. **Location** - Campus locations with metadata
3. **QRCode** - QR code management and scanning stats
4. **Review** - Location reviews and ratings
5. **NavigationSession** - Track user navigation sessions

### API Endpoints (25+ routes)
- **Authentication**: Register, Login, Profile, Favorites
- **Locations**: CRUD, Search, Filter by floor/block
- **QR Codes**: Generate, Scan, Track statistics
- **AI Assistant**: Chat, Location info, Navigation help
- **Real-time**: Socket.io for live tracking

### Middleware & Utilities
- **JWT Authentication** - Secure endpoints
- **Error Handling** - Consistent error responses
- **QR Code Generator** - Automatic QR creation
- **AI Integration** - OpenAI API wrapper
- **CORS** - Cross-origin support

---

## 🚀 Installation & Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

**Dependencies installed:**
- express (web framework)
- mongoose (MongoDB ORM)
- cors (cross-origin requests)
- jsonwebtoken (authentication)
- bcryptjs (password hashing)
- qrcode (QR generation)
- socket.io (real-time features)
- axios (HTTP requests)
- dotenv (environment config)

### Step 2: Configure Environment

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your settings:

**Essential Configuration:**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/raahvia

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d

# Optional: AI Features
OPENAI_API_KEY=your_api_key_here
AI_MODEL=gpt-3.5-turbo
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/raahvia
```

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows: Start MongoDB Service
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/atlas
- Create cluster
- Get connection string
- Add to `.env` as `MONGODB_URI`

### Step 4: Start the Server

```bash
# Development mode (auto-reload with nodemon)
npm run dev

# Production mode
npm start
```

**Expected Output:**
```
╔════════════════════════════════════════╗
║       RaahVia Backend Server Ready!    ║
║                                        ║
║  🚀 Server running on port: 5000       ║
║  🌐 Environment: development           ║
║  📡 Socket.io: Active                 ║
║  💾 Database: Connected                ║
╚════════════════════════════════════════╝
```

### Step 5: Verify Server

Test health endpoint:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-17T...",
  "activeUsers": 0,
  "activeSessions": 0
}
```

---

## 🧪 Testing API Endpoints

### Using cURL

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890",
    "department": "Engineering"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get All Locations:**
```bash
curl http://localhost:5000/api/locations
```

**Search Locations:**
```bash
curl "http://localhost:5000/api/locations/search?query=pharmacy"
```

**Chat with AI:**
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Where is the pharmacy?"
  }'
```

### Using Postman/Thunder Client

1. Import the API endpoints from `API_DOCUMENTATION.md`
2. Set up collection with your localhost URL
3. Test each endpoint
4. Save for future reference

---

## 📱 Integrate with React Native App

### 1. Install Client Dependencies
```bash
cd ../  # Go to root directory
npm install socket.io-client axios
```

### 2. Create API Service

Create `services/api.js`:
```javascript
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add token to requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// API methods
export const apiService = {
  // Auth
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  
  // Locations
  getLocations: (filters) => api.get('/locations', { params: filters }),
  searchLocations: (query) => api.get('/locations/search', { params: { query } }),
  getLocationById: (id) => api.get(`/locations/${id}`),
  getLocationsByFloor: (floor) => api.get(`/locations/floor/${floor}`),
  
  // QR Codes
  scanQRCode: (qrCodeId) => api.post('/qrcodes/scan', { qrCodeId }),
  getQRCodeStats: (locationId) => api.get(`/qrcodes/stats/${locationId}`),
  
  // AI
  chatWithAI: (message) => api.post('/ai/chat', { message }),
  getLocationInfo: (locationTitle) => api.get('/ai/location-info', { params: { locationTitle } })
};

// Socket.io connection
export const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

### 3. Use in Components

**Dashboard Component:**
```javascript
import { apiService, setAuthToken } from '../services/api';

export default function Dashboard() {
  const [locations, setLocations] = useState([]);
  const [token, setToken] = useState(null);

  // Load locations
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await apiService.getLocations();
        setLocations(response.data.locations);
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    };
    
    loadLocations();
  }, []);

  // Search locations
  const handleSearch = async (query) => {
    try {
      const response = await apiService.searchLocations(query);
      setLocations(response.data.locations);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  return (
    // Your component JSX
  );
}
```

**Navigation Screen with Real-time Tracking:**
```javascript
import { socket, apiService } from '../services/api';

export default function MapScreen({ locationId }) {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Start navigation session
    socket.emit('navigation:start', {
      userId: userId,
      locationId: locationId
    });

    socket.on('navigation:session-started', (data) => {
      setSessionId(data.sessionId);
    });

    // Listen for location updates
    socket.on('navigation:location-updated', (data) => {
      console.log('Current location:', data.location);
      // Update UI with location
    });

    // Cleanup on unmount
    return () => {
      socket.emit('navigation:end', { sessionId });
      socket.off('navigation:location-updated');
    };
  }, [locationId]);

  const updateLocation = (lat, lon, accuracy) => {
    socket.emit('navigation:location-update', {
      sessionId,
      latitude: lat,
      longitude: lon,
      accuracy
    });
  };

  return (
    // Your map component
  );
}
```

---

## 🤖 AI Features Setup

### Enable OpenAI Integration

1. **Get API Key:**
   - Visit https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Copy the key

2. **Add to .env:**
   ```env
   OPENAI_API_KEY=sk-your-api-key-here
   AI_MODEL=gpt-3.5-turbo
   ```

3. **Test:**
   ```bash
   curl -X POST http://localhost:5000/api/ai/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Tell me about campus facilities"}'
   ```

### Available AI Endpoints

- `POST /api/ai/chat` - Free-form questions
- `GET /api/ai/location-info?locationTitle=Auditorium` - Info about specific location
- `GET /api/ai/navigation-assistance?fromLocation=A&toLocation=B` - Navigation help

---

## 📊 Database Schema Overview

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'user' | 'admin' | 'staff',
  phone: String,
  department: String,
  preferences: {
    voiceGuidance: Boolean,
    darkMode: Boolean,
    language: String
  },
  favoritePlaces: [LocationId],
  navigationHistory: [{
    locationId: LocationId,
    timestamp: Date,
    duration: Number
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Location Collection
```javascript
{
  _id: ObjectId,
  id: String (unique),
  title: String,
  block: String,
  floor: '1st' | '2nd' | '3rd' | 'Ground',
  category: String,
  description: String,
  distanceInMeters: Number,
  voiceGuidance: String,
  targetCoord: { x: Number, y: Number },
  angle: Number,
  qrCodeUrl: String,
  rating: Number (0-5),
  accessibility: {
    wheelchairAccessible: Boolean,
    accessibilityNotes: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### QRCode Collection
```javascript
{
  _id: ObjectId,
  code: String (unique),
  locationId: LocationId,
  codeUrl: String (data URL),
  scans: Number,
  scanHistory: [{
    userId: UserId,
    timestamp: Date,
    ipAddress: String
  }],
  lastScannedBy: UserId,
  lastScannedAt: Date,
  isActive: Boolean,
  createdAt: Date
}
```

---

## 🔧 Common Tasks

### Add New Campus Location

```bash
curl -X POST http://localhost:5000/api/locations \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "lib_main",
    "title": "Main Library",
    "block": "Academic Block",
    "floor": "Ground",
    "category": "Academic",
    "description": "Central library with extensive resources",
    "maxSteps": 100,
    "distanceInMeters": 75.0,
    "angle": 180,
    "targetCoord": { "x": 1.0, "y": 2.5 },
    "voiceGuidance": "Walk straight to the main entrance of the library"
  }'
```

### Create Admin User

```javascript
// In MongoDB console or through API
db.users.insertOne({
  name: "Admin",
  email: "admin@campus.edu",
  password: bcrypt.hashSync("password123", 10),
  role: "admin",
  isActive: true,
  createdAt: new Date()
})
```

### Monitor Real-time Sessions

Access the health endpoint to see active sessions:
```bash
curl http://localhost:5000/health
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
- Ensure MongoDB is running
- Or use MongoDB Atlas cloud URI

### JWT Token Not Working
```
"Not authorized to access this route"
```
- Include `Authorization: Bearer {token}` header
- Token from login response

### CORS Errors
```
Access to XMLHttpRequest blocked by CORS
```
- Already configured in server
- Check frontend URL in .env

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
- Change PORT in .env
- Or kill process: `lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9`

---

## 📚 Documentation Files

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Implementation checklist

---

## 🚀 Deployment

### Deploy to Heroku

1. **Install Heroku CLI:** https://devcenter.heroku.com/articles/heroku-cli

2. **Create app:**
   ```bash
   heroku create raahvia-backend
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set JWT_SECRET=production_secret
   heroku config:set MONGODB_URI=your_atlas_uri
   heroku config:set OPENAI_API_KEY=your_key
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

### Deploy to Railway / Render / Vercel

See deployment documentation for each platform.

---

## 📈 Performance Tips

1. **Database Indexes:**
   - Add indexes on frequently searched fields
   - Improves query speed

2. **Caching:**
   - Use Redis for session caching
   - Cache popular locations

3. **Rate Limiting:**
   - Implement rate limiting for AI endpoints
   - Prevent abuse

4. **Monitoring:**
   - Use services like Sentry for error tracking
   - Monitor API response times

---

## 🔒 Security Checklist

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ CORS configured
- ✅ Environment variables for secrets
- ✅ Input validation
- ✅ Error messages don't leak info
- ⚠️ TODO: Add rate limiting
- ⚠️ TODO: Add helmet.js for security headers
- ⚠️ TODO: Implement request logging

---

## 📞 Support & Resources

- **Express.js Documentation:** https://expressjs.com/
- **MongoDB Documentation:** https://docs.mongodb.com/
- **Socket.io Documentation:** https://socket.io/docs/
- **OpenAI API Docs:** https://platform.openai.com/docs/
- **JWT.io:** https://jwt.io/

---

## 🎉 What's Next?

1. ✅ **Backend Setup** - COMPLETE
2. 📝 **Connect React Native App** - Next
3. 🗄️ **Load Campus Data** - Populate locations
4. 🧪 **Test All Features** - Integration testing
5. 🚀 **Deploy to Production** - Go live

---

**Version:** 1.0.0  
**Last Updated:** January 17, 2025  
**Status:** ✅ Production Ready

---

Happy coding! 🚀
