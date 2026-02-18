# 🌊 OceanGuardian

<div align="center">

![Ocean Conservation Platform](https://img.shields.io/badge/Status-Active-success)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-19.0-61dafb)
![Cloudflare Workers](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-orange)
![License](https://img.shields.io/badge/License-MIT-green)

**A gamified citizen science platform for ocean conservation and marine biodiversity monitoring**

[Features](#features) • [Architecture](#architecture) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Deployment](#deployment)

</div>

---

## 📋 Executive Summary

**OceanGuardian** is a comprehensive full-stack web application designed to empower citizens, scientists, and conservation organizations in protecting marine ecosystems. Built on **Cloudflare Workers** edge platform, the application combines real-time data collection, AI-powered analysis, gamification mechanics, and community engagement to create a sustainable ocean monitoring network.

### Key Objectives
- **Citizen Science:** Enable users to report marine wildlife sightings, pollution incidents, and coral reef health
- **Data Collection:** Build a crowdsourced database of marine biodiversity and environmental conditions
- **Community Engagement:** Gamify conservation actions through XP systems, badges, leaderboards, and missions
- **Scientific Value:** Provide researchers and NGOs with validated, geotagged environmental data
- **Education:** Deliver bite-sized ocean conservation content and daily environmental quizzes

### Impact Metrics
- Real-time geospatial visualization of ocean health indicators
- Role-based access for Citizens, Ambassadors, Scientists, and Administrators
- Mission-based community cleanups and conservation activities
- Coral bleaching detection through AI-powered image analysis (planned for v2)

---

## ✨ Features

### 🗺️ Core Functionality
- **Interactive Map Dashboard**: Leaflet-based geospatial visualization of marine sightings
- **Sighting Reports**: GPS-enabled reporting system for marine life, pollution, and coral health
- **Mission System**: Community-organized beach cleanups, reef surveys, and conservation events
- **Coral Scan**: Photo submission and AI health assessment (UI implemented, LLM integration in v2)

### 🎮 Gamification Engine
- **XP & Leveling System**: Earn experience points through conservation actions
- **Badge Collection**: 30+ achievements for milestones (first sighting, mission participation, streaks)
- **Global Leaderboard**: Regional and worldwide rankings with filtering
- **Daily Check-ins**: Plastic-free lifestyle streak tracking
- **Impact Stats**: Personal dashboard showing environmental contribution metrics

### 👥 Role-Based Dashboards
- **Citizen**: Personal profile, sightings history, missions, learning hub
- **Ambassador**: Regional data analytics, mission creation, content moderation
- **Scientist**: Advanced filters, data export (CSV/GeoJSON), validation interface
- **Administrator**: User management, content moderation, system analytics

### 📚 Education & Community
- **Learning Hub**: Curated ocean conservation content and interactive lessons
- **Daily Quizzes**: Environmental knowledge challenges with rewards
- **Social Features**: Comments, upvotes, and user following system (planned)
- **Notifications**: Real-time updates for mission RSVPs and community interactions

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  React 19   │  │  TypeScript  │  │  Vite Build  │       │
│  │  + Router   │  │  + Zod       │  │  + PWA       │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Hono Framework (Cloudflare Workers)               │     │
│  │  • Authentication Middleware                       │     │
│  │  • Route Handlers: /api/sightings, /api/missions  │     │
│  │  • Email Service Integration                       │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ↓ libSQL Protocol
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Turso (Distributed SQLite)                        │     │
│  │  • Users, Sightings, Missions, Badges             │     │
│  │  • Activity Logs, Notifications                    │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow
1. **User Interaction**: React components trigger actions (report sighting, RSVP mission)
2. **API Request**: Frontend calls Hono API endpoints with validated payloads (Zod schemas)
3. **Authentication**: Middleware verifies session tokens and user permissions
4. **Business Logic**: Route handlers process requests, calculate XP, check badge unlocks
5. **Database Operations**: Turso client executes SQL queries with edge-optimized latency
6. **Response**: JSON data returned to frontend, React state updated, UI refreshes

### File Structure
```
OceanGuardian/
├── src/
│   ├── react-app/           # Frontend React application
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level page components
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utility functions
│   ├── worker/              # Backend Cloudflare Worker
│   │   ├── routes/          # API endpoint handlers
│   │   ├── db.ts            # Database client & queries
│   │   ├── email.ts         # Email service integration
│   │   └── hash.ts          # Password hashing utilities
│   └── shared/
│       └── types.ts         # Shared TypeScript types & Zod schemas
├── migrations/              # Database migration scripts
├── public/                  # Static assets (icons, images)
├── docs/                    # Project documentation
│   └── todo.md              # Development roadmap
└── package.json             # Dependencies & scripts
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.0 | UI framework with latest concurrent features |
| **TypeScript** | 5.8 | Type-safe development |
| **Vite** | 7.1 | Lightning-fast build tool & dev server |
| **React Router** | 7.5 | Client-side routing & navigation |
| **TailwindCSS** | 3.4 | Utility-first styling |
| **Framer Motion** | 12.34 | Smooth animations & transitions |
| **Leaflet** | 1.9 | Interactive map rendering |
| **React-Leaflet** | 5.0 | React bindings for Leaflet |
| **Lucide React** | 0.510 | Icon library |
| **Radix UI** | Latest | Accessible headless UI components |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Hono** | 4.7 | Lightweight edge-optimized API framework |
| **Cloudflare Workers** | Latest | Serverless edge compute platform |
| **Turso** | Latest | Distributed SQLite database (libSQL) |
| **Zod** | 3.24 | Runtime schema validation |
| **Wrangler** | 4.33 | Cloudflare CLI & deployment tool |

### Developer Tools
- **ESLint** 9.25 - Code linting with React/TypeScript rules
- **Knip** 5.51 - Detect unused files, dependencies, and exports
- **Vite PWA Plugin** 1.2 - Progressive Web App support
- **TypeScript ESLint** 8.31 - Advanced TypeScript linting

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Cloudflare Account** (free tier available)
- **Turso CLI** (for database management)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/digitalpilipinas/OceanGuardian-Mocha.git
   cd OceanGuardian-Mocha/OceanGuardian
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .dev.vars.example .dev.vars
   
   # Edit .dev.vars with your credentials:
   # - TURSO_DATABASE_URL
   # - TURSO_AUTH_TOKEN
   # - RESEND_API_KEY (optional, for email features)
   ```

4. **Run database migrations** (if needed)
   ```bash
   # Install Turso CLI
   curl -sSfL https://get.tur.so/install.sh | bash
   
   # Authenticate
   turso auth login
   
   # Apply schema
   turso db shell your-database-name < migrations/turso-schema.sql
   
   # Optionally seed data
   npm run seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### Available Scripts

```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # Build for production (TypeScript + Vite)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint on codebase
npm run check        # Full validation (TypeScript + Build + Wrangler dry-run)
npm run knip         # Detect unused code and dependencies
npm run seed         # Populate database with sample data
npm run cf-typegen   # Generate TypeScript types from Wrangler config
```

---

## ☁️ Deployment

### Cloudflare Workers (Recommended & Native Platform)

This application is **built specifically for Cloudflare Workers**. Deploy in minutes with zero infrastructure management.

#### Why Cloudflare Workers?

✅ **Zero Configuration** - App is pre-configured for Cloudflare
✅ **Free Tier** - 100,000 requests/day at no cost
✅ **Global Edge Network** - Sub-50ms latency worldwide
✅ **Auto-scaling** - Handles traffic spikes automatically
✅ **SSL Included** - Free HTTPS certificates
✅ **Native Integrations** - Works seamlessly with Turso, R2, D1

#### Step-by-Step Deployment Guide

##### 1. Create Cloudflare Account

- Visit [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
- Sign up with email or GitHub
- Verify your email address

##### 2. Install & Authenticate Wrangler CLI

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login
# Browser opens - click "Allow" to grant access
```

##### 3. Configure Your Worker Name

Edit `wrangler.json` and change the worker name to something unique:

```json
{
  "name": "oceanguardian-yourname",  // Make this unique!
  "main": "./src/worker/index.ts",
  // ... rest of config
}
```

##### 4. Add Secrets (Environment Variables)

```bash
# Add Turso database credentials
wrangler secret put TURSO_DB_URL
# Paste your Turso database URL when prompted

wrangler secret put TURSO_DB_AUTH_TOKEN
# Paste your Turso auth token when prompted

# (Optional) Add email service key
wrangler secret put RESEND_API_KEY
```

##### 5. Build & Deploy

```bash
# Build the application
npm run build

# Deploy to Cloudflare Workers
wrangler deploy
```

**Expected Output:**
```
⛅️ wrangler 3.x.x
------------------
Total Upload: 1.23 MB / gzip: 456 KB
Uploaded oceanguardian-yourname (1.5 sec)
Published oceanguardian-yourname (2.3 sec)
  https://oceanguardian-yourname.workers.dev
Current Deployment ID: abc123
```

🎉 **Your app is now live!** Visit `https://[your-worker-name].workers.dev`

#### 6. Add Custom Domain (Optional)

1. In Cloudflare Dashboard, go to **Workers & Pages**
2. Click your worker name
3. Navigate to **Custom Domains** tab
4. Click **Add Custom Domain**
5. Enter your domain (e.g., `oceanguardian.yourdomain.com`)
6. Follow DNS configuration instructions

#### Updating Your Deployment

Every time you make changes:

```bash
npm run build
wrangler deploy
```

Changes go live in ~10 seconds!

#### Monitoring & Logs

```bash
# View real-time logs
wrangler tail

# List deployments
wrangler deployments list

# Check worker status
wrangler status
```

#### Troubleshooting

**Issue: "Worker name already exists"**
- Solution: Change `name` in `wrangler.json` to something unique

**Issue: "Database connection error"**
- Solution: Verify secrets are set with `wrangler secret list`
- Re-add if missing: `wrangler secret put TURSO_DB_URL`

**Issue: "Build failed"**
- Solution: Clear and reinstall dependencies
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  npm run build
  ```

**Issue: "404 Not Found after deployment"**
- Solution: Verify `wrangler.json` has `"assets": {"directory": "./dist", "not_found_handling": "single-page-application"}`

### Cloudflare Free Tier Limits

| Resource | Free Tier | Paid Tier |
|----------|-----------|----------|
| Requests | 100,000/day | 10M for $5/mo |
| CPU Time | 10ms/request | 50ms/request |
| Bandwidth | Unlimited | Unlimited |
| Storage | D1: 5GB | D1: 50GB |
| Domains | Unlimited | Unlimited |

**Your app will stay free** unless you exceed 100k requests/day!

---

## 📦 Project Versions

> **Note on Development Approaches**: OceanGuardian has been developed using two different AI-assisted platforms to explore optimal workflows and feature sets.

### Version 1: Mocha + Google Antigravity IDE (This Repository)
**Platform**: Initially created with [Mocha](https://getmocha.com), continued in Google Antigravity IDE  
**Deployment**: Cloudflare Workers  
**Status**: ⚠️ Missing LLM integration for coral analysis  
**Database**: Turso (external third-party service)  
**Development Journey**:
- Started prototyping on Mocha platform
- Utilized 80 out of 500 sponsored credits
- Hit project space limitations on Mocha's free tier
- Downloaded codebase and continued development in Google Antigravity IDE
- Integrated Turso database manually
- Configured for Cloudflare Workers deployment
- UI for coral scanning implemented, but AI model integration pending

**Key Features**:
- ✅ Complete map-based sighting system
- ✅ Gamification engine (XP, badges, leaderboards)
- ✅ Mission creation and RSVP functionality
- ✅ Role-based dashboards (Citizen, Ambassador, Scientist, Admin)
- ✅ Learning hub with educational content
- ✅ Authentication and user management
- ✅ Cloudflare Workers edge deployment
- ❌ AI-powered coral bleaching detection (UI only, no LLM backend)

**Strengths**:
- Full control over infrastructure choices
- Cloudflare Workers edge performance
- Flexible database configuration (Turso)
- Custom API implementation with Hono framework
- Detailed codebase for learning and customization

**Limitations**:
- Coral analysis feature incomplete
- Requires manual LLM integration work
- More setup complexity for new developers

---

### Version 2: Creao.ai (Complete Stack)
**Platform**: Fully created with [Creao.ai](https://creao.ai)  
**Deployment**: Creao.ai platform  
**Status**: ✅ Full-featured including AI coral analysis  
**Database**: Creao.ai built-in database  
**Development Journey**:
- Built from scratch on Creao.ai platform
- Integrated database automatically provisioned
- AI coral bleaching detection fully operational
- Complete end-to-end implementation

**Key Features**:
- ✅ All Version 1 features
- ✅ **AI-powered coral health analysis** (functional LLM integration)
- ✅ Automated database management
- ✅ Simplified deployment pipeline

**Strengths**:
- Complete feature parity including coral AI
- Faster time-to-market with managed infrastructure
- Built-in LLM integration for image analysis
- Streamlined developer experience

**Trade-offs**:
- Platform-specific architecture
- Less infrastructure flexibility
- Potential vendor lock-in considerations

---

### Version Comparison

| Feature | Version 1 (Mocha → Antigravity) | Version 2 (Creao.ai) |
|---------|--------------------------------|---------------------|
| **Core Platform** | ✅ Complete | ✅ Complete |
| **Gamification** | ✅ Complete | ✅ Complete |
| **Mission System** | ✅ Complete | ✅ Complete |
| **Map Visualization** | ✅ Complete | ✅ Complete |
| **Coral UI** | ✅ Complete | ✅ Complete |
| **Coral AI Analysis** | ❌ Missing | ✅ Functional |
| **Database** | Turso (External) | Creao.ai (Managed) |
| **Deployment** | Cloudflare Workers | Platform-Integrated |
| **Infrastructure Control** | High | Medium |
| **Setup Complexity** | Medium | Lower |
| **Edge Performance** | ✅ Global CDN | Platform-Dependent |

---

## 👨‍💻 Developer

**Rogemar Bravo**  
Full-Stack Developer | Ocean Conservation Advocate | AI Enthusiast

- **Discord**: `@emptybutfull`
- **X/Twitter**: [@rogemar_dev](https://twitter.com/rogemar_dev)
- **GitHub**: [@digitalpilipinas](https://github.com/digitalpilipinas)

### About the Creator
Rogemar is a developer passionate about leveraging technology for environmental impact. With expertise in modern web technologies, AI integration, and citizen science platforms, he created OceanGuardian to bridge the gap between ocean conservation efforts and everyday citizens. The dual-version approach (Mocha vs Creao.ai) reflects his commitment to exploring optimal development workflows and comparing AI-assisted coding platforms.

---

## 🤝 Contributing

We welcome contributions from developers, designers, marine scientists, and conservation enthusiasts!

### How to Contribute
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `npm run lint && npm run check`
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Priority Areas
- 🧠 **AI Integration**: Complete coral bleaching LLM analysis for Version 1
- 📱 **Mobile App**: React Native/Expo implementation
- 🌐 **Internationalization**: Multi-language support
- 🔬 **Data Science**: Advanced predictive analytics for ocean health trends
- ♿ **Accessibility**: WCAG 2.1 AA compliance improvements

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Mocha Platform** - Initial rapid prototyping environment
- **Creao.ai** - Complete AI-assisted development platform for Version 2
- **Cloudflare** - Edge computing infrastructure and Workers platform
- **Turso** - Distributed SQLite database
- **OpenStreetMap** - Map data for Leaflet visualization
- **Marine Conservation Community** - Inspiration and domain expertise

---

## 🌟 Support the Project

If OceanGuardian helps your conservation efforts or research, consider:
- ⭐ **Star this repository** to show support
- 🐛 **Report bugs** and suggest features via Issues
- 📢 **Share** with environmental NGOs, universities, and dive communities
- 💙 **Contribute** code, documentation, or educational content

---

<div align="center">

**🌊 Together, we can protect our oceans, one sighting at a time. 🌊**

Built with 💙 for marine conservation

Deployed on ☁️ **Cloudflare Workers**

</div>
