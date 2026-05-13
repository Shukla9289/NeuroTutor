
# 🧬 NeuroTutor — Full-Stack AI Learning Platform

An intelligent, adaptive learning platform powered by Claude AI.
Features AI tutoring, adaptive quizzes, code execution, and progress tracking.

Deployment notes are in `DEPLOYMENT.md`. Use `.env.example` for production/Docker environment variables.

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+ and npm
- Java 17+ and Maven
- PostgreSQL 15+
- Redis 7+
- Groq API Key -> https://console.groq.com

---

### Step 1: Clone & Setup

```bash
# Extract the ZIP, then navigate to the project folder
cd NeuroTutor
```

---

### Step 2: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Start development server (runs on http://localhost:3000)
npm run dev
```

---

### Step 3: Backend Setup

**Create PostgreSQL database:**
```sql
CREATE DATABASE neurotutor;
```

**Configure backend:**

Edit `backend/src/main/resources/application.properties`:
```properties
# Change these:
SPRING_DATASOURCE_PASSWORD=YOUR_POSTGRES_PASSWORD
JWT_SECRET=any_long_random_string_minimum_32_chars
GROQ_API_KEY=gsk_YOUR_API_KEY_HERE

# Optional (for Google/GitHub login):
spring.security.oauth2.client.registration.google.client-id=...
spring.security.oauth2.client.registration.google.client-secret=...
```

**Run backend:**
```bash
cd backend
mvn spring-boot:run
# Backend starts on http://localhost:8080
```

---

### Step 4: Open the App

Visit **http://localhost:3000** in your browser.

- Register a new account
- Start asking the AI tutor questions!

---

## 🐳 Docker Setup (One Command)

```bash
# Copy and fill deployment variables
cp .env.example .env

# Required: set GROQ_API_KEY and JWT_SECRET in .env

# Start everything
docker-compose up --build
```

Then visit http://localhost:3000 ✅

---

## 📁 Project Structure

```
NeuroTutor/
├── frontend/                    # React + Vite app
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   └── Navbar.jsx       # Sidebar navigation
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Auth page
│   │   │   ├── Dashboard.jsx    # Home dashboard
│   │   │   ├── Chat.jsx         # AI Tutor chat
│   │   │   ├── Quiz.jsx         # Adaptive quiz engine
│   │   │   ├── CodePlayground.jsx # Code editor
│   │   │   └── Progress.jsx     # Progress tracking
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # JWT auth state
│   │   │   └── ThemeContext.jsx # Theme toggle
│   │   └── services/
│   │       ├── api.js           # Axios with JWT
│   │       └── websocket.js     # STOMP WebSocket
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Spring Boot app
│   └── src/main/java/com/neurotutor/
│       ├── NeuroTutorApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java    # JWT + OAuth2
│       │   └── WebSocketConfig.java   # STOMP
│       ├── controller/
│       │   ├── AuthController.java    # /api/auth
│       │   ├── ChatController.java    # /api/chat
│       │   ├── QuizController.java    # /api/quiz
│       │   ├── CodeController.java    # /api/code
│       │   └── ProgressController.java# /api/progress
│       ├── service/
│       │   ├── ClaudeAIService.java   # Anthropic API
│       │   └── UserService.java       # User management
│       ├── model/
│       │   ├── User.java
│       │   └── ChatSession.java
│       ├── repository/
│       │   └── UserRepository.java
│       └── security/
│           ├── JwtUtil.java
│           └── JwtAuthFilter.java
│
└── docker-compose.yml           # Full stack Docker
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 AI Chat | Claude-powered tutor with streaming responses |
| 🏛️ Socratic Mode | Never gives direct answers, guides you |
| ⚔️ Debate Mode | Devil's advocate for critical thinking |
| 🧠 Adaptive Quiz | AI-generated quizzes by subject & difficulty |
| 💻 Code Lab | Write and run Python (Docker sandbox) + AI review |
| 📈 Progress | XP system, streaks, badges, mastery heatmaps |
| 🎤 Voice Input | Browser Web Speech API |
| 🔐 Auth | JWT + Google/GitHub OAuth2 |

---

## 🔑 API Keys Needed

1. **Groq API** (Required) -> https://console.groq.com
2. **Google OAuth** (Optional) — https://console.cloud.google.com
3. **GitHub OAuth** (Optional) — https://github.com/settings/developers

---

## 🛠 Tech Stack

**Frontend:** React 18, Vite, React Router, Axios, STOMP WebSocket

**Backend:** Spring Boot 3.2, Spring Security, JPA, WebFlux

**Database:** PostgreSQL + pgvector (for future embeddings/RAG)

**Cache:** Redis (sessions + rate limiting)

**AI:** Groq-compatible OpenAI chat completions

---

## 📝 Notes

- The frontend works in **demo mode** even without the backend connected
  (shows sample data and offline fallbacks)
- To enable real AI responses, set `GROQ_API_KEY` in `.env` or your deployment platform
- Code execution sandbox (Docker runner) requires Docker to be installed

---

Built with ❤️ using NeuroTutor Architecture
