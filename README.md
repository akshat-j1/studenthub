# 🚀 StudentHub

*A unified platform for students to discover, share, and collaborate on opportunities*

---

## 📌 Description (Short - for GitHub / Resume)

**StudentHub** is a full-stack web platform designed to help students discover hackathons, internships, and curated learning resources in one place. It also enables students to collaborate by joining community groups, saving opportunities, and accessing AI-powered recommendations.

The platform is built with the vision of creating a **student-driven ecosystem** where opportunities are not just consumed, but also shared and experienced together.

---

## 🎯 Purpose & Vision

Most students struggle with:

* Finding **relevant opportunities**
* Knowing **which resources are actually good**
* Finding **teammates for hackathons**

👉 **StudentHub solves this by:**

* Centralizing opportunities
* Adding **community + collaboration**
* Providing **AI-driven guidance**
* Enabling **peer validation (upvotes, saves)**

The long-term goal is to build a **student community platform**, not just a listing website.

---

## ✨ Features

### 🧠 AI Recommendations

* Get top opportunities based on current listings
* Helps students decide what to apply for

### 🏆 Hackathons Section

* Browse hackathons
* Post new hackathons
* Add **team/Telegram group links** to collaborate

### 💼 Internships Section

* View curated internships
* Filter based on relevance

### 🎓 Student Offers Section

* Categorized into domains like:

  * AI/ML
  * Data Science
  * Editing
  * Agentic AI
* Each category has top resources
* **Upvote system**:

  * Rank best courses
  * Highlight trending categories

### 🔖 Saved Opportunities

* Save/bookmark opportunities
* Synced per user (Supabase)

### 🔐 Authentication

* Signup/Login using Supabase Auth
* Persistent sessions

### 📊 Smart Filtering

* Search + filters:

  * Beginner-friendly
  * Remote
  * Paid
  * Saved only

---

## 🧱 Tech Stack

### Frontend

* **Next.js (App Router)**
* **React**
* **JavaScript**
* **Tailwind CSS**

### Backend / Database

* **Supabase**

  * PostgreSQL DB
  * Auth
  * Row Level Security (RLS)

### AI Integration

* OpenAI / Gemini API (for recommendations)

### Deployment

* **Vercel**

---

## ⚙️ Architecture Overview

```id="c0e4d2"
Frontend (Next.js)
   ↓
Supabase Client
   ↓
PostgreSQL Database
   ↓
Auth + RLS Policies
```

* No custom backend server
* Fully serverless architecture
* Secure via Supabase policies

---

## 🗂️ Database Structure (Simplified)

### `opportunities`

* id
* title
* description
* type (hackathon / internship / student_offer)
* category
* tags
* company
* location
* applyUrl

### `saved_opportunities`

* user_id
* opportunity_id

### `offer_votes`

* user_id
* opportunity_id (for upvotes)

---

## 🚀 Getting Started

### 1. Clone repo

```bash
git clone https://github.com/your-username/studenthub.git
cd studenthub
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
OPENAI_API_KEY=your_key
```

### 4. Run project

```bash
npm run dev
```

---

## 🌐 Deployment

Deployed on **Vercel**

Steps:

* Push to GitHub
* Import repo in Vercel
* Add env variables
* Deploy

---

## 🔮 Future Improvements

* 🧑‍🤝‍🧑 Team matching system
* 💬 Chat between participants
* 📈 Personalized dashboards
* 📅 Calendar integration
* 🧠 Better AI recommendations (profile-based)
* 📊 Leaderboards for contributors

---

## 💡 What Makes This Project Unique

This is **not just a CRUD app**.

It combines:

* 📦 Opportunity aggregation
* 🤝 Community building
* 🧠 AI assistance
* 📊 Social validation (upvotes, saves)

👉 Making it closer to a **“LinkedIn + Reddit + Product Hunt for students”**

---

## 🧑‍💻 Author

**Akshat Jain**
Building towards high-impact student tech products 🚀

---

# 🔥 One-Line Resume Description

> Built a full-stack student opportunity platform using Next.js and Supabase with AI recommendations, user authentication, and community-driven features like upvotes, saves, and team collaboration.

