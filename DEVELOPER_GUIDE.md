# NiCE AI Platform - Developer Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Repository Structure](#repository-structure)
4. [Getting Started](#getting-started)
5. [Backend Setup](#backend-setup)
6. [Frontend Setup](#frontend-setup)
7. [Development Workflow](#development-workflow)
8. [API Documentation](#api-documentation)
9. [Database Schema](#database-schema)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)
12. [Contributing Guidelines](#contributing-guidelines)

---

## 📖 Project Overview

The NiCE AI Platform is a comprehensive solution for analyzing 911 emergency calls using AI-powered transcription and quality assurance. The platform consists of two main components:

- **Backend (Inform-AI-Backend)**: FastAPI-based REST API that handles call processing, AI integration, and data management
- **Frontend (NiCE_AI_Dashboar_Demo)**: Next.js dashboard for visualization, analytics, and call management

### Key Features

- 🎙️ **AI-Powered Transcription**: Automatic call transcription via Elevate AI
- 📊 **Analytics Dashboard**: Real-time metrics and performance tracking
- 🎯 **Quality Assurance**: Automated evaluation and scoring of emergency calls
- 👥 **Agent Coaching**: Performance tracking and improvement recommendations
- 📝 **Protocol Management**: Customizable evaluation criteria and question sets
- 🎵 **Audio Playback**: Advanced waveform visualization and playback controls

---

## 🏗️ System Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  Next.js        │────────▶│  FastAPI         │────────▶│  Elevate AI     │
│  Frontend       │  REST   │  Backend         │  API    │  (Transcription)│
│  (Vercel)       │◀────────│  (Render)        │◀────────│                 │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │                  │
                            │  MongoDB Atlas   │
                            │  (Database)      │
                            │                  │
                            └──────────────────┘
```

### Technology Stack

#### Backend
- **Framework**: FastAPI 0.118.3
- **Database**: MongoDB (via PyMongo)
- **AI Integration**: Elevate AI API, OpenAI GPT
- **Authentication**: JWT with PyJWT
- **Language**: Python 3.13
- **Deployment**: Render
- **CORS**: Configurable origins for frontend integration

#### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + Custom component library
- **State Management**: React Hooks
- **Charts**: Recharts
- **Audio**: WaveSurfer.js
- **Deployment**: Vercel

---

## 📁 Repository Structure

### Backend Repository: `Inform-AI-Backend`

```
Inform-AI-Backend/
├── main.py                    # FastAPI application entry point
├── models.py                  # Pydantic data models and schemas
├── db_connect.py             # MongoDB connection handler
├── requirements.txt          # Python dependencies
├── runtime.txt               # Python version specification
├── env_example               # Environment variables template
├── Controllers/              # Business logic layer
│   ├── CallController.py         # Call processing logic
│   ├── ElevateController.py      # Elevate AI integration
│   ├── ProtocolController.py     # Protocol management
│   ├── questionSetController.py  # Question set operations
│   └── userController.py         # User management
├── Routes/                   # API endpoint definitions
│   ├── AuthRoutes.py             # Authentication endpoints
│   ├── CallsRoutes.py            # Call management endpoints
│   ├── CoachingRoutes.py         # Coaching features
│   ├── Elevate_API_Routes.py     # Elevate AI proxy routes
│   ├── ProtocolRoutes.py         # Protocol CRUD operations
│   ├── questionSetRoutes.py      # Question set endpoints
│   └── userRoutes.py             # User management endpoints
├── helperClasses/            # Utility classes
│   ├── AgencySpecificQA.py       # Agency-specific Q&A logic
│   └── GPT5nano.py               # GPT integration helpers
└── uploads/                  # Temporary file storage for uploads
```

### Frontend Repository: `NiCE_AI_Dashboar_Demo`

```
NiCE_AI_Dashboar_Demo/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (dashboard)/          # Protected dashboard routes
│   │   │   ├── overview/             # Main dashboard
│   │   │   ├── analytics/            # Analytics page
│   │   │   ├── analyticsv2/          # Enhanced analytics
│   │   │   ├── coaching/             # Coaching module
│   │   │   ├── evaluations/          # Call evaluations
│   │   │   ├── interactions/         # Interaction management
│   │   │   ├── protocols/            # Protocol configuration
│   │   │   ├── settings/             # App settings
│   │   │   ├── upload/               # File upload interface
│   │   │   └── directory/            # Employee directory
│   │   ├── auth/                 # Authentication pages
│   │   │   └── login/                # Login page
│   │   ├── api/                  # API routes
│   │   │   └── proxy/                # Backend proxy
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/               # React components
│   │   ├── ui/                       # Base UI components (Radix)
│   │   ├── sidebar.tsx               # Navigation sidebar
│   │   ├── top-nav.tsx               # Top navigation bar
│   │   ├── interaction-drawer.tsx    # Interaction details
│   │   ├── audio-player-with-waveform-v2.tsx  # Audio player
│   │   ├── add-question-drawer.tsx   # Question management
│   │   └── [other feature components]
│   ├── hooks/                    # Custom React hooks
│   │   └── use-toast.ts
│   └── lib/                      # Utilities and helpers
│       ├── utils.ts                  # Helper functions
│       └── sample-data.ts            # Mock data for development
├── public/                       # Static assets
├── package.json                  # Node.js dependencies
├── tsconfig.json                 # TypeScript configuration
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── components.json               # shadcn/ui configuration
```

---

## 🚀 Getting Started

### Prerequisites

Before starting, ensure you have the following installed:

- **Git**: Version control ([Download](https://git-scm.com/downloads))
- **Node.js**: v20 or higher ([Download](https://nodejs.org/))
- **Python**: v3.13 or compatible ([Download](https://www.python.org/downloads/))
- **MongoDB**: Account on MongoDB Atlas or local instance
- **Code Editor**: VS Code recommended ([Download](https://code.visualstudio.com/))

### Accounts and API Keys Required

You'll need access to the following services:

1. **MongoDB Atlas** - Database hosting
2. **Elevate AI** - Transcription API (contact for API token)
3. **OpenAI** (optional) - For GPT-based features
4. **Hugging Face** (optional) - For additional AI models
5. **GitHub** - Access to both repositories
6. **Render** - Backend deployment (optional for local dev)
7. **Vercel** - Frontend deployment (optional for local dev)

---

## 🔧 Backend Setup

### 1. Clone the Backend Repository

```powershell
# Clone from GitHub (replace with actual repo URL)
git clone https://github.com/siddhartha276/Inform-AI-Backend.git
cd Inform-AI-Backend
```

### 2. Create a Virtual Environment

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment (PowerShell)
.\venv\Scripts\Activate.ps1

# If you get execution policy errors, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```powershell
# Create .env file
New-Item -Path .env -ItemType File
```

Add the following configuration to `.env`:

```env
# Elevate AI Configuration
ELEVATEAI_API_TOKEN=your_elevate_ai_token_here
ELEVATEAI_BASE_URL=https://api.elevateai.com/v1

# AI Models (Optional)
HUGGINGFACE_T=your_huggingface_token_here
OPENAI_API_KEY=your_openai_key_here

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# CORS Configuration
ORIGINS=http://localhost:3000,https://your-frontend-domain.vercel.app

# Server Configuration
PORT=5001
```

**⚠️ Important**: Never commit the `.env` file to version control. It's already in `.gitignore`.

### 5. Set Up MongoDB Database

1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your IP address (or allow access from anywhere for development)
5. Get your connection string and update `MONGODB_URI` in `.env`

### 6. Run the Backend Server

```powershell
# Development mode with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 5001

# Or use Python directly
python main.py
```

The backend should now be running at `http://localhost:5001`

### 7. Verify Backend is Running

Open your browser and navigate to:
- API Docs: `http://localhost:5001/docs` (Swagger UI)
- Alternative Docs: `http://localhost:5001/redoc`

---

## 💻 Frontend Setup

### 1. Clone the Frontend Repository

```powershell
# Navigate to your projects folder
cd ..

# Clone from GitHub (replace with actual repo URL)
git clone https://github.com/dreuxhebert/NiCE_AI_Dashboar_Demo.git
cd NiCE_AI_Dashboar_Demo
```

### 2. Install Dependencies

```powershell
# Use clean install for reproducible builds
npm ci

# If npm ci fails, use:
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```powershell
New-Item -Path .env.local -ItemType File
```

Add the following configuration:

```env
# Backend API URL
NEXT_PUBLIC_API_BASE=http://localhost:5001

# Optional: Use proxy for API calls (recommended for production)
NEXT_PUBLIC_USE_PROXY=false

# Vercel Analytics (optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

**Development vs Production:**
- **Local Development**: Point to `http://localhost:5001`
- **Production**: Point to your Render backend URL (e.g., `https://your-app.onrender.com`)

### 4. Add Test Audio Files (Optional)

For testing audio playback features:

```powershell
# Place your test audio file in the public directory
Copy-Item "path\to\your\audio.mp3" -Destination "public\elevator_music.mp3"
```

Recommended sources for royalty-free test audio:
- [Freesound.org](https://freesound.org)
- [Pixabay Music](https://pixabay.com/music/)

### 5. Run the Frontend Development Server

```powershell
npm run dev
```

The frontend should now be running at `http://localhost:3000`

### 6. Verify Frontend is Running

1. Open `http://localhost:3000` in your browser
2. You should see the login page
3. The dashboard should connect to your backend API

---

## 🔄 Development Workflow

### Running Both Backend and Frontend

For full-stack development, you'll need to run both servers simultaneously:

**Terminal 1 - Backend:**
```powershell
cd Inform-AI-Backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 5001
```

**Terminal 2 - Frontend:**
```powershell
cd NiCE_AI_Dashboar_Demo
npm run dev
```

### Recommended VS Code Extensions

Install these extensions for better development experience:

- **Python** (ms-python.python) - Python language support
- **Pylance** (ms-python.vscode-pylance) - Python IntelliSense
- **ESLint** (dbaeumer.vscode-eslint) - JavaScript/TypeScript linting
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss) - Tailwind autocomplete
- **Prettier** (esbenp.prettier-vscode) - Code formatting
- **Thunder Client** (rangav.vscode-thunder-client) - API testing

### Code Formatting

**Backend (Python):**
```powershell
# Install Black formatter
pip install black

# Format code
black .
```

**Frontend (TypeScript/React):**
```powershell
# Runs automatically if Prettier is configured
# Or run manually:
npm run lint
```

### Git Workflow

Both repositories use a standard Git workflow:

```powershell
# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to GitHub
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

**Commit Message Conventions:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

---

## 📡 API Documentation

### Base URL

- **Development**: `http://localhost:5001`
- **Production**: `https://your-backend.onrender.com`

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Key API Endpoints

#### Authentication

```
POST   /auth/register          # Register new user
POST   /auth/login             # Login and get JWT token
POST   /auth/logout            # Logout user
POST   /auth/change-password   # Change user password
```

#### Calls Management

```
GET    /calls                  # Get all calls
GET    /calls/{call_id}        # Get specific call
POST   /calls                  # Create new call
PUT    /calls/{call_id}        # Update call
DELETE /calls/{call_id}        # Delete call
POST   /upload                 # Upload audio file
```

#### Call Summaries

```
GET    /call_summaries         # Get all call summaries
GET    /call_summaries/{id}    # Get specific summary
POST   /call_summaries         # Create summary
DELETE /call_summaries/{id}    # Delete summary
```

#### Elevate AI Integration

```
POST   /elevate/upload         # Upload to Elevate AI
GET    /elevate/interactions   # Get Elevate interactions
GET    /elevate/transcript/{id} # Get transcript
GET    /elevate/summary/{id}   # Get AI summary
```

#### Protocols & Questions

```
GET    /protocols              # Get all protocols
POST   /protocols              # Create protocol
PUT    /protocols/{id}         # Update protocol
DELETE /protocols/{id}         # Delete protocol

GET    /questions              # Get all questions
POST   /questions              # Create question
PUT    /questions/{id}         # Update question
DELETE /questions/{id}         # Delete question
```

#### Coaching

```
GET    /coaching/tasks         # Get coaching tasks
POST   /coaching/tasks         # Create coaching task
PUT    /coaching/tasks/{id}    # Update task
DELETE /coaching/tasks/{id}    # Delete task
```

#### Users

```
GET    /users                  # Get all users
GET    /users/{id}             # Get specific user
POST   /users                  # Create user
PUT    /users/{id}             # Update user
DELETE /users/{id}             # Delete user
```

### Interactive API Documentation

When the backend is running, access interactive documentation at:
- **Swagger UI**: `http://localhost:5001/docs`
- **ReDoc**: `http://localhost:5001/redoc`

---

## 🗄️ Database Schema

### Collections Overview

The MongoDB database contains the following main collections:

#### 1. `users`
User accounts and authentication information.

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  first_name: String,
  last_name: String,
  team_number: Number,
  role: String,
  permissions: [String],
  layout_coords: Object,
  theme: String,
  created_at: DateTime
}
```

#### 2. `calls`
Individual call records with metadata.

```javascript
{
  _id: ObjectId,
  dispatcher_id: ObjectId,
  start_time: DateTime,
  stop_time: DateTime,
  duration_seconds: Number,
  call_id: String,
  interaction_type: String,
  direction: String,
  phone_number: String,
  agent_name: String,
  agent_id_text: String,
  status: String,
  evaluated: Boolean,
  created_at: DateTime,
  // ... additional metadata fields
}
```

#### 3. `call_summaries`
AI-generated summaries and analysis of calls.

```javascript
{
  _id: ObjectId,
  dispatcher_id: String,
  call_id: String,
  interaction_id: String,
  duration_seconds: Number,
  score: Number,
  sentiment: String,
  sentimentScore: Number,
  transcript: String,
  summary: String,
  qa_analysis: {
    questionId: {
      Answer: String,
      Proof: String
    }
  },
  created_at: DateTime,
  stored_audio: String
}
```

#### 4. `transcripts`
Detailed transcription data.

```javascript
{
  _id: ObjectId,
  call_id: ObjectId,
  text: String,
  word_count: Number,
  ai_summary: String
}
```

#### 5. `evaluations`
Quality assurance evaluations.

```javascript
{
  _id: ObjectId,
  call_id: ObjectId,
  ai_score: Number,
  strengths: String,
  improvements: String,
  reviewed_by_supervisor: Boolean
}
```

#### 6. `questionsets`
Evaluation question templates.

```javascript
{
  _id: ObjectId,
  question: String,
  score: Number
}
```

#### 7. `coaching_tasks`
Agent coaching and improvement tasks.

```javascript
{
  _id: ObjectId,
  callId: String,
  callTakerId: String,
  callTakerName: String,
  focusArea: String,
  issueDescription: String,
  coachingSuggestions: [String],
  actionItems: [{
    text: String,
    completed: Boolean
  }],
  priority: String,
  status: String,
  dueDate: DateTime,
  completionNotes: String,
  completedDate: DateTime
}
```

#### 8. `dispatchers`
Dispatcher/agent information.

```javascript
{
  _id: ObjectId,
  name: String
}
```

### Database Indexes

Recommended indexes for performance:

```javascript
// users collection
db.users.createIndex({ email: 1 }, { unique: true })

// calls collection
db.calls.createIndex({ call_id: 1 })
db.calls.createIndex({ dispatcher_id: 1 })
db.calls.createIndex({ created_at: -1 })

// call_summaries collection
db.call_summaries.createIndex({ call_id: 1 })
db.call_summaries.createIndex({ interaction_id: 1 })
db.call_summaries.createIndex({ created_at: -1 })
```

---

## 🚀 Deployment

### Backend Deployment (Render)

The backend is deployed on [Render](https://render.com).

#### Prerequisites
- Render account
- GitHub repository for backend

#### Deployment Steps

1. **Connect Repository**
   - Log into Render
   - Click "New +" → "Web Service"
   - Connect your `Inform-AI-Backend` repository

2. **Configure Service**
   - **Name**: `inform-ai-backend` (or your preferred name)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 8001`
   - **Instance Type**: Choose based on your needs (Free tier available)

3. **Environment Variables**
   Add all environment variables from your `.env` file:
   - `ELEVATEAI_API_TOKEN`
   - `ELEVATEAI_BASE_URL`
   - `HUGGINGFACE_T`
   - `MONGODB_URI`
   - `ORIGINS` (include your Vercel frontend URL)
   - `PORT=8001`

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy when you push to the main branch

5. **Update Frontend**
   Update your frontend `.env.local` with the Render URL:
   ```env
   NEXT_PUBLIC_API_BASE=https://your-app.onrender.com
   ```

#### Auto-Deploy
Render automatically deploys when you push to the `main` branch on GitHub.

### Frontend Deployment (Vercel)

The frontend is deployed on [Vercel](https://vercel.com).

#### Prerequisites
- Vercel account
- GitHub repository for frontend

#### Deployment Steps

1. **Import Project**
   - Log into Vercel
   - Click "Add New..." → "Project"
   - Import your `NiCE_AI_Dashboar_Demo` repository

2. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm ci`

3. **Environment Variables**
   Add environment variables:
   - `NEXT_PUBLIC_API_BASE`: Your Render backend URL
   - `NEXT_PUBLIC_USE_PROXY`: `false` (or `true` if using proxy)

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

5. **Update Backend CORS**
   Add your Vercel domain to the backend `ORIGINS` environment variable:
   ```env
   ORIGINS=https://your-app.vercel.app,http://localhost:3000
   ```

#### Auto-Deploy
- **Production**: Pushes to `main` branch deploy to production
- **Preview**: Pull requests create preview deployments

#### Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed by Vercel

---

## 🐛 Troubleshooting

### Backend Issues

#### Port Already in Use
```powershell
# Find process using port 5001
netstat -ano | findstr :5001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### MongoDB Connection Error
- Verify `MONGODB_URI` is correct in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity
- Verify database user credentials

#### CORS Errors
- Add frontend URL to `ORIGINS` in backend `.env`
- Restart backend server after changing CORS settings
- Check browser console for specific CORS error messages

#### Elevate AI API Errors
- Verify `ELEVATEAI_API_TOKEN` is valid
- Check API rate limits
- Ensure `ELEVATEAI_BASE_URL` is correct
- Check Elevate AI service status

### Frontend Issues

#### Module Not Found Errors
```powershell
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

#### API Connection Issues
- Verify `NEXT_PUBLIC_API_BASE` points to correct backend URL
- Check if backend is running
- Verify CORS configuration on backend
- Check browser network tab for failed requests

#### Build Errors
```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next
npm run build
```

#### TypeScript Errors
```powershell
# Regenerate types
npm run build
# Check tsconfig.json for errors
```

### Common Development Issues

#### Authentication Token Expired
- Log out and log in again
- Clear browser localStorage
- Check JWT expiration settings in backend

#### Audio Player Not Working
- Ensure audio file exists in `public/` directory
- Check browser console for audio loading errors
- Verify audio file format (MP3 recommended)
- Check CORS headers for audio files

#### Database Connection Slow
- Check MongoDB Atlas cluster region
- Verify network latency
- Consider upgrading MongoDB cluster tier
- Review database indexes

---

## 📚 Contributing Guidelines

### Code Style

#### Python (Backend)
- Follow [PEP 8](https://pep8.org/) style guide
- Use type hints where possible
- Maximum line length: 100 characters
- Use Black formatter for consistency

```python
# Good
def process_call(call_id: str, user_id: str) -> Dict[str, Any]:
    """Process a call and return summary."""
    pass

# Avoid
def processCall(callId,userId):
    pass
```

#### TypeScript (Frontend)
- Use TypeScript strict mode
- Prefer functional components with hooks
- Use descriptive variable names
- Follow React best practices

```typescript
// Good
interface CallSummary {
  id: string;
  duration: number;
  sentiment: string;
}

const CallSummaryCard: React.FC<{ summary: CallSummary }> = ({ summary }) => {
  return <div>{summary.sentiment}</div>;
};

// Avoid
const Card = (props: any) => <div>{props.data}</div>;
```

### Testing

#### Backend Testing
```powershell
# Install pytest
pip install pytest pytest-cov

# Run tests
pytest

# Run with coverage
pytest --cov=.
```

#### Frontend Testing
```powershell
# Install testing libraries
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

### Pull Request Process

1. **Create a feature branch** from `main`
   ```powershell
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following code style guidelines

3. **Test thoroughly** on your local environment

4. **Commit with descriptive messages**
   ```powershell
   git commit -m "feat: add sentiment analysis to call summaries"
   ```

5. **Push to your fork**
   ```powershell
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request** on GitHub
   - Provide clear description of changes
   - Link related issues
   - Add screenshots for UI changes
   - Request review from team members

7. **Address review feedback** and update PR as needed

8. **Merge** after approval (squash commits if needed)

### Documentation

- Update README.md for significant changes
- Document new API endpoints in code comments
- Update this developer guide for architectural changes
- Add JSDoc/docstrings for new functions

---

## 📞 Support and Resources

### Documentation Links

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Docs](https://www.radix-ui.com/primitives/docs/overview/introduction)

### External Services

- [Elevate AI Documentation](https://docs.elevateai.com/) (contact support for access)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)

### Project Structure Quick Reference

```
NiCE AI Platform
├── Backend (Inform-AI-Backend)
│   ├── FastAPI Server on Render
│   ├── Python 3.13
│   └── Port 5001 (dev) / 8001 (prod)
└── Frontend (NiCE_AI_Dashboar_Demo)
    ├── Next.js on Vercel
    ├── TypeScript + React
    └── Port 3000
```

---

## 🔐 Security Best Practices

1. **Never commit sensitive data**
   - API keys, tokens, passwords go in `.env` files
   - Keep `.env` in `.gitignore`
   - Use environment variables for all secrets

2. **Use HTTPS in production**
   - Both Render and Vercel provide HTTPS by default
   - Never send credentials over HTTP

3. **Validate user input**
   - Use Pydantic models for validation (backend)
   - Use Zod for form validation (frontend)
   - Sanitize all user inputs

4. **Keep dependencies updated**
   ```powershell
   # Backend
   pip list --outdated
   pip install --upgrade package-name
   
   # Frontend
   npm outdated
   npm update
   ```

5. **Implement rate limiting** (production)
   - Protect API endpoints from abuse
   - Use middleware for rate limiting

---

## 📝 License

This project is proprietary software developed for NICE Ltd. All rights reserved.

---

## 🎯 Next Steps

After completing setup:

1. ✅ Verify both backend and frontend are running
2. ✅ Create a test user account
3. ✅ Upload a sample audio file
4. ✅ Explore the dashboard features
5. ✅ Review the codebase structure
6. ✅ Join the development team communication channels
7. ✅ Set up your development environment preferences

**Happy coding! 🚀**

---

*Last Updated: November 30, 2025*  
*Version: 1.0.0*
