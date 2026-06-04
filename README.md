# Quiz Master - A Modern Quiz Platform

![Quiz Master](frontend/src/assets/icons/logo.png)

Quiz Master is a full-stack web application designed to provide an engaging and interactive quiz experience for students. It features a modern, responsive frontend built with React and a robust backend powered by Node.js, Express, and Sequelize.

## ✨ Features

*   **Student Authentication:** Secure login and registration for students.
*   **Quiz Categories:** Browse and select quizzes from various categories.
*   **Timed Quizzes:** Quizzes with time limits to challenge students.
*   **Real-time Leaderboard:** See your global ranking and compete with others.
*   **XP and Streaks:** Earn experience points (XP) and maintain streaks.
*   **Responsive Design:** Fully responsive and works on all devices.
*   **Admin Panel (Future):** Manage quizzes, categories, and users.

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v14 or later)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   [MySQL](https://www.mysql.com/) or another compatible database.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/quiz-platform.git
cd quiz-platform
```

### 2. Backend Setup

The backend is an Express server that connects to a MySQL database using Sequelize.

```bash
cd backend
npm install
```

Create a `.env` file by copying the `.env.example` file:

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quiz_db
```

Run the database migrations and start the server:

```bash
npm run dev
```

The backend will be running on `http://localhost:8000`.

### 3. Frontend Setup

The frontend is a React application built with Vite.

```bash
cd frontend
npm install
npm run dev
```

The frontend will be running on `http://localhost:5173`.

## 🛠️ Technologies Used

### Frontend

*   **Framework:** [React](https://reactjs.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Routing:** [React Router](https://reactrouter.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)

### Backend

*   **Framework:** [Express.js](https://expressjs.com/)
*   **ORM:** [Sequelize](https://sequelize.org/)
*   **Database:** [MySQL](https://www.mysql.com/)
*   **Authentication:** [JWT](https://jwt.io/)

## 📸 Screenshots

*(Add screenshots of your application here)*

| Login Page | Dashboard | Quiz Page |
| :---: | :---: | :---: |
| ![Login](link-to-screenshot) | ![Dashboard](link-to-screenshot) | ![Quiz](link-to-screenshot) |

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/quiz-platform/issues).

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 👨‍💻 Developer

*   **Sahan Kaushalya**

## 📄 License

This project is licensed under the MIT License.
