# Backend Setup Checklist

## Environment Setup
- [ ] Node.js installed (v16 or higher)
- [ ] MongoDB installed or Atlas account created
- [ ] npm dependencies installed: `npm install`
- [ ] `.env` file created from `.env.example`

## Environment Variables
- [ ] `PORT` configured (default: 5000)
- [ ] `MONGODB_URI` set (local or cloud)
- [ ] `JWT_SECRET` set to a strong key
- [ ] `JWT_EXPIRE` set (default: 7d)
- [ ] `OPENAI_API_KEY` set (if using AI features)
- [ ] `NODE_ENV` set to development/production

## Database Configuration
- [ ] MongoDB connection tested
- [ ] Database `raahvia` created
- [ ] Collections auto-created by Mongoose

## Server Startup
- [ ] Server starts without errors: `npm run dev`
- [ ] Health endpoint responds: `curl http://localhost:5000/health`
- [ ] Socket.io is active
- [ ] No CORS errors in console

## API Testing
- [ ] POST `/api/auth/register` works
- [ ] POST `/api/auth/login` works
- [ ] GET `/api/locations` returns data
- [ ] GET `/api/locations/search` works
- [ ] POST `/api/ai/chat` responds (if OPENAI_API_KEY set)
- [ ] POST `/api/qrcodes/scan` works

## Real-time Features
- [ ] Socket.io connects from client
- [ ] `user:join` event registers users
- [ ] `navigation:start` creates sessions
- [ ] `navigation:location-update` tracks movement
- [ ] `users:online-count` broadcasts correctly

## Frontend Integration
- [ ] React Native app can call API endpoints
- [ ] Authentication token stored correctly
- [ ] Socket.io client connected
- [ ] Location data displays on dashboard
- [ ] Navigation tracking works

## Optional Features
- [ ] QR code generation tested
- [ ] AI assistant responds to queries
- [ ] User preferences save correctly
- [ ] Favorites system works
- [ ] Navigation history recorded

## Deployment Readiness
- [ ] Environment variables configured for production
- [ ] MongoDB Atlas connection verified
- [ ] Error handling tested
- [ ] Logging configured
- [ ] CORS origins set correctly

## Performance & Security
- [ ] Passwords hashed with bcrypt
- [ ] JWT tokens validated
- [ ] Rate limiting considered
- [ ] Input validation in place
- [ ] Error messages don't leak info

## Documentation
- [ ] API_DOCUMENTATION.md reviewed
- [ ] QUICKSTART.md completed
- [ ] All endpoints documented
- [ ] Examples provided for integration

---

**Checklist completed on**: ________________
**Team member**: ________________
