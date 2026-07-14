# Valthor

An immersive, gamified Data Structures and Algorithms (DSA) learning adventure platform built with a dark fantasy RPG theme. The platform transforms coding practice into an epic progression system featuring RPG-style realms, boss battles, guild alliances, real-time contests, active achievements, and deep learning analytics.

---

## 🧭 Project Architecture Overview

The system uses a decoupled client-server architecture built on the MERN stack:

```
┌─────────────────┐         HTTPS         ┌──────────────────┐
│   Vite Client   │ ────────────────────> │  Express Server  │
│  (React Router) │ <──────────────────── │   (REST APIs)    │
└─────────────────┘      JSON Payload     └──────────────────┘
         │                                         │
         ▼                                         ▼
   Tailwind CSS                             Mongoose ODM
   Monaco Editor                           ┌────────────────┐
   Recharts Engine                         │  MongoDB Atlas │
                                           └────────────────┘
```

---

## 📂 Codebase Folder Structure

```
gamified-dsa-platform/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI & Layout Components
│   │   ├── constants/          # Route Constants (routes.js)
│   │   ├── context/            # AuthContext & Session Provider
│   │   ├── pages/              # Viewports (Dashboard, Arena, Guilds, Analytics...)
│   │   ├── services/           # API Connectors (social.api, analytics.api...)
│   │   └── App.jsx
│   └── vite.config.js          # Vite config with manual rollup chunk splitting
└── server/                     # Backend Application
    ├── src/
    │   ├── controllers/        # Express handlers (Social, Analytics, Contests...)
    │   ├── middleware/         # Auth, error, and rate-limiting middleware
    │   ├── models/             # Mongoose Models (User, Guild, Submission...)
    │   ├── routes/             # REST Route mappings
    │   ├── services/           # Core business logic (Reward engine, Elo ratings...)
    │   └── app.js              # Server entry point
    └── test_social_system.js   # Integration test suites
```

---

## 🗄️ Database Schemas

### 1. **User**
- `username`: String (Unique)
- `email`: String (Unique)
- `password`: String (Bcrypt hashed)
- `xp`: Number (Total experience)
- `coins`: Number (For shop purchases)
- `level`: Number (Level tier)
- `role`: Enum `['student', 'moderator', 'admin']`
- `contestRating`: Number (Default 1500)
- `highestRating`: Number (Default 1500)

### 2. **Guild**
- `name`: String (Unique)
- `description`: String
- `inviteCode`: String (Unique)
- `owner`: ObjectId ➔ User
- `members`: [ObjectId ➔ User]
- `level`: Number (Alliance tier)
- `xp`: Number (Alliance experience)

### 3. **Friendship**
- `requester`: ObjectId ➔ User
- `recipient`: ObjectId ➔ User
- `status`: Enum `['pending', 'accepted', 'rejected']`

### 4. **Notification**
- `recipient`: ObjectId ➔ User
- `sender`: ObjectId ➔ User (Optional)
- `type`: Enum `['friend_request', 'friend_accepted', 'quest_completed', 'guild_invite'...]`
- `title`: String
- `message`: String
- `isRead`: Boolean
- `data`: Mixed Schema

---

## 🔌 API Documentation Summary

### **Authentication**
- `POST /api/auth/register` - Create new contender profile.
- `POST /api/auth/login` - Initiate session.
- `POST /api/auth/logout` - Clear cookies.

### **Social & Alliance**
- `POST /api/social/friends/request` - Send friend resonance lock request.
- `PUT /api/social/friends/request/:id/accept` - Accept incoming link.
- `POST /api/social/guilds` - Found new alliance guild.
- `POST /api/social/guilds/join` - Join faction using invite code.
- `GET /api/social/notifications/unread-count` - Fetch alert counts.

### **Analytics & Insights**
- `GET /api/analytics/user` - Fetch difficulty solves, language usages, and recommendations.
- `GET /api/analytics/activity` - Fetch daily commits for the calendar heatmap.
- `GET /api/analytics/topic-mastery` - Fetch radar-chart topic values.
- `GET /api/analytics/admin` - Global registrations and submission loads (restricted to staff).

---

## 🚀 Environment Setup & Deployment

### **1. Server Setup**
Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gamified-dsa
JWT_SECRET=abyss_protocol_secret_key
NODE_ENV=production
```
Start server:
```bash
cd server
npm install
npm start
```

### **2. Client Setup**
Create `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
Build client:
```bash
cd client
npm install
npm run build
```

---

## 🎯 Resume & Interview Talking Points

- **Bundle Optimization**: "Configured Vite's Rollup manual chunking to divide React dependencies, Recharts (`vendor-charts`), Monaco editor, and React-icons into isolated chunks, reducing the core entry point bundle size to just 24kB."
- **N+1 Database Query Avoidance**: "Constructed complex MongoDB aggregation pipelines for social statistics and analytics, grouping and populating matching records in a single database round-trip, significantly saving database load."
- **State Synchronizations**: "Connected XP/solve completions hooks into Guild models and achievements. Solving a problem dynamically updates the user's XP, user level, achievements status, and the guild's experience levels in a unified transaction."
