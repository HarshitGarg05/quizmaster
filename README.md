# QuizMaster: Interactive Learning & Merit Platform

[![Deployment Status](https://img.shields.io/badge/Vercel-Deployed-green?style=flat-square)](https://quizmaster-protocol.vercel.app)
[![Tech Stack](https://img.shields.io/badge/MERN-Stack-blue?style=flat-square)](https://mongodb.com)

**QuizMaster** is a full-stack quiz platform designed to provide a fair and competitive learning environment. It focuses on rewarding a user's first attempt while allowing unlimited practice to master the material.

---

## How It Works

### First-Attempt Rewards
To ensure the leaderboard remains fair, XP and accuracy statistics are only calculated during your **first attempt** at any quiz.
- **Rewards**: You earn full XP, accuracy bonuses, and speed bonuses only on your first try.
- **Retakes**: You can retake any quiz as many times as you like to practice, but your global rank and total XP will stay tied to your original score. This prevents users from "gaming" the system by memorizing answers.

### Dynamic Leaderboard
The leaderboard allows you to see how you rank against other users in different timeframes (Weekly, Monthly, and All-Time).
- **Persistent Stats**: Even if you clear your dashboard history, your global rank and merit points are preserved.
- **Personalized View**: Your own rank is always highlighted at the bottom of the leaderboard so you can quickly see your standing.

---

## Tech Stack

- **Frontend**: React 19, Framer Motion (Animations), TailwindCSS.
- **Backend**: Node.js, Express, MongoDB with Mongoose.
- **Authentication**: Secure JWT-based login system.
- **Deployment**: Automated builds on Vercel.

---

## How to Set Up Locally

1. **Clone the Project**:
   ```bash
   git clone https://github.com/HarshitGarg05/quizmaster.git
   cd quizmaster
   ```

2. **Run the Backend**:
   ```bash
   cd backend
   npm install
   # Add your MONGODB_URI and JWT_SECRET to a .env file
   npm run dev
   ```

3. **Run the Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## User Ranks

Users progress through several ranks based on their total XP:

- **Rookie**: 0+ XP (Starting Rank)
- **Explorer**: 300+ XP
- **Challenger**: 800+ XP
- **Expert**: 2,000+ XP
- **Master**: 5,000+ XP
- **Grandmaster**: 9,000+ XP
- **Legend**: 15,000+ XP

---

Created for **Harshit Garg**.
