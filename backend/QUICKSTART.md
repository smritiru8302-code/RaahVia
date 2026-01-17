# RaahVia Backend - Quick Start Guide

## What's Built

Your complete Node.js/Express backend for the RaahVia campus navigation app includes:

### ✅ Core Features
1. **User Authentication** - JWT-based login/registration
2. **Location Management** - Database of all campus locations
3. **QR Code System** - Generate, store, and track QR codes
4. **AI Assistant** - OpenAI integration for smart queries
5. **Real-time Updates** - Socket.io for live location tracking
6. **User Profiles** - Preferences, favorites, history

### 📁 Project Structure
```
backend/
├── config/
│   └── database.js              # MongoDB connection
├── models/
│   ├── User.js                  # User schema
│   ├── Location.js              # Location schema
│   ├── QRCode.js                # QR code schema
│   ├── Review.js                # Reviews schema
│   └── NavigationSession.js      # Navigation tracking
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── locationController.js    # Location CRUD
│   ├── qrCodeController.js      # QR code handling
│   └── aiController.js          # AI integration
├── middleware/
│   ├── auth.js                  # JWT verification
│   └── errorHandler.js          # Error handling
├── routes/
│   ├── authRoutes.js            # Auth endpoints
│   ├── locationRoutes.js        # Location endpoints
│   ├── qrCodeRoutes.js          # QR code endpoints
│   └── aiRoutes.js              # AI endpoints
├── utils/
│   ├── qrCodeGenerator.js       # QR code utilities
│   └── aiIntegration.js         # OpenAI utilities
├── server.js                    # Main server file
├── package.json                 # Dependencies
├── .env.example                 # Environment template
└── API_DOCUMENTATION.md         # Full API docs
```

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment
```bash
# Create .env file from template
cp .env.example .env

# Edit .env with your settings
```

**Minimum .env configuration:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/raahvia
JWT_SECRET=your-secret-key-here
```

### 3. Start MongoDB
```bash
# If MongoDB is running locally
# Windows: Start MongoDB service
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

Or use **MongoDB Atlas** (cloud):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/raahvia
```

### 4. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

You should see:
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

### 5. Test the Server
```bash
# Health check
curl http://localhost:5000/health

# Response:
{
  "success": true,
  "message": "Server is running",
  "activeUsers": 0,
  "activeSessions": 0
}
```

## API Usage Examples

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get All Locations
```bash
curl http://localhost:5000/api/locations
```

### Search Locations
```bash
curl "http://localhost:5000/api/locations/search?query=pharmacy"
```

### Chat with AI
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Where is the pharmacy?"
  }'
```

## Integrate with Frontend

### Setup in Your React Native App

1. **Install Socket.io client:**
   ```bash
   npm install socket.io-client axios
   ```

2. **Create API service in your frontend:**
   ```javascript
   // services/api.js
   import axios from 'axios';
   import io from 'socket.io-client';

   const API_URL = 'http://localhost:5000/api';
   const socket = io('http://localhost:5000');

   export const api = {
     // Auth
     register: (userData) => axios.post(`${API_URL}/auth/register`, userData),
     login: (credentials) => axios.post(`${API_URL}/auth/login`, credentials),
     
     // Locations
     getLocations: () => axios.get(`${API_URL}/locations`),
     searchLocations: (query) => axios.get(`${API_URL}/locations/search?query=${query}`),
     
     // QR Codes
     scanQRCode: (qrCodeId) => axios.post(`${API_URL}/qrcodes/scan`, { qrCodeId }),
     
     // AI
     chatWithAI: (message) => axios.post(`${API_URL}/ai/chat`, { message })
   };

   export { socket };
   ```

3. **Use in your components:**
   ```javascript
   import { api, socket } from '../services/api';

   // In your Dashboard or Navigation screens
   const handleLocationSearch = async (query) => {
     const response = await api.searchLocations(query);
     setLocations(response.data.locations);
   };

   // For real-time navigation
   useEffect(() => {
     socket.emit('navigation:start', { 
       userId: userId, 
       locationId: locationId 
     });
     
     socket.on('navigation:location-updated', (data) => {
       console.log('Location:', data.location);
     });

     return () => {
       socket.emit('navigation:end', { sessionId: sessionId });
     };
   }, []);
   ```

## Enable OpenAI Integration

To activate AI features:

1. **Get OpenAI API Key:**
   - Visit https://platform.openai.com/api-keys
   - Create new secret key

2. **Add to .env:**
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   AI_MODEL=gpt-3.5-turbo
   ```

3. **Test AI endpoint:**
   ```bash
   curl -X POST http://localhost:5000/api/ai/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Tell me about the campus"}'
   ```

## Common Issues & Solutions

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** 
- Start MongoDB service
- Or use MongoDB Atlas cloud URI in .env

### JWT Token Error
```
Not authorized to access this route
```
**Solution:**
- Include `Authorization: Bearer {token}` in headers
- Token from login/register response

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Already configured in server.js
- Add your frontend URL to CORS origins if different

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:**
```bash
# Kill process on port 5000
# Windows: netstat -ano | findstr :5000 then taskkill /PID {PID} /F
# macOS/Linux: lsof -i :5000 then kill -9 {PID}
```

## Next Steps

1. **Load Your University Data:**
   - Convert universityData.js locations to backend
   - Use admin panel to create locations

2. **Set Up Database:**
   - Configure MongoDB Atlas if using cloud
   - Create indexes for better performance

3. **Connect Frontend:**
   - Install dependencies in your React Native app
   - Implement API calls
   - Test navigation flows

4. **Deploy:**
   - Use platforms like Heroku, Railway, or Render
   - Set environment variables in production
   - Monitor logs and performance

## Testing Tools

- **Postman**: https://www.postman.com/ (API testing)
- **MongoDB Compass**: https://www.mongodb.com/products/compass (Database GUI)
- **Thunder Client**: VS Code extension for API testing

## Support Resources

- API Documentation: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Express.js: https://expressjs.com/
- MongoDB: https://docs.mongodb.com/
- Socket.io: https://socket.io/docs/
- OpenAI: https://platform.openai.com/docs/

---

Happy coding! 🚀
