# RaahVia Backend API Documentation

## Overview
RaahVia is a campus navigation system backend built with Node.js, Express, MongoDB, and Socket.io for real-time features.

## Features
- ✅ User Authentication (JWT)
- ✅ Location Management
- ✅ QR Code Generation & Scanning
- ✅ AI Assistant Integration (OpenAI)
- ✅ Real-time Navigation Tracking (Socket.io)
- ✅ User Preferences & Favorites
- ✅ Navigation History Tracking

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud)
- npm or yarn

### Setup Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your configuration:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/raahvia
   JWT_SECRET=your_secret_key
   OPENAI_API_KEY=your_api_key
   ```

3. **Start the Server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

4. **Verify Server is Running**
   ```bash
   curl http://localhost:5000/health
   ```

## API Endpoints

### Authentication (`/api/auth`)

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "department": "Engineering"
}

Response:
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token",
  "user": { ... }
}
```

#### Get Profile
```
GET /api/auth/me
Authorization: Bearer {token}

Response:
{
  "success": true,
  "user": { user_object }
}
```

#### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "0987654321",
  "department": "Science",
  "preferences": {
    "voiceGuidance": true,
    "darkMode": false,
    "language": "en"
  }
}

Response:
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { updated_user_object }
}
```

#### Add Favorite Place
```
POST /api/auth/favorites/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "locationId": "location_id"
}

Response:
{
  "success": true,
  "message": "Location added to favorites",
  "favoritePlaces": [...]
}
```

### Locations (`/api/locations`)

#### Get All Locations
```
GET /api/locations?category=Auditorium&floor=Ground&search=pharmacy

Query Parameters:
- category: Filter by category
- floor: Ground, 1st, 2nd, 3rd, 4th, 5th
- block: Filter by block
- search: Search by title or description

Response:
{
  "success": true,
  "count": 10,
  "locations": [...]
}
```

#### Get Location by ID
```
GET /api/locations/:id

Response:
{
  "success": true,
  "location": {
    "id": "location_id",
    "title": "Auditorium Stage",
    "block": "Auditorium",
    "floor": "Ground",
    "category": "Auditorium",
    "description": "Main stage for events",
    "distanceInMeters": 32.0,
    "voiceGuidance": "Walk 32 meters...",
    "qrCodeUrl": "data:image/png;base64...",
    ...
  }
}
```

#### Search Locations
```
GET /api/locations/search?query=pharmacy

Response:
{
  "success": true,
  "count": 5,
  "locations": [...]
}
```

#### Get Locations by Floor
```
GET /api/locations/floor/Ground

Response:
{
  "success": true,
  "count": 15,
  "locations": [...]
}
```

#### Create Location (Admin)
```
POST /api/locations
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "id": "new_location",
  "title": "New Location",
  "block": "Block A",
  "floor": "Ground",
  "category": "Academic",
  "description": "Description",
  "maxSteps": 50,
  "distanceInMeters": 38.5,
  "angle": 180,
  "targetCoord": { "x": 1.5, "y": 2.0 },
  "voiceGuidance": "Guidance text"
}
```

### QR Codes (`/api/qrcodes`)

#### Get QR Code by Location
```
GET /api/qrcodes/location/:locationId

Response:
{
  "success": true,
  "qrCode": {
    "id": "qr_id",
    "code": "location_id",
    "locationId": "location_id",
    "codeUrl": "data:image/png;base64...",
    "scans": 45,
    "isActive": true,
    "createdAt": "2025-01-17T..."
  }
}
```

#### Scan QR Code
```
POST /api/qrcodes/scan
Content-Type: application/json

{
  "qrCodeId": "qr_code_id"
}

Response:
{
  "success": true,
  "message": "QR code scanned successfully",
  "qrCode": { qr_code_object }
}
```

#### Get QR Code Statistics
```
GET /api/qrcodes/stats/:locationId

