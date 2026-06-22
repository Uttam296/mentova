# Backend API Plan — Mentova

> Early planning notes for the backend architecture. This gets implemented starting Day 12.

## Tech Decisions
- **Server**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Real-time**: Socket.IO for chat messaging

## Planned Data Models
- `User` — name, email, password, role (mentor/mentee), year, department, bio, skills, rating
- `Resource` — title, description, category, subject, uploader, likes, tags
- `Message` — sender, receiver, content, timestamp, read status
- `Mentorship` — mentor, mentee, status (pending/accepted/rejected/completed), goals, rating

## Planned API Routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/login` | Authenticate and return JWT |
| GET | `/api/users/mentors` | List all mentors with filters |
| GET | `/api/users/profile` | Get current user profile |
| PUT | `/api/users/profile` | Update profile |
| GET | `/api/resources` | List resources with filters |
| POST | `/api/resources` | Create new resource |
| POST | `/api/resources/:id/like` | Like/unlike a resource |
| POST | `/api/mentorship/request` | Send mentorship request |
| GET | `/api/mentorship/my` | Get user's mentorships |
| PUT | `/api/mentorship/:id/status` | Accept/reject/complete request |
| GET | `/api/messages/:userId` | Get conversation with a user |
| POST | `/api/messages` | Send a message |

## Security Notes
- All routes except register/login require JWT auth middleware
- Passwords hashed with bcrypt before storage
- `.env` file used for secrets, never committed to git
