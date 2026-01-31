# AI Counsellor Backend

Node.js + Express + PostgreSQL backend for the AI Counsellor hackathon project.

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_counsellor_dev
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

### 3. Set Up Database

```bash
# Create PostgreSQL database
createdb ai_counsellor_dev

# (Optional) Run migrations if available
# npm run migrate
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:5000`

### 5. Verify Server is Running

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "AI Counsellor backend is running",
  "timestamp": "2026-01-26T...",
  "environment": "development"
}
```

## 📁 Project Structure

```
server/
├── src/
│   ├── index.js          # Server entry point
│   ├── app.js            # Express app configuration
│   ├── config/           # Configuration files (TBD)
│   ├── routes/           # API routes (TBD)
│   ├── controllers/      # Business logic (TBD)
│   ├── middleware/       # Custom middleware (TBD)
│   ├── models/           # Database models (TBD)
│   └── utils/            # Utility functions (TBD)
├── .env                  # Environment variables (local)
├── .env.example          # Environment template
├── package.json          # Dependencies
└── README.md             # This file
```

## 🔌 Available Endpoints

### Health Check
- `GET /health` - Server status (no auth required)

### Authentication ✅ (Complete)
- `POST /api/auth/signup` - User registration with JWT token
- `POST /api/auth/login` - User login with JWT token
- `GET /api/auth/me` - Get authenticated user profile

See [AUTH_API.md](AUTH_API.md) for complete documentation.

### Profile/Onboarding ✅ (Complete)
- `GET /api/profile/me` - Get user profile with completion status
- `POST /api/profile` - Create or update user onboarding data

Captures: Name, Grade, Stream, Interests, Career Aspirations, Budget Range, Exam Readiness

See [PROFILE_API.md](PROFILE_API.md) for complete documentation.

### Universities (TODO)
- `GET /api/universities` - Get all universities with filtering

### Shortlist (TODO)
- `GET /api/shortlist` - Get user's shortlist
- `POST /api/shortlist` - Add university to shortlist
- `POST /api/shortlist/lock` - Lock shortlist

### Applications (TODO)
- `GET /api/applications` - Get user's applications
- `POST /api/applications` - Submit application

### AI Counsellor (TODO)
- `POST /api/counsellor/chat` - Send message to AI counsellor

## 🔒 CORS Configuration

Currently allows requests from:
- `http://localhost:5173` (Vite development server)

To allow other origins, update `FRONTEND_URL` in `.env`

## 📦 Dependencies

- **express**: Web framework
- **cors**: Cross-Origin Resource Sharing
- **dotenv**: Environment variable management
- **pg**: PostgreSQL client
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **uuid**: Unique ID generation
- **nodemon** (dev): Auto-reload server on changes

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server with auto-reload
npm start        # Start production server
npm test         # Run tests (TBD)
```

## 🧪 Testing Endpoints

### Using cURL

```bash
# Health check
curl http://localhost:5000/health

# Signup (placeholder)
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Login (placeholder)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Using Postman

1. Import endpoints into Postman collection
2. Set base URL to `http://localhost:5000`
3. Test each endpoint with sample payloads

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill the process (Windows)
taskkill /PID <PID> /F

# Or change PORT in .env
PORT=5001
```

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
Ensure PostgreSQL is running and credentials in `.env` are correct.

### CORS Errors
Check that `FRONTEND_URL` in `.env` matches your frontend's actual URL.

### Module Not Found: 'express'
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 5000 | Server port |
| NODE_ENV | No | development | Environment |
| DB_HOST | Yes | localhost | PostgreSQL host |
| DB_PORT | Yes | 5432 | PostgreSQL port |
| DB_NAME | Yes | ai_counsellor_dev | Database name |
| DB_USER | Yes | postgres | Database user |
| DB_PASSWORD | Yes | password | Database password |
| JWT_SECRET | Yes | N/A | JWT signing secret |
| FRONTEND_URL | No | http://localhost:5173 | Frontend origin |

## 🔐 Security Notes

⚠️ **For Development Only** - Current setup is NOT production-ready.

Before deploying to production:
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Implement rate limiting
- [ ] Add request validation/sanitization
- [ ] Use environment-specific .env files
- [ ] Enable helmet for security headers
- [ ] Implement comprehensive error handling
- [ ] Add logging and monitoring
- [ ] Use connection pooling for database

## 📚 Next Steps

1. Implement authentication routes with JWT
2. Set up PostgreSQL models and migrations
3. Implement business logic for each endpoint
4. Add comprehensive error handling
5. Add input validation using libraries like `joi` or `yup`
6. Add logging with `winston` or `pino`
7. Implement tests with `jest` or `mocha`
8. Set up CI/CD pipeline

## 🤝 Contributing

Follow these standards:
- Use ES6 modules
- Follow existing code style
- Add JSDoc comments for functions
- Test endpoints before pushing
- Commit with clear messages

## 📄 License

MIT

---

**Last Updated:** January 26, 2026  
**Status:** MVP Backend Ready ✅
