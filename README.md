# INVENZO – Asset Management System 🧾💼

INVENZO is a lightweight web-based asset management system built using **HTML**, **CSS**, **JavaScript**, **Node.js**, and **MySQL**. Inspired by AssetTiger, it helps organizations keep track of their assets, check-ins/check-outs, and asset history.

---

## 🚀 Features

- 🔐 Secure Signup/Login with JWT Authentication
- 🧾 Add, edit, delete assets
- 📦 Check-in / Check-out system (coming soon)
- 📊 Dashboard for managing and viewing asset inventory
- 👤 Role-based access (coming soon)

---

## 🛠️ Tech Stack

| Layer         | Technology       |
|---------------|------------------|
| Frontend      | HTML, CSS, JavaScript |
| Backend       | Node.js, Express.js |
| Database      | MySQL |
| Auth          | JWT (JSON Web Tokens) |
| Environment   | dotenv |

---

✅ Setup Instructions

**1.Clone the repo**

        git clone https://github.com/SuryaPanduri/invenzo.git
        cd invenzo

**2.Install dependencies**

        npm install

**3.Create .env file**

        DB_HOST=localhost

        DB_USER=root

        DB_PASS=your_password

        DB_NAME=invenzo_db

        JWT_SECRET=your_super_secret_key

**4.Run MySQL schema**

        Import sql/schema.sql into your MySQL to create tables.

**5.Start the server**

        node server/app.js

**6.Access the app**

        Open public/login.html in your browser

**📬 API Endpoints**

        POST   /api/users/signup       - Create a user
        POST   /api/users/login        - Login + JWT token
        GET    /api/assets             - Get all assets (Auth)

**🔒 Security**

        •Passwords are hashed using bcrypt
        •Routes are protected with JWT-based middleware
        •.env is excluded using .gitignore

**🙋‍♂️ Author**

        Made with ❤️ by Surya Panduri
        Building INVENZO to simplify asset tracking and learning full-stack magic! ✨