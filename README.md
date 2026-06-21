# 🎓 Mentova — College Junior-Senior Connect Platform

> A full-stack web application that bridges the gap between junior and senior college students through mentorship, resource sharing, and real-time chat.

---

## 📁 Folder Structure

```
mentova/
│
├── backend/                    # Node.js + Express + MongoDB API
│   ├── models/
│   │   ├── User.js             # User schema (mentor/mentee)
│   │   ├── Resource.js         # Shared resources
│   │   ├── Message.js          # Chat messages
│   │   └── Mentorship.js       # Mentorship connections
│   ├── routes/
│   │   ├── auth.js             # Register & Login
│   │   ├── users.js            # Profile & mentor listing
│   │   ├── resources.js        # Resource CRUD
│   │   ├── messages.js         # Chat REST API
│   │   └── mentorship.js       # Mentorship requests
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── .env                    # Environment variables
│   ├── server.js               # Express + Socket.IO server
│   └── package.json
│
├── frontend/                   # React.js SPA
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.js  # Global auth state
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── Navbar.css
│   │   ├── pages/
│   │   │   ├── Landing.js/css  # Public homepage
│   │   │   ├── Login.js/css    # Login page
│   │   │   ├── Register.js     # 2-step registration
│   │   │   ├── Dashboard.js    # Main dashboard
│   │   │   ├── Mentors.js      # Browse & request mentors
│   │   │   ├── Resources.js    # Public resource hub
│   │   │   ├── Chat.js         # Real-time messaging
│   │   │   ├── Profile.js      # Edit profile
│   │   │   └── MentorshipRequests.js
│   │   ├── App.js              # Routes
│   │   ├── App.css             # Design system / tokens
│   │   └── index.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Prerequisites — Install These First

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18+ | https://nodejs.org |
| MongoDB | v6+ | https://www.mongodb.com/try/download/community |
| npm | v9+ | Comes with Node.js |

---

## 🚀 How to Run the Project

### Step 1 — Clone / Extract the project

```bash
# If you downloaded a zip, extract it, then navigate into it:
cd mentova
```

### Step 2 — Start MongoDB

**Windows:**
```bash
# MongoDB should run as a service automatically after install.
# Or start it manually:
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### Step 3 — Set up and run Backend

```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

You should see:
```
Server running on port 5000
MongoDB connected
```

### Step 4 — Set up and run Frontend (new terminal)

```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000 automatically
```

---

## 🌐 Application URLs

| Page | URL |
|------|-----|
| Landing / Home | http://localhost:3000 |
| Register | http://localhost:3000/register |
| Login | http://localhost:3000/login |
| Dashboard | http://localhost:3000/dashboard |
| Find Mentors | http://localhost:3000/mentors |
| Resources | http://localhost:3000/resources |
| Chat | http://localhost:3000/chat |
| Profile | http://localhost:3000/profile |
| Mentorships | http://localhost:3000/mentorships |

---

## 🤖 AI Mentor Setup (Free — No Credit Card Needed)

The AI Mentor feature is powered by **Groq** (Llama 3.3 70B, free tier — no billing required).

1. Go to **[console.groq.com/keys](https://console.groq.com/keys)**
2. Sign in with Google → click **Create API Key** → copy it
3. Open `backend/.env` and paste it in:
   ```env
   GROQ_API_KEY=your_actual_key_here
   ```
4. Restart the backend (`Ctrl+C` then `npm start`)

That's it — no billing setup, no card verification needed.

---

## 🔑 Environment Variables (backend/.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mentova
JWT_SECRET=college_connect_super_secret_key_2024
NODE_ENV=development
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

---

## 🧪 Quick Test — Create Demo Accounts

1. Open http://localhost:3000/register
2. **Create a Mentor account:** Choose "I'm a Mentor", fill details (3rd/4th year)
3. **Create a Mentee account:** Choose "I'm a Mentee", fill details (1st/2nd year)
4. Log in as mentee → Find Mentors → Send a request
5. Log in as mentor → Mentorships → Accept the request
6. Chat in real time between the two accounts!

---

## ✨ Features Implemented

- ✅ Role-based auth (Mentor / Mentee) with JWT
- ✅ Two-step registration with skill selection
- ✅ Mentor discovery with department & skill filters
- ✅ Mentorship request + accept/reject flow
- ✅ Real-time chat with Socket.IO
- ✅ Quick reply suggestions in chat
- ✅ Public resource sharing (Notes, Papers, Videos, Career, etc.)
- ✅ Resource likes system
- ✅ Star rating & review system for mentors
- ✅ Editable user profiles with LinkedIn/GitHub links
- ✅ Responsive design (mobile-friendly)
- ✅ Animated landing page

---

## 🛠️ Tech Stack

**Frontend:** React 18, React Router v6, Axios, Socket.IO Client, CSS Variables  
**Backend:** Node.js, Express.js, MongoDB, Mongoose, Socket.IO, JWT, bcryptjs  
**Database:** MongoDB (local or Atlas)

---

## ☁️ Deploying to the Cloud (Optional)

### Backend → Render.com
1. Push backend folder to GitHub
2. New Web Service on render.com → connect repo
3. Build command: `npm install`, Start: `node server.js`
4. Add env vars in Render dashboard

### Frontend → Vercel
1. Push frontend folder to GitHub
2. Import on vercel.com → auto-detects React
3. Set `REACT_APP_API_URL=https://your-render-url.onrender.com/api`

### Database → MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Get connection string → replace `MONGO_URI` in .env

---

## 📦 NPM Packages Used

### Backend
```
express          - Web framework
mongoose         - MongoDB ODM
socket.io        - Real-time WebSocket
jsonwebtoken     - JWT authentication
bcryptjs         - Password hashing
cors             - Cross-origin requests
dotenv           - Environment variables
multer           - File uploads (ready to use)
```

### Frontend
```
react            - UI library
react-router-dom - Client-side routing
axios            - HTTP client
socket.io-client - Real-time chat
```
