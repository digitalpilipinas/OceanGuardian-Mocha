# OceanGuardian Master Blueprint

**The Pokémon GO of Ocean Conservation**
**Version:** 2.0 Master Edition
**Date:** February 8, 2026
**Purpose:** Non-Profit Marine Conservation Platform
**Owner:** Marine Conservation Team

***

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [About the Application](#2-about-the-application)
3. [Vision \& Mission](#3-vision--mission)
4. [User Personas](#4-user-personas)
5. [RBAC - Role-Based Access Control](#5-rbac---role-based-access-control)
6. [ABAC - Attribute-Based Access Control](#6-abac---attribute-based-access-control)
7. [Complete Feature Matrix](#7-complete-feature-matrix)
8. [Core Features \& Requirements](#8-core-features--requirements)
9. [Gamification System](#9-gamification-system)
10. [UI/UX Specifications](#10-uiux-specifications)
11. [User Journeys](#11-user-journeys)
12. [Technical Architecture](#12-technical-architecture)
13. [Data Models](#13-data-models)
14. [Security \& Privacy](#14-security--privacy)
15. [Analytics \& Monitoring](#15-analytics--monitoring)
16. [Non-Profit Considerations](#16-non-profit-considerations)
17. [Implementation Roadmap](#17-implementation-roadmap)
18. [Risk Assessment](#18-risk-assessment)
19. [Success Metrics](#19-success-metrics)
20. [Future Enhancements](#20-future-enhancements)

***

## 1. Executive Summary

OceanGuardian transforms ocean conservation into an engaging, gamified experience that empowers citizens to become marine protectors. Like Pokémon GO for the ocean, users embark on cleanup missions, log debris and coral bleaching, earn badges, level up, and contribute to real scientific research—all while staying within zero-cost infrastructure for maximum non-profit impact.

**Key Differentiators:**

- Gamified cleanup missions with XP, levels, and rare badges
- AI-powered coral health monitoring for citizen scientists
- Real-time collaborative cleanup events
- Free-tier architecture for sustainable non-profit operation
- Cross-platform compatibility via Vibe coding

***

## 2. About the Application

### What is OceanGuardian?

OceanGuardian is a progressive web application that combines:

- **Citizen Science**: Crowd-sourced data collection on marine debris, wildlife, and coral health
- **Gamification**: XP systems, achievement badges, leaderboards, and timed missions
- **AI Analysis**: Automated coral bleaching detection from user-submitted photos
- **Community Action**: Organized cleanup missions with live chat and collaboration
- **Education**: Daily ocean quizzes, learning nuggets, and conservation tips


### Core Value Proposition

**For Users:** Transform beach walks and dives into heroic conservation quests with instant feedback, social recognition, and measurable ocean impact.

**For NGOs:** Access real-time, GPS-tagged marine data; mobilize volunteers; track cleanup impact; generate grant-ready reports.

**For Scientists:** Obtain large-scale coral bleaching and debris distribution data at zero cost; validate AI models with citizen observations.

***

## 3. Vision \& Mission

### Vision

Create the world's largest crowd-sourced ocean health database while building a global community of passionate marine protectors.

### Mission

Democratize ocean conservation by making data collection fun, accessible, and impactful through gamification and AI, enabling every coastal citizen to become a marine guardian.

### Core Values

- **Accessibility**: Free, mobile-first, multilingual
- **Transparency**: Open data for research and policy
- **Community**: Collaborative missions and peer recognition
- **Impact**: Every action tracked and celebrated
- **Sustainability**: Zero-cost infrastructure for long-term viability

***

## 4. User Personas

### Primary Personas

#### 1. Casual Coastal Explorer (40%)

- **Demographics**: Ages 18-35, urban coastal residents
- **Behavior**: Weekend beach visits, smartphone-native, social media active
- **Motivation**: Wants to "do good" but needs simple, rewarding actions
- **Pain Points**: Doesn't know how to contribute meaningfully
- **OceanGuardian Use**: Logs debris casually, completes daily quizzes, shares badges


#### 2. Active Diver/Snorkeler (25%)

- **Demographics**: Ages 25-50, certified divers, frequent ocean users
- **Behavior**: Regular dive trips, underwater photography, conservation-minded
- **Motivation**: Witnessing coral decline firsthand, wants to document change
- **Pain Points**: No easy way to report observations to scientists
- **OceanGuardian Use**: Submits coral bleaching reports, joins cleanup missions, levels up fast


#### 3. Eco-Educator/NGO Staff (15%)

- **Demographics**: Teachers, marine biologists, NGO coordinators
- **Behavior**: Organizes group activities, needs engaging educational tools
- **Motivation**: Inspire students/volunteers with hands-on conservation
- **Pain Points**: Limited budgets for tools and fieldwork
- **OceanGuardian Use**: Creates missions, downloads data, moderates local reports


#### 4. Marine Scientist/Researcher (10%)

- **Demographics**: Graduate students, researchers, conservation professionals
- **Behavior**: Data-driven, needs large datasets, publishes research
- **Motivation**: Scale up monitoring without large budgets
- **Pain Points**: Field surveys are expensive and geographically limited
- **OceanGuardian Use**: Exports CSV/GeoJSON, validates AI predictions, analyzes trends


#### 5. Local Ambassador/Community Leader (10%)

- **Demographics**: Ages 30-60, respected local figures, environmental activists
- **Behavior**: Organizes beach cleanups, rallies community support
- **Motivation**: Protect their local coastline and engage neighbors
- **Pain Points**: Hard to coordinate volunteers and measure impact
- **OceanGuardian Use**: Creates and moderates regional missions, manages leaderboards

***

## 5. RBAC - Role-Based Access Control

### Role Hierarchy \& Permissions

| Role | Permissions | Assignment Method |
| :-- | :-- | :-- |
| **Guest** | - View public map \& sightings<br>- Browse missions (read-only)<br>- Take quizzes<br>- View leaderboards<br>- Register account | Default (no authentication) |
| **Player** | All Guest permissions +<br>- Submit debris/wildlife/coral reports<br>- Upload photos<br>- Join missions<br>- Earn XP, badges, levels<br>- Comment on sightings<br>- Participate in chat<br>- Maintain plastic-free streak<br>- Generate impact badges | Google OAuth sign-in |
| **Ambassador** | All Player permissions +<br>- Create cleanup missions<br>- Moderate local sightings (approve/flag)<br>- Manage regional chat<br>- Access regional analytics<br>- Assign mission rewards | Application + admin approval |
| **Scientist** | All Player permissions +<br>- Export all data (CSV/GeoJSON)<br>- Access AI coral analysis tools<br>- View raw submitted images<br>- Validate/train AI models<br>- Generate research reports | Verified credentials + admin approval |
| **Admin** | All permissions +<br>- Manage all users \& roles<br>- Global content moderation<br>- Set mission templates<br>- Configure XP/badge rules<br>- Access full analytics dashboard<br>- Manage AI model parameters | Platform owner assignment |

### Role Promotion Paths

```
Guest → Player (instant via Google OAuth)
Player → Ambassador (application + 50 XP minimum + 10 verified reports)
Player → Scientist (verified academic/NGO email + admin approval)
Ambassador/Scientist → Admin (invitation only)
```


***

## 6. ABAC - Attribute-Based Access Control

### Attribute-Based Rules

| Attribute | Values | Conditional Access Control |
| :-- | :-- | :-- |
| **User Level** | 1-50 | - Levels 1-5: Can report debris/wildlife only<br>- Levels 6+: Can report coral bleaching<br>- Levels 10+: Can create private missions<br>- Levels 20+: Unlock AI coral analysis tools |
| **Reputation Score** | 0-1000 | - Score >50: Can approve others' sightings<br>- Score >100: Can moderate comments<br>- Score >200: Fast-track Ambassador application |
| **Geographic Region** | [Assigned areas] | - Ambassadors moderate only assigned regions<br>- Scientists can export only permitted zones<br>- Mission creators limited to home region (Level <20) |
| **Device Type** | Mobile/Desktop | - Mobile: GPS auto-capture required<br>- Desktop: Manual coordinate entry allowed |
| **Submission Quality** | hasImage, hasGPS | - Coral reports require photo + GPS<br>- Debris reports require GPS (image optional)<br>- No-photo submissions earn 50% XP |
| **Time-Based** | Active hours, season | - Missions can be time-gated (e.g., monsoon season lockouts)<br>- AI analysis queue prioritized during peak hours |
| **Mission Status** | Participant count | - Missions auto-close at 50 participants<br>- Ambassador tools unlock at 5+ completed missions |

### Policy Examples

**Policy 1: Coral Bleaching Report Validation**

```
IF user.level >= 6 
AND submission.hasImage == true 
AND submission.hasGPS == true
THEN allow coral_bleaching_report
ELSE prompt upgrade_requirements
```

**Policy 2: Regional Moderation**

```
IF user.role == "Ambassador"
AND sighting.region IN user.assignedRegions
AND user.reputationScore > 50
THEN allow moderate_sighting
```

**Policy 3: Data Export Restrictions**

```
IF user.role == "Scientist"
AND user.verified == true
AND export.region IN user.permittedZones
THEN allow data_export
ELSE require admin_approval
```


***

## 7. Complete Feature Matrix

| Feature | Guest | Player | Ambassador | Scientist | Admin |
| :-- | :-- | :-- | :-- | :-- | :-- |
| **Core Mapping** |  |  |  |  |  |
| View live sighting map | ✓ | ✓ | ✓ | ✓ | ✓ |
| Filter by type/date/region | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cluster view for dense areas | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Data Submission** |  |  |  |  |  |
| Log garbage/debris |  | ✓ | ✓ | ✓ | ✓ |
| Log floating trash/ghost nets |  | ✓ | ✓ | ✓ | ✓ |
| Log wildlife sightings |  | ✓ | ✓ | ✓ | ✓ |
| Log coral bleaching |  | ✓* | ✓ | ✓ | ✓ |
| Upload photos (<1MB) |  | ✓ | ✓ | ✓ | ✓ |
| Auto-GPS tagging |  | ✓ | ✓ | ✓ | ✓ |
| Manual coordinate entry |  |  | ✓ | ✓ | ✓ |
| **Gamification** |  |  |  |  |  |
| Earn XP \& level up |  | ✓ | ✓ | ✓ | ✓ |
| Unlock achievement badges |  | ✓ | ✓ | ✓ | ✓ |
| View personal profile stats |  | ✓ | ✓ | ✓ | ✓ |
| Access leaderboards (global/local) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Maintain plastic-free streak |  | ✓ | ✓ | ✓ | ✓ |
| Generate shareable badges |  | ✓ | ✓ | ✓ | ✓ |
| **Missions \& Events** |  |  |  |  |  |
| Browse public missions | ✓ | ✓ | ✓ | ✓ | ✓ |
| Join cleanup missions |  | ✓ | ✓ | ✓ | ✓ |
| Mission live chat |  | ✓ | ✓ | ✓ | ✓ |
| Create missions |  |  | ✓ |  | ✓ |
| Moderate mission submissions |  |  | ✓ |  | ✓ |
| Set mission rewards/XP |  |  | ✓ |  | ✓ |
| **Education** |  |  |  |  |  |
| Daily ocean quiz | ✓ | ✓ | ✓ | ✓ | ✓ |
| Browse learning nuggets | ✓ | ✓ | ✓ | ✓ | ✓ |
| Unlock content via milestones |  | ✓ | ✓ | ✓ | ✓ |
| **Community** |  |  |  |  |  |
| Comment on sightings |  | ✓ | ✓ | ✓ | ✓ |
| Upvote/validate reports |  | ✓** | ✓ | ✓ | ✓ |
| Follow other users |  | ✓ | ✓ | ✓ | ✓ |
| Share to social media | ✓ | ✓ | ✓ | ✓ | ✓ |
| **AI \& Analysis** |  |  |  |  |  |
| Submit photo for AI coral analysis |  | ✓* | ✓ | ✓ | ✓ |
| View AI bleaching severity score |  | ✓* | ✓ | ✓ | ✓ |
| Access coral heatmaps |  |  |  | ✓ | ✓ |
| Train/validate AI models |  |  |  | ✓ | ✓ |
| **Data \& Research** |  |  |  |  |  |
| Export data (CSV/GeoJSON) |  |  |  | ✓ | ✓ |
| Generate impact reports |  |  | ✓ | ✓ | ✓ |
| Access raw image database |  |  |  | ✓ | ✓ |
| API access |  |  |  | ✓*** | ✓ |
| **Administration** |  |  |  |  |  |
| User management |  |  |  |  | ✓ |
| Role assignment |  |  |  |  | ✓ |
| Content moderation (global) |  |  |  |  | ✓ |
| Configure XP/badge rules |  |  |  |  | ✓ |
| Access full analytics |  |  |  |  | ✓ |
| System settings |  |  |  |  | ✓ |

**Notes:**

- \* Requires Level 6+
- \*\* Requires Reputation Score >50
- \*\*\* Rate-limited API keys

***

## 8. Core Features \& Requirements

### 8.1 Interactive Sighting Map (P0 - Must Have)

#### Description

Dynamic, real-time map displaying all user-submitted ocean observations with clustering, filtering, and detail views.

#### Data Types

1. **Garbage/Debris** - Plastic bottles, bags, straws, wrappers, cigarette butts
2. **Floating Trash** - Ghost nets, fishing gear, large debris, oil slicks
3. **Wildlife Sightings** - Dolphins, turtles, whales, rare species
4. **Coral Bleaching** - White/pale coral, percentage affected, water temp

#### User Stories

- As a **beach visitor**, I want to pin and describe shoreline garbage so cleanup volunteers can remove it
- As a **boater/diver**, I want to log GPS-tagged photos of floating trash so authorities can plan retrieval
- As a **snorkeler**, I want to record coral bleaching observations so scientists can track reef health
- As a **conservation enthusiast**, I want to filter the map by type to join local action events
- As an **NGO scientist**, I want to download all data in CSV or GeoJSON for analysis


#### Technical Requirements

- Map provider: Auto-detect (OpenStreetMap or Mapbox via Vibe)
- Clustering for dense areas (>20 markers within 1km radius)
- Color-coded pins by category
- Filter panel: type, date range, severity, radius
- Detail popup: photo, description, timestamp, user level, validation status
- Real-time updates via WebSocket or polling (30s interval)


#### Acceptance Criteria

- [ ] Map loads in <3 seconds on mobile
- [ ] Supports 10,000+ markers with clustering
- [ ] Filters update view without full page reload
- [ ] Works offline (cached tiles for last-viewed area)

***

### 8.2 Debris \& Coral Reporting System (P0)

#### Description

Streamlined submission form with photo capture, auto-GPS, category selection, and optional severity ratings.

#### Submission Flow

1. User taps "Report" button (camera icon)
2. Selects category from visual grid
3. Captures/uploads photo (auto-compressed to <1MB)
4. GPS auto-populates (or manual pin drop on map)
5. Adds description (optional) and severity slider
6. Submits → Instant XP reward + badge notification

#### Form Fields

**Required:**

- Category (garbage/floating/wildlife/coral)
- GPS coordinates
- Photo (coral bleaching only)

**Optional:**

- Subcategory (e.g., plastic bottle, ghost net)
- Description (max 500 chars)
- Severity (1-5 emoji slider)
- Water temperature (coral reports)
- Estimated size/quantity


#### Validation Rules

- Photo size ≤1MB (auto-compress on client)
- GPS accuracy ≤100m
- Coral reports require photo + GPS + Level 6+
- Rate limit: 3 submissions per hour per user


#### XP Rewards

- Basic report: 10 XP
- With photo: +5 XP
- First report in new area: +10 XP
- Validated by community: +5 XP
- Featured by admin: +20 XP

***

### 8.3 Cleanup Mission System (P0)

#### Description

Organized, time-bound events where users collaborate to clean specific locations and earn bonus rewards.

#### Mission Types

1. **Public Missions** - Open to all players, region-specific
2. **Private Missions** - Invite-only for schools/NGOs
3. **Timed Challenges** - 24-hour blitzes with multiplier XP
4. **Recurring Events** - Weekly beach cleanups at fixed locations

#### Mission Lifecycle

1. **Creation** (Ambassador/Admin)
    - Set location, date/time, duration
    - Define goals (e.g., "Collect 50 items" or "Cover 2km beach")
    - Set rewards (XP multiplier, exclusive badge)
    - Add live chat/instructions
2. **Discovery** (All Users)
    - Browse mission feed (sorted by proximity)
    - Filter by date, type, difficulty
    - RSVP to reserve spot
3. **Execution** (Participants)
    - Check-in via GPS when arriving
    - Submit reports during mission window
    - Live chat for coordination
    - Progress bar shows team goal completion
4. **Completion** (Automatic)
    - Mission auto-closes at end time
    - XP bonus applied to all participants
    - Badges distributed
    - Impact report generated

#### Mission Dashboard

- Map view with mission pins
- List view with countdown timers
- "Near Me" smart filter
- Past missions (read-only, view impact)


#### Technical Requirements

- Real-time participant count
- WebSocket chat (or Firebase Realtime DB)
- Push notifications 1 hour before start
- CSV export of mission data for organizers

***

### 8.4 Plastic-Free Streak Challenge (P0)

#### Description

Daily check-in system to track consecutive plastic-free days, with milestone badges and recovery mechanics.

#### Mechanics

- Daily check-in prompt (notification or banner)
- Streak counter increments on check-in
- Visual streak calendar (last 30 days)
- Miss a day → streak resets (but offers "Streak Freeze" power-up)


#### Milestones \& Rewards

| Streak Days | Badge | XP Bonus | Unlock |
| :-- | :-- | :-- | :-- |
| 7 | Plastic Warrior | 50 XP | Daily quiz level 2 |
| 30 | Eco Champion | 200 XP | Custom avatar frame |
| 100 | Ocean Guardian | 500 XP | Exclusive mission creation |
| 365 | Marine Legend | 2000 XP | Lifetime VIP badge |

#### Streak Freeze Power-Up

- Earn 1 freeze per 30-day streak
- Use to protect streak if you miss a day
- Max 3 freezes stored at a time


#### Social Features

- Share streak milestone badges on social media
- Challenge friends to beat your streak
- Community streak leaderboard

***

### 8.5 AI-Powered Coral Health Monitoring (P1)

#### Description

Users submit coral photos; AI analyzes bleaching severity and provides instant feedback.

#### Workflow

1. User captures underwater coral photo
2. Submits via "Scan Coral" feature
3. AI model processes image (3-5 seconds)
4. Returns bleaching severity score (0-100%)
5. Displays color-coded result with recommendation
6. Data saved for scientist review and heatmap generation

#### AI Model Specifications

- **Input**: JPEG/PNG image, max 2MB
- **Output**: Bleaching percentage, confidence score, bounding boxes
- **Model**: Pre-trained on coral dataset (e.g., CoralNet)
- **Processing**: Edge AI (TensorFlow.js) or serverless function
- **Accuracy Target**: 85% agreement with expert labels


#### Bleaching Scale

- **0-10%** Healthy (Green) - "Your reef looks great!"
- **11-30%** Mild (Yellow) - "Some stress detected"
- **31-60%** Moderate (Orange) - "Significant bleaching"
- **61-100%** Severe (Red) - "Critical - alert scientists!"


#### Scientist Tools

- Review queue for AI predictions
- Accept/reject/retrain interface
- Export training dataset
- Heatmap view of bleaching hotspots


#### Technical Stack

- Client-side pre-processing (resize, normalize)
- Serverless function or Edge API for inference
- Firestore collection: `coral_analysis`
- Caching for duplicate images

***

### 8.6 Ocean Learning Nuggets \& Quizzes (P1)

#### Description

Bite-sized educational content delivered through daily quizzes, fact library, and unlockable lessons.

#### Content Types

1. **Daily Quiz** - 5 multiple-choice questions
2. **Fact Library** - Searchable database of ocean facts
3. **Deep Dive Lessons** - Unlocked at milestones (500 words each)
4. **Video Snippets** - Embedded YouTube content (1-3 min)

#### Quiz Mechanics

- One quiz unlocked daily at midnight
- 5 questions, 4 options each
- 30 seconds per question (optional timer)
- Earn 5 XP per correct answer (max 25 XP/day)
- Streak bonus: 7-day quiz streak = +50 XP


#### Topics

- Marine biology (species, ecosystems)
- Pollution impacts (microplastics, runoff)
- Conservation strategies (MPAs, restoration)
- Climate change \& oceans (acidification, warming)
- Sustainable living tips


#### Content Management

- Markdown files stored in `/content/` folder
- JSON metadata (topic, difficulty, unlock_level)
- Admin CMS for adding new content
- Community-suggested questions (moderated)

***

### 8.7 Impact Badge Generator (P2)

#### Description

Auto-generated, shareable graphics celebrating user achievements and conservation impact.

#### Badge Types

1. **Milestone Badges** - Level up, streak milestones, first sighting
2. **Mission Badges** - Completed events, top contributor
3. **Impact Summary** - Total debris logged, XP earned, coral photos submitted

#### Design Templates

- Template 1: Circular badge with user avatar
- Template 2: Certificate-style (for educators)
- Template 3: Social media card (1080x1080)
- Template 4: Minimalist icon grid


#### Generation Process

1. User triggers from profile or milestone notification
2. Select template
3. Client-side HTML5 Canvas renders badge
4. Overlay user stats (name, XP, badges, level)
5. Download as PNG or share directly to social media

#### Technical Implementation

- Library: `html2canvas` or `fabric.js`
- Templates: SVG with dynamic text fields
- Export formats: PNG, JPEG
- Social media integration: Web Share API

***

### 8.8 Leaderboard System (P1)

#### Description

Competitive rankings to motivate users and celebrate top contributors.

#### Leaderboard Types

1. **Global** - All users, sorted by total XP
2. **Regional** - By country/state/city
3. **Mission-Specific** - Top contributors per event
4. **Friends** - Compare with followed users
5. **Streak** - Longest plastic-free streaks

#### Display Elements

- Rank, username, avatar, level, XP/metric
- Trend indicator (↑↓ since last week)
- User's own rank highlighted
- Top 3 podium animation


#### Privacy Options

- Opt-in to leaderboards (default: anonymous mode)
- Username vs. real name toggle
- Hide profile from global (but show in missions)


#### Refresh Cadence

- Real-time for mission leaderboards
- Daily cache for global (updates at midnight UTC)

***

## 9. Gamification System

### 9.1 XP (Experience Points) \& Levels

#### XP Sources

| Action | Base XP | Bonus Conditions |
| :-- | :-- | :-- |
| Submit debris report | 10 | +5 with photo, +10 first in area |
| Submit coral report | 20 | +10 if AI detects bleaching |
| Join cleanup mission | 30 | +20 if mission goal achieved |
| Complete daily quiz | 25 | +10 for perfect score |
| Daily check-in (streak) | 5 | Doubles after 30-day streak |
| Validate another's sighting | 3 | Max 10 validations/day |
| Comment/engage | 1 | Max 5/day |
| Invite friend who joins | 50 | One-time per friend |

#### Level Progression

- Level 1-10: 100 XP per level (linear)
- Level 11-25: 200 XP per level
- Level 26-50: 500 XP per level
- Total XP to Level 50: ~45,000 XP


#### Level Perks

- **Level 5**: Unlock regional leaderboards
- **Level 10**: Create private missions
- **Level 15**: Access advanced filters
- **Level 20**: Unlock AI coral tools
- **Level 25**: Nominate new Ambassadors
- **Level 50**: Lifetime "Legend" badge

***

### 9.2 Badge System

#### Badge Categories

**1. Milestone Badges**

- First Sighting, Level 5/10/25/50, 100 Reports, 1-Year Anniversary

**2. Mission Badges**

- Mission Rookie (1st mission), Mission Master (10 missions), Event Champion (top contributor)

**3. Streak Badges**

- 7-Day Warrior, 30-Day Champion, 100-Day Guardian, 365-Day Legend

**4. Specialty Badges**

- Coral Protector (50 coral reports), Ghost Net Hunter (10 net reports), Rare Species Spotter

**5. Community Badges**

- Team Player (5 validated reports), Mentor (helped 10 new users), Ambassador

**6. Seasonal/Event Badges**

- Earth Day 2026, World Oceans Day, Holiday Beach Blitz


#### Badge Design System

- Consistent circular format
- Color-coded by rarity (Bronze/Silver/Gold/Platinum)
- Animated unlock sequence
- Shareable via social media

***

### 9.3 Achievement System

#### Achievement Tiers

- **Common** (75% earn): Basic actions (first report, first quiz)
- **Uncommon** (40% earn): Consistent engagement (7-day streak, 5 missions)
- **Rare** (15% earn): Dedication (50 reports, 30-day streak)
- **Epic** (5% earn): Mastery (Level 25, 100 missions)
- **Legendary** (1% earn): Lifetime commitment (Level 50, 365-day streak)


#### Hidden Achievements

- Secret badges revealed only upon completion
- Examples: "Night Owl" (report at 3 AM), "Explorer" (report in 10 regions), "Photographer" (100 photos uploaded)

***

### 9.4 Social Features

#### Friend System

- Follow other players
- See friends' recent activity feed
- Challenge friends to beat streaks/XP
- Gift badges for special occasions


#### Teams/Guilds (Future)

- Form groups with friends/organizations
- Compete in team leaderboards
- Unlock team-exclusive badges
- Shared mission progress

***

## 10. UI/UX Specifications

### 10.1 Design Principles

1. **Mobile-First**: 90% of interactions happen on smartphones
2. **One-Thumb Navigation**: Critical actions within thumb reach
3. **Progressive Disclosure**: Show complexity only when needed
4. **Instant Feedback**: Every action triggers immediate visual response
5. **Gameful Aesthetics**: Playful but not childish; ocean-themed

***

### 10.2 Color Palette

#### Primary Colors

- **Ocean Blue** `#0077BE` - Primary actions, headers
- **Coral Orange** `#FF6B35` - Alerts, bleaching indicators
- **Sea Green** `#2ECC71` - Success, healthy status
- **Sandy Beige** `#F4E4C1` - Backgrounds, neutral states


#### Severity Indicators

- **Healthy** `#2ECC71` (Green)
- **Mild Concern** `#F39C12` (Yellow)
- **Moderate** `#E67E22` (Orange)
- **Severe** `#E74C3C` (Red)


#### Accessibility

- WCAG 2.1 AA contrast ratios (4.5:1 minimum)
- Colorblind-safe palette (deuteranopia tested)
- Alternative icons for color-dependent info

***

### 10.3 Typography

- **Headers**: Montserrat Bold (24-36px)
- **Body**: Open Sans Regular (16px base)
- **Captions**: Open Sans Light (12-14px)
- **Gamification Elements**: Rubik Medium (playful, rounded)

***

### 10.4 Component Library

#### Navigation

- **Bottom Tab Bar** (Mobile)
    - Home/Map, Missions, Profile, More
    - Icons with labels
    - Active state: colored + underline
- **Top App Bar**
    - Logo, notification bell, settings icon
    - Collapsible on scroll


#### Cards

- **Sighting Card**: Photo, type icon, location, timestamp, upvotes
- **Mission Card**: Banner image, title, date, participant count, CTA button
- **Badge Card**: Animated badge, title, unlock date


#### Forms

- **Report Form**: Floating labels, photo picker, map picker, submit button
- **Comment Form**: Avatar + text input + send icon


#### Modals

- **Level-Up Modal**: Animated celebration, new perks unlocked
- **Badge Unlocked Modal**: Badge animation + share buttons
- **Mission Complete Modal**: Team stats, XP earned, leaderboard snippet

***

### 10.5 Key Screen Mockups (Text Descriptions)

#### Home/Dashboard Screen

```
┌─────────────────────────────┐
│ [Logo]  🔔 ⚙️               │
├─────────────────────────────┤
│ "Welcome back, Ocean Hero!" │
│ Level 12 ▓▓▓▓▓▓░░░ 67%     │
├─────────────────────────────┤
│ 📊 Quick Stats              │
│ 🗑️ 47 Reports | 🔥 12 Streak│
├─────────────────────────────┤
│ 🗺️ Near You                 │
│ [Map Preview - 3 pins]      │
│ [View Full Map →]           │
├─────────────────────────────┤
│ 🎯 Active Missions (2)      │
│ ┌──────────────────────┐   │
│ │[Image] Manila Bay    │   │
│ │Cleanup Challenge     │   │
│ │🕐 2 hours left       │   │
│ │[Join Mission]        │   │
│ └──────────────────────┘   │
├─────────────────────────────┤
│ 🧠 Daily Quiz Available ✨  │
│ [Take Quiz - Earn 25 XP]   │
└─────────────────────────────┘
 [Home] [Missions] [+] [Profile]
```


#### Report Submission Screen

```
┌─────────────────────────────┐
│ ← Log a Sighting            │
├─────────────────────────────┤
│ What did you find?          │
│ ┌───┬───┬───┬───┐          │
│ │🗑️ │🎣 │🐢 │🪸 │          │
│ │Trash│Net│Wildlife│Coral│  │
│ └───┴───┴───┴───┘          │
├─────────────────────────────┤
│ 📷 Add Photo                │
│ [Tap to capture/upload]     │
├─────────────────────────────┤
│ 📍 Location                 │
│ [Mini Map - GPS Pin]        │
│ Manila Bay, Pasay City      │
├─────────────────────────────┤
│ 📝 Description (optional)   │
│ [Text input]                │
├─────────────────────────────┤
│ 🌡️ Severity                 │
│ 😊──────🙁──────😢         │
├─────────────────────────────┤
│ [Submit & Earn 10 XP] 🎁   │
└─────────────────────────────┘
```


#### Mission Detail Screen

```
┌─────────────────────────────┐
│ ← Bantayan Reef Clean Blitz │
├─────────────────────────────┤
│ [Hero Image - Coral Reef]   │
│ 📅 Feb 14, 2026 | 9AM-12PM  │
│ 📍 Bantayan Island, Cebu    │
│ 👥 23 Guardians Joined      │
├─────────────────────────────┤
│ About This Mission          │
│ "Join us to protect..."     │
│ [Read More ↓]               │
├─────────────────────────────┤
│ 🎯 Mission Goals            │
│ □ Collect 100 items         │
│ □ Cover 2km of beach        │
│ Progress: ▓▓▓░░░ 60%        │
├─────────────────────────────┤
│ 🏆 Rewards                  │
│ +50 XP | Reef Guardian Badge│
├─────────────────────────────┤
│ 💬 Live Chat (12 messages)  │
│ [View Chat]                 │
├─────────────────────────────┤
│ [I'm In! RSVP Now] ✅       │
└─────────────────────────────┘
```


#### Profile Screen

```
┌─────────────────────────────┐
│ [Avatar] Marine Hero #1247  │
│ Level 12 - Rescue Diver     │
│ ⭐ 1,450 XP                  │
├─────────────────────────────┤
│ 📊 Impact Stats             │
│ 🗑️ 47 Reports               │
│ 🎯 5 Missions Completed     │
│ 🔥 12-Day Streak            │
│ 🪸 8 Coral Scans            │
├─────────────────────────────┤
│ 🏅 Badges (12/50)           │
│ [🥇][🐢][🌊][🔥][...]       │
│ [View All →]                │
├─────────────────────────────┤
│ 🎖️ Recent Achievements      │
│ ✅ First Mission Complete   │
│ ✅ 7-Day Streak Warrior     │
├─────────────────────────────┤
│ [Edit Profile] [Settings]   │
│ [Share My Impact Badge]     │
└─────────────────────────────┘
```


#### Leaderboard Screen

```
┌─────────────────────────────┐
│ 🏆 Leaderboards             │
│ [Global][Local][Missions]   │
├─────────────────────────────┤
│ 🥇 1. @OceanWarrior - 8,450 │
│ 🥈 2. @CoralQueen - 7,890   │
│ 🥉 3. @ReefRanger - 6,720   │
│ ─────────────────────       │
│ 12. 👤 YOU - 1,450 XP ↑3    │
│ ─────────────────────       │
│ 13. @DiveMaster - 1,380     │
│ 14. @BeachPatrol - 1,290    │
├─────────────────────────────┤
│ 🔥 Weekly Top Gainers       │
│ 1. @NewHero +890 XP         │
│ 2. @MissionKing +750 XP     │
└─────────────────────────────┘
```


***

### 10.6 Accessibility Features

- Screen reader labels on all interactive elements
- Keyboard navigation (Tab, Enter, Arrow keys)
- High contrast mode toggle
- Font size adjustment (100%-150%)
- Motion reduction option (disable animations)
- Alternative text for all images
- ARIA landmarks and roles

***

### 10.7 Responsive Breakpoints

- **Mobile**: 320px - 767px (primary target)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+ (secondary priority)

***

## 11. User Journeys

### Journey 1: Casual Beachgoer Becomes Active Player

**Persona:** Maria, 28, urban professional, weekend beach visitor

**Starting Point:** Discovers OceanGuardian via social media ad

**Steps:**

1. **Discovery** (Week 1, Day 1)
    - Clicks ad → Lands on homepage as Guest
    - Browses public map, sees 15 debris pins near favorite beach
    - Intrigued, signs up via Google OAuth
2. **First Action** (Week 1, Day 1)
    - Completes onboarding tutorial (3 screens)
    - Logs first debris sighting (plastic bottle on beach)
    - Uploads photo, auto-GPS tags location
    - Earns "First Sighting" badge + 15 XP
    - Level up notification: "Level 2 - Beach Newbie"
3. **Engagement** (Week 1, Days 2-7)
    - Receives daily quiz notification
    - Completes 3 quizzes, earns 75 XP
    - Logs 2 more debris sightings during weekend beach trip
    - Starts plastic-free streak (checks in daily)
    - Discovers nearby mission: "Manila Bay Cleanup"
4. **Community Connection** (Week 2)
    - Joins first cleanup mission
    - Meets 12 other users in live chat
    - Logs 8 debris items during mission
    - Earns "Mission Rookie" badge + 50 XP bonus
    - Follows 3 active users
5. **Habit Formation** (Week 3-4)
    - Daily check-ins become routine (14-day streak)
    - Reaches Level 5, unlocks regional leaderboard
    - Sees herself ranked \#47 locally
    - Challenges friend to join, earns 50 XP referral bonus
6. **Mastery** (Month 2-3)
    - Completes 5 missions, applies for Ambassador role
    - Reaches 30-day plastic-free streak
    - Creates first local mission for her neighborhood
    - Total: Level 12, 1,450 XP, 8 badges

**Outcome:** Transformed from curious visitor to active community organizer

***

### Journey 2: Diver Documents Coral Decline

**Persona:** Carlos, 35, certified diver, marine biology enthusiast

**Starting Point:** Notices coral bleaching on dive trip, searches for reporting tool

**Steps:**

1. **Urgency-Driven Discovery** (Day 1)
    - Googles "report coral bleaching Philippines"
    - Finds OceanGuardian via blog post
    - Signs up immediately, skips tutorial
2. **Specialized Use** (Day 1)
    - Navigates to "Log Coral Bleaching"
    - Uploads underwater photo from recent dive
    - AI analysis returns: "45% bleaching detected"
    - Adds water temp (31°C), depth (8m), description
    - Submits report, earns 25 XP
3. **Deep Engagement** (Week 1)
    - Returns next day to submit 5 more coral photos
    - Discovers AI analysis feature
    - Reaches Level 6, unlocks full coral tools
    - Views regional coral heatmap, shocked by extent
4. **Community Contribution** (Week 2-4)
    - Joins underwater cleanup mission
    - Validates 20 other users' sightings
    - Comments with expert insights ("This is Acropora coral")
    - Reputation score reaches 120
5. **Scientist Path** (Month 2)
    - Applies for Scientist role (submits credentials)
    - Approved by admin
    - Exports 3 months of coral data for research paper
    - Presents OceanGuardian at marine biology conference
6. **Advocacy** (Month 3+)
    - Recruits 30 fellow divers to join platform
    - Organizes monthly underwater mission series
    - Collaborates with local NGO using exported data

**Outcome:** Became key data contributor and platform advocate

***

### Journey 3: Teacher Engages Students

**Persona:** Elena, 42, high school science teacher

**Starting Point:** Looking for hands-on conservation project for students

**Steps:**

1. **Professional Discovery** (Week 1)
    - Recommended OceanGuardian by colleague
    - Creates account, explores as Player
    - Completes 2 quizzes to understand gamification
2. **Pilot Test** (Week 2)
    - Assigns 5 students to create accounts
    - Organizes field trip to nearby beach
    - Students log 23 debris items collectively
    - Reviews data on class laptop
3. **Classroom Integration** (Month 1)
    - Creates private mission for entire class (30 students)
    - Sets goal: "Log 100 items in 1 month"
    - Students compete for class leaderboard
    - Top student earns extra credit
4. **Ambassador Application** (Month 2)
    - Applies for Ambassador role
    - Approved based on classroom success
    - Creates monthly missions for school district
    - Moderates local student submissions
5. **Curriculum Expansion** (Month 3-6)
    - Incorporates OceanGuardian data into lesson plans
    - Students analyze trends (plastic types, hotspots)
    - Presents findings at school science fair
    - Downloads CSV data for student research projects
6. **Scaling Impact** (Year 1)
    - Recruits 5 other teachers to adopt platform
    - Facilitates inter-school cleanup competitions
    - Students collectively log 2,000+ items
    - School wins "Educational Impact Award"

**Outcome:** Transformed classroom into active conservation community

***

### Journey 4: NGO Scientist Validates Research

**Persona:** Dr. Reyes, 48, marine conservation NGO director

**Starting Point:** Seeks cost-effective coral monitoring solution

**Steps:**

1. **Strategic Evaluation** (Day 1)
    - Discovers OceanGuardian via funding proposal
    - Reviews public data on website
    - Signs up to test export functionality
2. **Data Quality Assessment** (Week 1)
    - Downloads sample coral bleaching dataset
    - Compares with NGO's own field surveys
    - Finds 78% spatial correlation
    - Identifies data gaps in remote areas
3. **Scientist Onboarding** (Week 2)
    - Applies for Scientist role with credentials
    - Approved, gains access to raw image database
    - Reviews AI predictions, provides feedback
    - Flags 12 images for retraining
4. **Research Integration** (Month 1-2)
    - Exports 6 months of data for grant report
    - Cites OceanGuardian in research paper
    - Presents findings at ICRS conference
    - Co-authors blog post with platform team
5. **Partnership Development** (Month 3-6)
    - NGO officially partners with OceanGuardian
    - Recruits volunteers to submit coral reports
    - Provides expert validation for AI model
    - Hosts joint cleanup missions
6. **Long-Term Collaboration** (Year 1+)
    - NGO integrates platform into all field programs
    - Contributes 40% of all coral bleaching data
    - Secures \$50K grant citing crowd-sourced data
    - Advocates for OceanGuardian in policy meetings

**Outcome:** Validated scientific utility, became key institutional partner

***

## 12. Technical Architecture

### 12.1 System Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ Mobile Web │  │  Desktop   │  │   PWA      │        │
│  │   (React)  │  │  (React)   │  │ (Offline)  │        │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘        │
└────────┼────────────────┼────────────────┼───────────────┘
         │                │                │
         └────────────────┴────────────────┘
                          │
         ┌────────────────▼────────────────┐
         │      API Gateway / Router       │
         │    (Vibe Platform Hosting)      │
         └────────────────┬────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                  │
    ┌────▼─────┐                    ┌─────▼────┐
    │  Auth    │                    │  Cloud   │
    │ Service  │                    │Functions │
    │(Google   │                    │(Business │
    │ OAuth)   │                    │  Logic)  │
    └────┬─────┘                    └─────┬────┘
         │                                 │
         └────────────────┬────────────────┘
                          │
         ┌────────────────▼────────────────┐
         │    Vibe Native NoSQL Database   │
         │   Collections: users, sightings,│
         │   missions, badges, analytics   │
         └────────────────┬────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                  │
    ┌────▼─────┐                    ┌─────▼────┐
    │  Media   │                    │   AI     │
    │ Storage  │                    │ Service  │
    │ (Images) │                    │(Coral ML)│
    └──────────┘                    └──────────┘
```


### 12.2 Technology Stack

| Layer | Technology | Rationale |
| :-- | :-- | :-- |
| **Frontend** | React 18 + Vibe UI Kit | Component reusability, Vibe ecosystem integration |
| **State Management** | React Context + Hooks | Lightweight, sufficient for MVP complexity |
| **Routing** | React Router v6 | Client-side navigation, deep linking |
| **Maps** | Auto-detect (Leaflet/Mapbox) | Flexible across Vibe variants |
| **Authentication** | Google OAuth (Vibe provider) | One-tap sign-in, no password management |
| **Database** | Vibe Native NoSQL | Zero-config, free tier, real-time sync |
| **File Storage** | Vibe Asset Bucket | 5GB free, integrated CDN |
| **Serverless Functions** | Vibe Cloud Functions | Event-driven logic (AI, notifications) |
| **AI/ML** | TensorFlow.js or Custom API | Edge inference or serverless GPU |
| **Analytics** | Vibe Built-in Dashboard | Real-time metrics, zero setup |
| **Hosting** | Vibe Static Hosting | Global CDN, auto-scaling |
| **CI/CD** | GitHub Actions → Vibe Deploy | Automated testing and deployment |

### 12.3 API Endpoints

#### Authentication

```
POST /auth/google
POST /auth/logout
GET /auth/me
```


#### Users

```
GET /users/:id
PATCH /users/:id
DELETE /users/:id
GET /users/:id/stats
```


#### Sightings

```
GET /sightings (filters: type, region, date, radius)
POST /sightings
PATCH /sightings/:id
DELETE /sightings/:id (admin only)
POST /sightings/:id/validate (upvote)
```


#### Missions

```
GET /missions (filters: status, region, date)
POST /missions (Ambassador+)
PATCH /missions/:id (owner/admin)
DELETE /missions/:id (admin)
POST /missions/:id/join
GET /missions/:id/participants
```


#### Coral AI

```
POST /coral/analyze (upload image, returns severity)
GET /coral/heatmap (region, date range)
POST /coral/validate (Scientist feedback)
```


#### Gamification

```
POST /checkin (daily streak)
GET /leaderboard (type: global/local/mission)
GET /badges/:userId
POST /badges/generate (impact badge)
```


#### Export (Scientist+)

```
GET /export/sightings (CSV/GeoJSON)
GET /export/missions
GET /export/coral-data
```


***

## 13. Data Models

### 13.1 Users Collection

```javascript
{
  id: string,                    // Google UID
  email: string,
  username: string,
  avatar: string,                // URL
  role: enum['guest','player','ambassador','scientist','admin'],
  level: number,                 // 1-50
  xp: number,                    // Total XP earned
  reputation: number,            // 0-1000, from validations
  streakDays: number,
  lastCheckIn: timestamp,
  totalSightings: number,
  totalMissions: number,
  badges: [string],              // Badge IDs
  assignedRegions: [string],     // For Ambassadors
  createdAt: timestamp,
  lastActive: timestamp,
  preferences: {
    notifications: boolean,
    leaderboardVisible: boolean,
    theme: 'light'|'dark'
  }
}
```


### 13.2 Sightings Collection

```javascript
{
  id: string,
  userId: string,                // null for anonymous
  type: enum['garbage','floating','wildlife','coral'],
  subcategory: string,           // 'plastic bottle', 'ghost net', etc.
  location: {
    lat: number,
    lng: number,
    address: string,             // Reverse geocoded
    region: string               // City/State
  },
  imageUrl: string,
  description: string,
  severity: number,              // 1-5
  bleachPercent: number,         // null unless type=coral
  waterTemp: number,             // null unless type=coral
  depth: number,                 // For underwater sightings
  timestamp: timestamp,
  missionId: string,             // null if not part of mission
  validated: boolean,            // Community validation
  validationCount: number,
  aiAnalysis: {                  // For coral only
    bleachPercent: number,
    confidence: number,
    modelVersion: string
  },
  status: enum['pending','approved','flagged','removed'],
  flagReason: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```


### 13.3 Missions Collection

```javascript
{
  id: string,
  creatorId: string,
  title: string,
  description: string,
  bannerImage: string,
  type: enum['public','private','timed','recurring'],
  status: enum['upcoming','active','completed','cancelled'],
  location: {
    lat: number,
    lng: number,
    address: string,
    radius: number               // Meters
  },
  startTime: timestamp,
  endTime: timestamp,
  goals: [
    { type: 'items', target: 100, current: 67 },
    { type: 'distance', target: 2000, current: 1340 }
  ],
  rewards: {
    xpMultiplier: 1.5,
    badges: ['mission_badge_id']
  },
  participants: [string],        // User IDs
  maxParticipants: number,       // null = unlimited
  chatMessages: [
    { userId: string, username: string, message: string, timestamp: timestamp }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```


### 13.4 Badges Collection

```javascript
{
  id: string,
  name: string,
  description: string,
  category: enum['milestone','mission','streak','specialty','community','seasonal'],
  rarity: enum['common','uncommon','rare','epic','legendary'],
  iconUrl: string,
  requirement: {
    type: 'xp'|'level'|'sightings'|'missions'|'streak',
    value: number
  },
  isHidden: boolean,             // Secret achievements
  createdAt: timestamp
}
```


### 13.5 Analytics Events Collection

```javascript
{
  id: string,
  userId: string,
  eventType: string,             // 'page_view', 'add_sighting', 'join_mission', etc.
  eventData: object,             // Context-specific data
  sessionId: string,
  deviceType: 'mobile'|'desktop'|'tablet',
  timestamp: timestamp
}
```


***

## 14. Security \& Privacy

### 14.1 Authentication \& Authorization

#### Google OAuth Flow

1. User clicks "Sign in with Google"
2. Redirected to Google consent screen
3. Google returns ID token
4. Vibe platform validates token
5. User profile created/updated in database
6. Session token issued (JWT, 7-day expiry)

#### Token Management

- **Access Token**: Short-lived (1 hour), stored in httpOnly cookie
- **Refresh Token**: Long-lived (7 days), secure storage
- **Automatic Refresh**: Silent renewal before expiry


#### Role Enforcement

- Frontend: Hide UI for unauthorized actions
- Backend: All API endpoints validate role via middleware
- Database: Firestore security rules enforce RBAC/ABAC

***

### 14.2 Data Privacy

#### GDPR Compliance

- **Right to Access**: Export all user data via profile settings
- **Right to Deletion**: One-click account deletion (7-day soft delete)
- **Right to Portability**: Download data in JSON format
- **Consent Management**: Clear opt-ins for location, photos, analytics


#### Location Privacy

- GPS coordinates rounded to 100m precision for public display
- Exact coordinates only visible to user and Scientists
- Option to submit with "approximate location" (city-level)


#### Image Privacy

- EXIF metadata stripped on upload
- Face detection + blur for people in background
- User-requested image deletion within 24 hours

***

### 14.3 Content Moderation

#### Automated Filters

- **Image Moderation**: Cloud Vision API flags inappropriate content
- **Text Filtering**: Profanity filter on comments/descriptions
- **Spam Detection**: Rate limiting + duplicate submission detection


#### Human Review Queue

- Flagged content reviewed by Ambassadors/Admins within 48 hours
- Three-strike policy for violations
- Appeals process via support email


#### Reporting System

- Users can flag sightings, comments, missions
- Report categories: Spam, Inappropriate, False Data, Other
- Auto-hide after 3 flags, pending review

***

### 14.4 Infrastructure Security

#### API Security

- HTTPS only (TLS 1.3)
- Rate limiting: 100 requests/minute per user
- API keys for scientist data exports (rotated quarterly)
- CORS whitelist for allowed domains


#### Database Security

- Firestore security rules enforce read/write permissions
- Encryption at rest and in transit
- Regular backups (daily snapshots, 30-day retention)
- No direct database access (API-only)


#### Third-Party Integrations

- Google OAuth: Official SDK, minimal scopes
- Map providers: API keys restricted to domain
- AI services: Isolated serverless functions

***

## 15. Analytics \& Monitoring

### 15.1 Key Performance Indicators (KPIs)

#### User Engagement

- **Daily Active Users (DAU)**: Target 500 by Month 3
- **Weekly Active Users (WAU)**: Target 2,000 by Month 6
- **Session Duration**: Target 8 minutes average
- **Return Rate**: Target 40% D7 retention


#### Content Metrics

- **Sightings Per User Per Week**: Target 2.5
- **Mission Participation Rate**: Target 30% of active users
- **Coral Reports Per Week**: Target 50
- **Data Validation Rate**: Target 70% validated within 48h


#### Gamification Metrics

- **Average Level**: Track progression curve
- **Badge Unlock Rate**: Target 3 badges per user per month
- **Streak Completion**: Target 25% reach 30-day streak
- **Leaderboard Engagement**: Target 50% check weekly


#### Impact Metrics

- **Total Debris Logged**: Target 10,000 by Month 6
- **Coral Bleaching Reports**: Target 500 by Month 6
- **Cleanup Missions Completed**: Target 50 by Month 6
- **Geographic Coverage**: Target 20 coastal cities

***

### 15.2 Analytics Events

#### Core Events

- `app_opened`, `page_view`, `sign_up`, `sign_in`, `sign_out`
- `add_sighting`, `upload_photo`, `submit_report`
- `join_mission`, `complete_mission`, `create_mission`
- `daily_checkin`, `quiz_completed`, `badge_unlocked`, `level_up`
- `share_badge`, `invite_friend`, `validate_sighting`


#### Custom Properties

- User: `role`, `level`, `streakDays`, `region`
- Session: `deviceType`, `platform`, `referrer`
- Action: `sightingType`, `missionType`, `badgeRarity`

***

### 15.3 Monitoring \& Alerts

#### Performance Monitoring

- **Page Load Times**: Alert if >5s on mobile
- **API Response Times**: Alert if >2s for critical endpoints
- **Error Rates**: Alert if >1% of requests fail
- **Uptime**: Target 99.5% availability


#### Data Quality Monitoring

- **Image Upload Failures**: Alert if >5% fail
- **GPS Accuracy**: Flag submissions with >500m error
- **AI Model Accuracy**: Weekly validation against ground truth
- **Spam Detection**: Alert if flagged content exceeds threshold


#### User Experience Alerts

- **Drop-off Rates**: Alert if >50% abandon report form
- **Mission Participation**: Alert if <10 users join upcoming mission
- **Streak Breaks**: Monitor for sudden spike in broken streaks

***

### 15.4 Dashboards

#### Admin Dashboard

- Real-time user count and activity heatmap
- Top contributors leaderboard
- Content moderation queue
- Mission calendar and participation trends
- System health metrics


#### Ambassador Dashboard

- Regional sighting map and stats
- Local leaderboard
- Mission management tools
- Moderation queue (regional only)


#### Scientist Dashboard

- Coral bleaching heatmap
- Data export tools
- AI model performance metrics
- Research-ready visualizations

***

## 16. Non-Profit Considerations

### 16.1 Funding Strategy

#### Phase 1: Bootstrap (Months 1-6)

- Zero-cost infrastructure (free tiers)
- Volunteer development team
- Organic growth via social media


#### Phase 2: Grants \& Sponsorships (Months 7-12)

- Apply for ocean conservation grants (e.g., Ocean Conservancy, Pew)
- Seek corporate sponsorships (eco-friendly brands)
- Crowdfunding campaign for server costs


#### Phase 3: Sustainability (Year 2+)

- Institutional partnerships with universities/NGOs
- Government contracts for data services
- Optional premium features for organizations (white-label missions)

***

### 16.2 Partnership Opportunities

#### Target Partners

- **Conservation NGOs**: WWF, Oceana, Coral Triangle Initiative
- **Academic Institutions**: Marine biology departments
- **Government Agencies**: Environmental ministries, coastal management
- **Corporate CSR Programs**: Eco-friendly brands (Patagonia, method)
- **Dive Centers**: Recruit diver communities


#### Partnership Benefits

- Access to crowd-sourced data
- Co-branded cleanup missions
- Educational content collaboration
- Grant application support
- Press and media exposure

***

### 16.3 Open Data Policy

#### What We Share

- Aggregated sighting data (anonymized)
- Coral bleaching trends and heatmaps
- Mission impact reports
- Research-ready datasets (CSV/GeoJSON)


#### What We Protect

- Personal user information (emails, profiles)
- Exact GPS coordinates (publicly displayed at 100m precision)
- Unpublished research data (embargoed upon request)


#### Data Licensing

- Open Database License (ODbL) for public datasets
- Attribution required for academic use
- Commercial use requires partnership agreement

***

### 16.4 Community Governance

#### Advisory Board (Year 1+)

- Marine scientists (3)
- Conservation practitioners (2)
- Tech/UX experts (2)
- Community representatives (3)
- Quarterly meetings to guide strategy


#### User Feedback Loops

- Monthly surveys for active users
- Ambassador community calls
- Public roadmap and feature voting
- Transparent development blog

***

## 17. Implementation Roadmap

### Phase 1: Core MVP (Weeks 1-8)

#### Sprint 1 (Weeks 1-2): Foundation

- [ ] Vibe project setup and repo structure
- [ ] Google OAuth integration
- [ ] Database schema design
- [ ] Basic routing and navigation
- [ ] Responsive layout shell


#### Sprint 2 (Weeks 3-4): Mapping \& Reporting

- [ ] Interactive map component
- [ ] Sighting submission form
- [ ] Photo upload and compression
- [ ] GPS auto-capture
- [ ] Basic data display on map


#### Sprint 3 (Weeks 5-6): Gamification

- [ ] XP system and level calculation
- [ ] Badge database and unlock logic
- [ ] Profile page with stats
- [ ] Daily check-in for streak
- [ ] Leaderboard (global only)


#### Sprint 4 (Weeks 7-8): Missions

- [ ] Mission creation form (Ambassador)
- [ ] Mission listing and detail pages
- [ ] RSVP and participation logic
- [ ] Mission-specific leaderboard
- [ ] Basic live chat

**Deliverable:** Functional MVP with core features deployed

***

### Phase 2: Enhancement (Weeks 9-16)

#### Sprint 5 (Weeks 9-10): AI Coral Analysis

- [ ] Coral image upload flow
- [ ] TensorFlow.js model integration
- [ ] Bleaching severity display
- [ ] Coral heatmap visualization
- [ ] Scientist validation interface


#### Sprint 6 (Weeks 11-12): Community Features

- [ ] Comment system on sightings
- [ ] Validation/upvote mechanism
- [ ] User following system
- [ ] Activity feed
- [ ] Notification system


#### Sprint 7 (Weeks 13-14): Education \& Engagement

- [ ] Daily quiz system
- [ ] Learning nugget library
- [ ] Impact badge generator
- [ ] Social sharing integration
- [ ] Onboarding tutorial


#### Sprint 8 (Weeks 15-16): Data \& Analytics

- [ ] Data export (CSV/GeoJSON)
- [ ] Ambassador regional dashboard
- [ ] Scientist tools and filters
- [ ] Analytics integration
- [ ] Performance optimization

**Deliverable:** Feature-complete platform ready for beta testing

***

### Phase 3: Polish \& Scale (Weeks 17-24)

#### Sprint 9 (Weeks 17-18): Testing \& QA

- [ ] Cross-browser testing
- [ ] Mobile device testing (iOS/Android)
- [ ] Accessibility audit and fixes
- [ ] Performance profiling and optimization
- [ ] Security audit


#### Sprint 10 (Weeks 19-20): Content \& Moderation

- [ ] Populate learning content (50+ quizzes)
- [ ] Set up moderation workflows
- [ ] Create mission templates
- [ ] Design badge graphics (30+ badges)
- [ ] Write help documentation


#### Sprint 11 (Weeks 21-22): Platform Comparison

- [ ] Deploy to 3 Vibe platforms
- [ ] Performance benchmarking
- [ ] Developer experience survey
- [ ] Cost analysis and optimization
- [ ] Select primary platform


#### Sprint 12 (Weeks 23-24): Launch Prep

- [ ] Beta user recruitment (50 testers)
- [ ] Beta testing and bug fixes
- [ ] Marketing materials (landing page, social media)
- [ ] Press kit and NGO outreach
- [ ] Launch plan finalization

**Deliverable:** Production-ready platform, beta-tested, launch-ready

***

### Post-Launch (Months 7-12)

#### Month 7: Public Launch

- Soft launch with partner NGOs
- Social media campaign
- Press outreach
- Onboard first 500 users


#### Months 8-9: Iteration

- Weekly feature releases based on feedback
- Bug fixes and performance tuning
- Content updates (new quizzes, missions)
- Community management


#### Months 10-12: Growth

- Partnership expansion (5+ NGOs)
- Geographic expansion (10+ regions)
- Grant applications
- Year 1 impact report

***

## 18. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
| :-- | :-- | :-- | :-- |
| **Free tier quota exceeded** | Medium | High | Implement aggressive caching, rate limiting; monitor usage weekly; prepare paid tier budget |
| **Low user engagement** | High | High | Launch with pre-seeded missions; partner with NGOs for guaranteed initial users; gamification testing |
| **AI model inaccuracy** | Medium | Medium | Scientist validation loop; confidence thresholds; continuous retraining; fallback to manual review |
| **Spam/fake submissions** | Medium | Medium | Google sign-in required; rate limiting; community validation; automated filters |
| **Data privacy breach** | Low | Critical | Security audit; HTTPS only; GDPR compliance; regular penetration testing |
| **Platform compatibility issues** | Medium | Medium | Extensive testing across Vibe variants; maintain abstraction layers; fallback options |
| **Insufficient moderation capacity** | Medium | High | Automated filters; distributed moderation (Ambassadors); clear community guidelines |
| **Low scientist adoption** | Medium | High | Early outreach to research institutions; demonstrate data quality; publish case studies |
| **Funding shortfall** | High | Medium | Maintain zero-cost architecture; diversify funding sources; transparent budget tracking |
| **Coral AI training data scarcity** | Medium | Medium | Partner with existing datasets (CoralNet); incentivize quality submissions; active learning |


***

## 19. Success Metrics

### 19.1 Launch Success (Month 1)

- [ ] 500+ registered users
- [ ] 1,000+ sightings submitted
- [ ] 10+ cleanup missions completed
- [ ] 50+ coral reports with AI analysis
- [ ] Zero critical security incidents
- [ ] <5% error rate across platform

***

### 19.2 Growth Success (Month 6)

- [ ] 5,000+ registered users
- [ ] 10,000+ sightings submitted
- [ ] 100+ cleanup missions completed
- [ ] 500+ coral bleaching reports
- [ ] 3+ NGO partnerships
- [ ] Featured in 5+ media outlets
- [ ] 40% D7 retention rate
- [ ] 25% users reach 30-day streak

***

### 19.3 Impact Success (Year 1)

- [ ] 20,000+ registered users across 20+ coastal regions
- [ ] 50,000+ debris items logged and mapped
- [ ] 2,000+ coral bleaching reports analyzed
- [ ] 500+ cleanup missions mobilizing 5,000+ volunteers
- [ ] 10+ research papers citing OceanGuardian data
- [ ] 5+ government agencies using data for policy
- [ ] \$50K+ in grants secured
- [ ] Measurable ocean health improvements in partner regions

***

## 20. Future Enhancements (Year 2+)

### 20.1 Advanced Features

- **Offline-First PWA**: Full functionality without internet
- **Team/Guild System**: Form groups, compete in team leaderboards
- **AR Mode**: "Pokemon GO" style - discover virtual ocean creatures at real cleanup sites
- **Predictive Analytics**: AI predicts debris hotspots based on currents, weather
- **Blockchain Credits**: Tokenized carbon credits for mangrove/seagrass restoration


### 20.2 Expanded Coverage

- **Inland Waterways**: Rivers, lakes, wetlands conservation
- **Marine Wildlife Tracking**: Integration with animal tagging data
- **Underwater Missions**: Specialized features for technical divers
- **Citizen Science Protocols**: Partner with universities on structured research


### 20.3 Platform Scaling

- **Mobile Native Apps**: iOS and Android for better performance
- **API Marketplace**: Third-party developers build on OceanGuardian data
- **White-Label Solution**: NGOs can deploy branded versions
- **Multi-Language**: 10+ languages for global reach


### 20.4 Social Impact

- **Policy Dashboard**: Government-facing interface for decision-makers
- **Corporate Reporting**: Help companies track CSR ocean conservation impact
- **Education Platform**: Curriculum integration for schools (K-12, university)
- **Virtual Reality**: Immersive VR reef tours to educate non-coastal populations

***

## Appendix A: Glossary

- **XP**: Experience Points, earned through conservation actions
- **Streak**: Consecutive days of plastic-free check-ins
- **Mission**: Organized cleanup event with goals and rewards
- **Sighting**: User-submitted report of debris, wildlife, or coral
- **Badge**: Visual achievement unlocked through milestones
- **Validation**: Community verification of sighting accuracy
- **Bleaching**: Coral stress response causing color loss
- **Ambassador**: Trusted user with moderation and mission creation powers
- **RBAC**: Role-Based Access Control
- **ABAC**: Attribute-Based Access Control

***

## Appendix B: Contact \& Support

**Project Lead:** Marine Conservation Team
**Email:** support@oceanguardian.org
**GitHub:** github.com/oceanguardian/platform
**Community Forum:** community.oceanguardian.org
**Emergency Contact:** emergency@oceanguardian.org

***

## Document Changelog

| Version | Date | Changes | Author |
| :-- | :-- | :-- | :-- |
| 1.0 | Feb 1, 2026 | Initial PRD | Team |
| 2.0 | Feb 8, 2026 | Complete Master Blueprint with RBAC, ABAC, journeys, full features | Team |


***

**End of Master Blueprint**

***

This comprehensive blueprint serves as the single source of truth for OceanGuardian development. Update this document as features evolve, partnerships form, and user feedback shapes the platform's future.

**Ready to build? Let's protect the ocean, one click at a time! 🌊**

