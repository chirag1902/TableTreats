# 🍽️ TableTreats

A full-stack database management and booking platform for restaurants. TableTreats supports two user roles: **Customer** and **Restaurant Owner**. Owners register their restaurant and maintain details (menus, hours, tables, availability), while customers browse restaurants, filter/search by features, and make bookings.

## 🌐 Live Demo

| Application | URL |
|-------------|-----|
| **Customer App** | [https://table-treats-eight.vercel.app/](https://table-treats-eight.vercel.app/) |
| **Restaurant Owner App** | [https://table-treats-d27w.vercel.app/](https://table-treats-d27w.vercel.app/) |

---

## 📑 Table of Contents

- [Project Description](#-project-description)
- [Features](#-features)
- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Setup Guide](#-setup-guide)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)

---

## 📖 Project Description

TableTreats is a full-stack application designed to:
- Let **restaurant owners** register and manage their restaurant details, menus, and availability
- Let **customers** discover restaurants and make table bookings

### Goals

- ✅ Provide a straightforward onboarding flow for restaurant owners
- ✅ Allow customers to search restaurants by location, cuisine, rating, price range, and special features
- ✅ Support bookings with time slots, party size, and booking confirmation
- ✅ Be easy to run locally and simple to deploy

---

## ✨ Features

### Customer (User)
- 🔐 Sign up / Sign in (email/password authentication)
- 🔍 Browse restaurants with photos and details
- 🎯 Filter and search (location, cuisine, price, rating, availability)
- 📋 View menu and restaurant details (hours, address, contact)
- 📅 Make, view, update, or cancel bookings
- 📧 Receive booking confirmation
- 💳 Pay bills

### Restaurant Owner
- 🔐 Register and claim owner account
- 🏪 Create and manage restaurant profile (name, address, opening hours)
- 🍕 Add menus, images, and table layout
- 🪑 Configure seating arrangements
- 📈 View analytics / booking history
- 🎁 Create and manage deals/promotions
- 🧾 Create bills for customers

---

## 🏗️ Architecture Overview

```
TableTreats/
├── .gitignore
├── README.md
├── docker-compose.yml
├── package.json
├── requirements.txt
│
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       ├── config.py
│       ├── database.py
│       ├── main.py
│       ├── routers/
│       │   ├── auth_customer.py
│       │   ├── customer_restaurant_router.py
│       │   ├── customers.py
│       │   ├── deals.py
│       │   └── reservation_router.py
│       ├── schemas/
│       │   ├── bill_schema.py
│       │   ├── customer_restaurant_schema.py
│       │   ├── deal_schema.py
│       │   ├── reservation_schema.py
│       │   └── user_schema.py
│       ├── services/
│       │   ├── bill_service.py
│       │   ├── customer_restaurant_service.py
│       │   ├── deal_service.py
│       │   ├── reservation_service.py
│       │   └── user_service.py
│       └── utils/
│           └── auth.py
│
├── docs/
│   ├── api-specs.md
│   └── architecture.md
│
├── frontend/
│   ├── customer-app/
│   │   ├── public/
│   │   │   └── index.html
│   │   └── src/
│   │       ├── assets/
│   │       ├── pages/
│   │       ├── services/
│   │       ├── App.js
│   │       ├── App.jsx
│   │       ├── index.css
│   │       ├── index.js
│   │       └── routes.js
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   ├── postcss.config.js
│   │   └── tailwind.config.js
│   │
│   └── restaurant-app/
│       ├── public/
│       └── src/
│           ├── api/
│           ├── assets/
│           ├── components/
│           ├── pages/
│           ├── App.jsx
│           ├── App.css
│           ├── index.css
│           └── main.jsx
│       ├── package.json
│       ├── package-lock.json
│       ├── tailwind.config.js
│       ├── vite.config.js
│       └── vercel.json
│
└── restaurant_backend/
    ├── __init__.py
    ├── requirements.txt
    └── app/
        ├── config.py
        ├── connect_test.py
        ├── database.py
        ├── main.py
        ├── models/
        ├── routers/
        ├── schemas/
        └── services/
```

---

## 🛠️ Tech Stack

### Frontend
- **React** - UI Framework
- **Vite** - Build tool (Restaurant App)
- **Create React App** - Build tool (Customer App)
- **Tailwind CSS** - Styling

### Backend
- **FastAPI** - Web Framework
- **Uvicorn** - ASGI Server
- **Motor** - MongoDB Async Driver
- **python-jose** - JWT Encoding/Decoding
- **Passlib** - Password Hashing

### Database
- **MongoDB Atlas** - Cloud Database

### Deployment
- **Vercel** - Frontend Hosting
- **Render** - Backend Hosting

---

## 📋 Prerequisites

- **Git**
- **Node.js** (v16 or higher)
- **Python 3.10+**
- **MongoDB Atlas Account**
- **Vercel Account** (for frontend deployment)
- **Render Account** (for backend deployment)

---

## 🚀 Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/ds2268/TableTreats.git
cd TableTreats
```

### 2. Customer Side Setup

#### 2.1 Customer Backend (Port 8000)

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Create and configure .env file
cp .env.example .env

# Start the server
uvicorn app.main:app --reload --port 8000
```

✅ **Customer Backend API:** http://127.0.0.1:8000  
📚 **API Docs:** http://127.0.0.1:8000/docs

#### 2.2 Customer Frontend (Port 3000)

```bash
cd frontend/customer-app
npm install
npm start
```

✅ **Customer Frontend:** http://localhost:3000

### 3. Restaurant Owner Side Setup

#### 3.1 Restaurant Backend (Port 8001)

```bash
cd restaurant_backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Create and configure .env file
cp .env.example .env

# Start the server
uvicorn app.main:app --reload --port 8001
```

✅ **Restaurant Backend API:** http://127.0.0.1:8001  
📚 **API Docs:** http://127.0.0.1:8001/docs

#### 3.2 Restaurant Frontend (Port 5173)

```bash
cd frontend/restaurant-app
npm install
npm run dev
```

✅ **Restaurant Frontend:** http://localhost:5173

---

## 🔐 Environment Variables

Create a `.env` file in both `backend/` and `restaurant_backend/` directories:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

> ⚠️ **Security Note:** Never commit `.env` files to version control.

---

## 📚 API Documentation

Both backends provide interactive API documentation via Swagger UI:

- **Customer Backend API Docs:** http://127.0.0.1:8000/docs
- **Restaurant Backend API Docs:** http://127.0.0.1:8001/docs

For detailed API specifications, see [docs/api-specs.md](docs/api-specs.md)

---

## 🚀 Deployment

### Deploying Your Own Instance

#### Frontend (Vercel)
1. Fork this repository
2. Connect your GitHub to Vercel
3. Import the project
4. Set the root directory to `frontend/customer-app` or `frontend/restaurant-app`
5. Configure environment variables
6. Deploy

#### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the root directory to `backend` or `restaurant_backend`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables
7. Deploy


