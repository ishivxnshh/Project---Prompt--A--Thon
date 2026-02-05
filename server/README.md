# TimeMap Backend API

Backend server for TimeMap - AI-powered task prioritization and time management application.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Gemini API** - AI task prioritization
- **bcryptjs** - Password hashing

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/timemap
JWT_SECRET=your_secure_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

**Get Gemini API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste it into your `.env` file

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# Mac/Linux
mongod
```

### 4. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### POST `/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST `/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Tasks (All require Authentication)

**Authentication Header:**
```
Authorization: Bearer <your_jwt_token>
```

#### GET `/tasks`
Get all tasks for the authenticated user.

**Response:**
```json
[
  {
    "_id": "task_id",
    "userId": "user_id",
    "title": "Complete project",
    "description": "Finish the TimeMap integration",
    "priority": "high",
    "estimatedTime": 120,
    "dueDate": "2024-01-31T12:00:00.000Z",
    "status": "todo",
    "completed": false,
    "createdAt": "2024-01-30T10:00:00.000Z"
  }
]
```

#### POST `/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "Complete project",
  "description": "Finish the TimeMap integration",
  "priority": "high",
  "estimatedTime": 120,
  "dueDate": "2024-01-31T12:00:00.000Z"
}
```

#### PUT `/tasks/:id`
Update an existing task.

**Request Body:**
```json
{
  "title": "Updated title",
  "completed": true,
  "priority": "medium"
}
```

#### DELETE `/tasks/:id`
Delete a task.

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

### AI Prioritization

#### POST `/ai/prioritize`
Get AI-powered task prioritization.

**Response:**
```json
{
  "prioritizedTasks": [
    { /* task object */ },
    { /* task object */ }
  ],
  "reasoning": "Tasks are prioritized based on urgency and importance..."
}
```

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.js       # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js # Auth logic
│   │   ├── taskController.js # Task CRUD
│   │   └── aiController.js   # AI prioritization
│   ├── middleware/
│   │   └── auth.js           # JWT verification
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── Task.js           # Task schema
│   ├── routes/
│   │   ├── auth.js           # Auth routes
│   │   ├── tasks.js          # Task routes
│   │   └── ai.js             # AI routes
│   └── server.js             # Main entry point
├── .env.example              # Environment template
├── .gitignore
└── package.json
```

## Database Models

### User
- `email` (String, unique, required)
- `password` (String, hashed, required)
- `name` (String)
- `createdAt` (Date)

### Task
- `userId` (ObjectId, ref: User)
- `title` (String, required)
- `description` (String)
- `priority` (String: 'low' | 'medium' | 'high')
- `estimatedTime` (Number, minutes)
- `dueDate` (Date)
- `status` (String: 'todo' | 'done')
- `completed` (Boolean)
- `createdAt` (Date)

## Features

✅ JWT-based authentication
✅ Password hashing with bcrypt
✅ Protected API routes
✅ MongoDB data persistence
✅ AI-powered task prioritization via Gemini
✅ CRUD operations for tasks
✅ Error handling and validation
✅ CORS enabled for frontend integration

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the `MONGODB_URI` in your `.env` file
- Default: `mongodb://localhost:27017/timemap`

### Gemini API Errors
- Verify your API key is correct
- Check your API quota/limits
- The system has fallback logic if AI fails

### Port Already in Use
- Change the `PORT` in `.env` file
- Or kill the process using port 5000

## Next Steps

1. Install dependencies: `npm install`
2. Configure `.env` file
3. Start MongoDB
4. Run server: `npm run dev`
5. Test endpoints with Postman or integrate with frontend
