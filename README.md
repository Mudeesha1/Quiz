# 🏆 Quiz Master - Gamified Scholarship Learning Platform

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.37-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)](https://sequelize.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Quiz Master** is a comprehensive, gamified full-stack learning platform designed specifically for primary school students preparing for scholarship exams. By transforming traditional quiz-taking into a playful adventure, Quiz Master keeps students engaged using experience points (XP), streak tracking, level progression, and collectible achievement badges.

---

## 🗺️ Project Architecture & Folder Structure

The project is structured as a monorepo split into standard client-server directories:

```text
Quiz/
├── backend/                   # Express.js REST API
│   ├── config/                # Database connection & Sequelize configs
│   ├── emails/                # Nodemailer email templates
│   ├── handlers/              # Global middleware (e.g. error handling)
│   ├── managers/              # Core business logic (XP, Badges, system seeding)
│   ├── middleware/            # JWT Auth guards, Multi-part file upload rules
│   ├── models/                # Sequelize database models & relationship associations
│   ├── modules/               # Modular controller & route organization
│   │   ├── admin/             # Admin authentication, user manager, OpenRouter AI assistant
│   │   ├── application/       # Subjects, grades, quiz submission, and past paper modules
│   │   ├── uploads/           # Serving & managing local assets
│   │   └── users/             # User profiles, auth sessions, and reviews
│   └── app.js                 # API application entrypoint
│
├── frontend/                  # React Single-Page Application (SPA)
│   ├── public/                # Static public assets
│   ├── src/                   # React app source code
│   │   ├── assets/            # UI icons, design illustrations, and brand SVGs
│   │   ├── components/        # Helper UI utilities
│   │   ├── pages/             # Page layouts (Dashboard, Admin Panel, Leaderboard, Quizzes)
│   │   ├── services/          # API communication wrappers (Auth, App calls)
│   │   └── ui/                # Custom Playful Design System components
│   ├── DESIGN_SYSTEM.md       # Visual styling guidelines & UX values
│   ├── tailwind.config.js     # Custom Tailwind v4 utility values & tokens
│   └── vite.config.ts         # Vite bundler configurations
│
└── README.md                  # Project root overview (This file)
```

---

## ✨ Core System Features

### 1. Gamification Engine (XP & Leveling)
* **XP Progression:** Students gain **2 XP for every correct answer** they submit during quiz attempts.
* **20 Dynamic Levels:** The system seeds a 20-level hierarchy ranging from Level 1 (`Starter`) to Level 20 (`Quiz Legend`), requiring up to 25,000 XP.
* **Level-Up Indicator:** Live progress metrics calculate the exact XP remaining to unlock the next level, presenting an encouraging indicator during achievements.

### 2. Multi-Tier Badge Rewards
* **Milestones:** Earned by passing level milestones (e.g., Starter, Rookie, Scholar) or XP limits (e.g., Century, Legend).
* **Subject Experts:** Granted when students rank in the **top 3** for specific subject leaderboards.
  * Mathematics (ගණිතය) ➔ *Math Wizard*
  * Environmental Studies (පරිසරය) ➔ *Environment Expert*
  * English (ඉංග්‍රීසි) ➔ *English Master*
  * IQ (බුද්ධිය) ➔ *IQ Genius*
* **Activity Milestones:** Awarded for off-line learning milestones (e.g., *Bookworm* for bookmarking 10 past papers, *Paper Master* for downloading 10 past papers).
* **Streaks:** *On Fire* badge is awarded to users completing 5 quizzes within a single week.

### 3. Comprehensive Quiz & Past Papers Management
* **Interactive Quizzes:** Timed quiz sessions structured with responsive multiple-choice cards.
* **Category Organization:** Quizzes grouped dynamically according to grade standards and specific subjects.
* **Past Paper Vault:** Supports bookmarking papers for offline revision and logging PDF downloads.

### 4. Admin Management & AI Assistant
* **Full CRUD Operations:** Admins can create, read, update, and delete users, quizzes, questions, and subjects.
* **Dashboard Analytics:** Live monitoring dashboard showcasing registration counts, student levels, and quiz completion analytics.
* **AI Quiz Generator:** Generates high-quality quiz schemas automatically from topic prompts using OpenRouter integration.

---

## 🛠️ Technology Stack

* **Frontend:**
  * **React 19** – State management and UI rendering.
  * **Vite** – Fast, modern build tool bundle.
  * **Tailwind CSS v4** – Custom play-friendly styling system with 3D pressable buttons.
  * **Lucide React** – Clean, lightweight iconography.
  * **React Router Dom v7** – Client-side view routing.

* **Backend:**
  * **Express.js v5** – REST API framework.
  * **Sequelize ORM** – Relational mapping for object queries.
  * **MySQL** – Reliable transactional database.
  * **JWT (JsonWebToken)** – Stateless login session authentication.
  * **Nodemailer** – Transactional verification and system emails.

---

## 🚀 Getting Started (Local Development Setup)

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [MySQL Server](https://www.mysql.com/) installed and running locally
* [NPM](https://www.npmjs.com/) package manager

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/quiz-platform.git
cd quiz-platform
```

---

### Step 2: Backend Setup & Seeding

1. Navigate to the `backend` folder and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create an environment configuration file:
   ```bash
   # Copy or create your environment file
   cp .env.example .env
   ```

3. Update `.env` with your active database credentials and secrets:
   ```env
   PORT=5000
   NODE_ENV=development

   # Database settings
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=quiz_db

   # Nodemailer settings
   COMPANY_EMAIL=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password

   # JWT secret configurations
   JWT_SECRET=generate_a_random_jwt_secret
   JWT_ACCESS_SECRET=generate_a_random_access_secret
   JWT_REFRESH_SECRET=generate_a_random_refresh_secret
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   JWT_ISSUER=QuizMaster
   ```

4. Run the development server. Sequelize will automatically create database schemas (`alter: true`) and seed default levels, badges, and the administrator account:
   ```bash
   npm run dev
   ```

   > [!IMPORTANT]  
   > **Default Administrator Credentials:**  
   > * **Username:** `admin123`  
   > * **Password:** `admin123`

The REST API will run on `http://localhost:5000`.

---

### Step 3: Frontend Setup

1. Navigate to the `frontend` folder and install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

2. Verify or create the client `.env` file to reference the local API:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```

3. Launch the Vite dev server:
   ```bash
   npm run dev
   ```

The web application will open on `http://localhost:5173`.

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/users/register` | Register a new student | Public |
| **POST** | `/api/v1/users/login` | Student login (returns token) | Public |
| **GET** | `/api/v1/users/profile` | Retrieve student profile & rank | Student |
| **POST** | `/api/v1/admin/login` | Admin login | Public |
| **GET** | `/api/v1/admin/dashboard-stats` | Retrieve platform performance metrics | Admin |
| **POST** | `/api/v1/admin/ai-assistant/generate-quiz` | Auto-generate quiz data with AI | Admin |
| **GET** | `/api/v1/app/grades` | Fetch available student grades | Public |
| **GET** | `/api/v1/app/quizzes` | Fetch assigned category quizzes | Student |
| **POST** | `/api/v1/app/quizzes/:quizId/submit` | Submit answers and earn XP | Student |
| **GET** | `/api/v1/app/leaderboard` | Retrieve global system leaderboard | Student |

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer & Authors
* **Sahan Kaushalya** – Lead Project Developer