Response:
{
  "success": true,
  "stats": {
    "totalScans": 45,
    "lastScanned": "2025-01-17T...",
    "isActive": true,
    "createdAt": "2025-01-10T..."
  }
}
```

### AI Assistant (`/api/ai`)

#### Chat with AI
```
POST /api/ai/chat
Content-Type: application/json

{
  "message": "Where is the pharmacy?",
  "conversationContext": []
}

Response:
{
  "success": true,
  "response": "The pharmacy is located in the Pharmacy Block...",
  "timestamp": "2025-01-17T..."
}
```

#### Get Location Info
```
GET /api/ai/location-info?locationTitle=Auditorium

Response:
{
  "success": true,
  "response": "The auditorium is...",
  "location": "Auditorium"
}
```

#### Get Navigation Assistance
```
GET /api/ai/navigation-assistance?fromLocation=Pharmacy&toLocation=Auditorium

Response:
{
  "success": true,
  "response": "To navigate from Pharmacy to Auditorium...",
  "from": "Pharmacy",
  "to": "Auditorium"
}
```

## Real-Time Features (Socket.io)

### Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
  
  // Notify server about user joining
  socket.emit('user:join', {
    userId: 'user_id',
    name: 'John Doe'
  });
});
```

### Navigation Session Events

#### Start Navigation
```javascript
socket.emit('navigation:start', {
  userId: 'user_id',
  locationId: 'location_id'
});

socket.on('navigation:session-started', (data) => {
  console.log('Session started:', data.sessionId);
});
```

#### Update Location During Navigation
```javascript
socket.emit('navigation:location-update', {
  sessionId: 'session_id',
  latitude: 40.7128,
  longitude: -74.0060,
  accuracy: 5.0
});

socket.on('navigation:location-updated', (data) => {
  console.log('Location updated:', data);
});
```

#### End Navigation
```javascript
socket.emit('navigation:end', {
  sessionId: 'session_id'
});

socket.on('navigation:session-ended', (data) => {
  console.log('Session ended, duration:', data.duration);
});
```

### Broadcast Events

#### Online Users Count
```javascript
socket.on('users:online-count', (count) => {
  console.log('Users online:', count);
});
```

#### Active Sessions Count
```javascript
socket.emit('get:active-sessions');

socket.on('active-sessions:count', (data) => {
  console.log('Active sessions:', data.count);
});
```

## Database Models

### User
- name, email, password, phone, department
- preferences (voiceGuidance, darkMode, language)
- favoritePlaces, navigationHistory
- role (user, admin, staff)

### Location
- title, block, floor, category
- description, image, distanceInMeters
- voiceGuidance, targetCoord, angle
- accessibility, operatingHours, facilities
- rating, reviews, qrCodeUrl

### QRCode
- code, locationId, codeUrl
- scans, scanHistory
- lastScannedBy, lastScannedAt

### NavigationSession
- userId, startLocation, endLocation
- status (active, completed, cancelled, paused)
- distance, stepsCount, route
- feedback, duration

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

## Environment Variables

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/raahvia
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
MOBILE_APP_URL=http://localhost:8081
OPENAI_API_KEY=your_openai_api_key
AI_MODEL=gpt-3.5-turbo
QR_CODE_HOST=http://localhost:5000
```

## Running in Production

1. Build the application:
   ```bash
   npm install
   ```

2. Set environment variables:
   ```bash
   export NODE_ENV=production
   export MONGODB_URI=your_production_mongodb_uri
   export JWT_SECRET=your_production_secret
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Development

For development with auto-reload:
```bash
npm run dev
```

This requires `nodemon` which is included in devDependencies.

## Testing the API

Use tools like:
- **Postman**: https://www.postman.com/
- **Thunder Client**: https://www.thunderclient.com/
- **cURL**: Command-line tool
- **Insomnia**: https://insomnia.rest/

## Support

For issues or questions about the API, please check:
- Error messages in response body
- Server logs in terminal
- This documentation

---

**Version**: 1.0.0
**Last Updated**: January 17, 2025
