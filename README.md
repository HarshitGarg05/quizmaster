# 🎓 QuizMaster: The Cognitive Atelier

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://quizmaster-protocol.vercel.app)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)

**QuizMaster** is a high-fidelity MERN platform designed to transform traditional assessment into a premium, merit-driven experience. Built with a focus on **Maiden-Attempt Integrity**, the platform ensures that every achievement—from XP to global rank—is a true reflection of the scholar's learning journey.

---

## 🏗️ Core Meritocracy Architecture

### 🛡️ Maiden-Attempt Integrity
The platform features a proprietary **XP Guard** system that enforces a strict First-Attempt reward protocol. 
- **Maiden Rewards**: Full XP, accuracy bonuses, and time multipliers are awarded exclusively on the first attempt at any quiz.
- **Retake Protocol**: Scholars can retake quizzes as many times as they wish for mastery, but global rankings and total XP remain tethered to their original achievement to prevent merit inflation.

### 📊 Persistent Dynamic Leaderboard
Unlike traditional rankings that rely on volatile logs, QuizMaster's leaderboard is built on a **Dual-Persistence Layer**:
- **Profile Persistence**: Your rank (Explorer, Expert, Legend) is tied to your permanent identity.
- **Soft-Delete Recovery**: Clearing your recent activity dashboard "hides" the history from your view but maintains your global merit for Weekly, Monthly, and All-Time rankings.

### 🎨 The "Cognitive Atelier" UI
A premium design language featuring:
- **Soft Aurora Animations**: Dynamic background waves that interact with user focus.
- **Border Glow Components**: High-fidelity glowing borders that highlight achievements.
- **Glassmorphic Rankings**: Elegant, layered leaderboard rows with dynamic user highlighting.

---

## 🚀 Technical Stack

- **Frontend**: React 19, Framer Motion, TailwindCSS, axios.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Authentication.
- **Deployment**: Vercel (Front & Back), MongoDB Atlas.

---

## 🛠️ Installation & Setup

1. **Clone the Identity**:
   ```bash
   git clone https://github.com/HarshitGarg05/quizmaster.git
   cd quizmaster
   ```

2. **Backend Infrastructure**:
   ```bash
   cd backend
   npm install
   # Configure your .env with MONGODB_URI and JWT_SECRET
   npm run dev
   ```

3. **Frontend Presentation**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 🏆 Current Ranks & Thresholds

- **Explorer**: 300+ XP (Initial Merit)
- **Challenger**: 800+ XP
- **Expert**: 2,000+ XP
- **Master**: 5,000+ XP
- **Grandmaster**: 9,000+ XP
- **Legend**: 15,000+ XP (Apex Standing)

---

Developed with ❤️ by **Antigravity** for Harshit Garg.
