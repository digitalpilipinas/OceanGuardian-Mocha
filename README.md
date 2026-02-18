# 🌊 OceanGuardian - Marine Conservation Platform

<div align="center">

![Ocean Conservation Platform](https://img.shields.io/badge/Status-Active-success)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-19.0-61dafb)
![Cloudflare Workers](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-orange)
![License](https://img.shields.io/badge/License-MIT-green)

**A gamified citizen science platform empowering communities to protect marine ecosystems**

**☁️ Built for Cloudflare Workers Edge Platform**

[📖 Full Documentation](./OceanGuardian/README.md) • [🚀 Quick Start](#quick-start) • [☁️ Deploy](#deployment) • [👨‍💻 Developer](#developer)

</div>

---

## 👋 Welcome

Welcome to **OceanGuardian** - a comprehensive full-stack web application that combines citizen science, AI-powered analysis, and gamification to create a sustainable ocean monitoring network. Built specifically for **Cloudflare Workers** edge platform, this application delivers global performance with sub-50ms latency.

This platform enables users to report marine wildlife sightings, track pollution, analyze coral reef health, and participate in community conservation missions — all powered by serverless edge computing.

### ✨ Key Features

- 🗺️ **Interactive Map**: Real-time geospatial visualization of marine sightings and events
- 🐟 **Sighting Reports**: GPS-enabled reporting for marine life, pollution, and coral health
- 🎮 **Gamification**: XP system, badges, leaderboards, and achievement tracking
- 🎯 **Mission System**: Community-organized beach cleanups and conservation activities
- 🪨 **Coral Scan**: AI-powered coral bleaching detection (v2)
- 📈 **Analytics**: Role-based dashboards for citizens, ambassadors, scientists, and admins
- 📚 **Education**: Learning hub with ocean conservation content and quizzes
- ☁️ **Edge Performance**: Global CDN with Cloudflare Workers

---

## 📁 Repository Structure

```
OceanGuardian-Mocha/
└── OceanGuardian/          # Main application directory
    ├── src/
    │   ├── react-app/      # Frontend React application
    │   ├── worker/         # Backend Cloudflare Worker API
    │   └── shared/         # Shared types and schemas
    ├── public/             # Static assets
    ├── migrations/         # Database migrations
    ├── docs/               # Documentation
    ├── wrangler.json       # Cloudflare Workers config
    ├── package.json        # Dependencies
    └── README.md           # 📖 FULL DOCUMENTATION HERE
```

➡️ **For complete documentation, installation guide, and architecture details, see:**  
**[📖 OceanGuardian/README.md](./OceanGuardian/README.md)**

---

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/digitalpilipinas/OceanGuardian-Mocha.git
cd OceanGuardian-Mocha/OceanGuardian

# Install dependencies
npm install

# Set up environment variables
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your Turso credentials

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

**For detailed setup instructions, see the [full documentation](./OceanGuardian/README.md#getting-started).**

---

## ☁️ Deployment

### Deploy to Cloudflare Workers (Recommended)

This application is **built specifically for Cloudflare Workers**. Deploy in minutes:

```bash
# 1. Install Wrangler CLI
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Install app dependencies
npm --prefix OceanGuardian ci

# 4. Build the application
npm --prefix OceanGuardian run build

# 5. Deploy to Cloudflare Workers (uses root wrangler.json)
wrangler deploy
```

🎉 **Your app is now live!** Visit `https://[your-worker-name].workers.dev`

**Why Cloudflare Workers?**
- ✅ **Free Tier**: 100,000 requests/day
- ✅ **Global Edge**: Sub-50ms latency worldwide
- ✅ **Auto-scaling**: Handle traffic spikes automatically
- ✅ **Zero Config**: App is pre-configured for Cloudflare
- ✅ **SSL Included**: Free HTTPS certificates

**[Full deployment guide](./OceanGuardian/README.md#deployment)**

---

## 💻 Tech Stack

**Frontend**: React 19 • TypeScript 5.8 • Vite 7.1 • TailwindCSS • Leaflet  
**Backend**: Hono • **Cloudflare Workers** • Turso (SQLite)  
**Deployment**: **Cloudflare Workers + Pages**  
**Tools**: Zod • Wrangler • ESLint • Framer Motion

---

## 📦 Project Versions

This project has been developed using two different approaches:

### Version 1: Mocha + Google Antigravity IDE (This Repository)
- ✅ Complete core platform, gamification, missions, and map visualization
- ✅ Role-based dashboards and authentication
- ✅ **Cloudflare Workers deployment**
- ⚠️ Missing: AI-powered coral analysis (UI implemented, LLM integration pending)
- **Database**: Turso (external)
- **Deployment**: Cloudflare Workers
- **Development**: Started on Mocha (80/500 credits), continued in Google Antigravity IDE

### Version 2: Creao.ai
- ✅ All Version 1 features + functional AI coral analysis
- ✅ Built-in database and streamlined deployment
- **Platform**: Fully created with Creao.ai

**[See detailed comparison](./OceanGuardian/README.md#project-versions)**

---

## 👨‍💻 Developer

**Rogemar Bravo**  
Full-Stack Developer | Ocean Conservation Advocate | AI Enthusiast

- **Discord**: `@emptybutfull`
- **X/Twitter**: [@rogemar_dev](https://twitter.com/rogemar_dev)
- **GitHub**: [@digitalpilipinas](https://github.com/digitalpilipinas)

---

## 🤝 Contributing

We welcome contributions! Check out our [contributing guidelines](./OceanGuardian/README.md#contributing) for:
- 🧠 Completing AI coral analysis integration
- 📱 Building React Native mobile apps
- 🌐 Adding internationalization support
- 🔬 Implementing predictive analytics
- ♿ Improving accessibility

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🔗 Links

- 📖 **[Full Documentation](./OceanGuardian/README.md)** - Complete technical docs
- ☁️ **[Cloudflare Dashboard](https://dash.cloudflare.com/workers)** - Manage deployments
- 📝 **[Project Roadmap](./OceanGuardian/docs/todo.md)** - Development plan
- 🐛 **[Issue Tracker](https://github.com/digitalpilipinas/OceanGuardian-Mocha/issues)** - Report bugs
- 💬 **[Mocha Community](https://discord.gg/shDEGBSe2d)** - Join the discussion

---

<div align="center">

**🌊 Together, we can protect our oceans, one sighting at a time 🌊**

*Built with 💙 for marine conservation*

*Powered by ☁️ Cloudflare Workers*

**⭐ Star this repo if you support ocean conservation! ⭐**

</div>
