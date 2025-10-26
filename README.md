# **TableTreats**

A full‑stack database management and booking platform for restaurants. TableTreats supports two user roles: Customer (User) and Restaurant Owner. Owners register their restaurant and maintain details (menus, hours, tables, availability), while customers browse restaurants, filter/search by features, and make bookings.

## **Table of Contents**

- Project description and purpose

- Features (Customer & Owner)

- Architecture overview

- Prerequisites

- Required tooling

- Setup Guide


## **Project description and purpose**
TableTreats is a full‑stack application designed to let restaurant owners register and manage their restaurant details and availability, and let customers discover restaurants and make table bookings. The README below gives developers everything they need to run the project locally, execute tests, and extend the system.

## **Goals**
- Provide a straightforward onboarding flow for restaurant owners.
- Allow customers to search restaurants by location, cuisine, rating, price range, and special features.
- Support bookings with time slots, party size, and booking confirmation.
- Be easy to run locally and simple to deploy.

## **Features**
### **Customer (User)**

- Sign up / sign in (email/password, or OAuth if enabled)
- Browse restaurants with photos and details
- Filter and search (location, cuisine, price, rating, availability)
- View menu and restaurant details (hours, address, contact)
- Make, view, update, or cancel bookings
- Receive booking confirmation (email/SMS placeholder)
- Rate & review restaurants (optional)

### **Restaurant Owner**
- Register and claim owner account
- Create and manage restaurant profile (name, address, opening hours)
- Add menus, images, and table layout
- Configure booking rules (lead time, max party size, slot length)
- Manage bookings (accept, reject, mark as seated)
- View analytics / booking history (optional)



## **Architecture overview**
TableTreats/</br>
├── backend/</br>
│   ├── main.py</br>
│   ├── requirements.txt</br>
│   ├── app/</br>
│   │   ├── routes/</br>
│   │   ├── models/</br>
│   │   ├── schemas/</br>
│   │   └── utils/</br>
│   └── config.py</br>
├── frontend/</br>
│   ├── index.html</br>
│   ├── package.json</br>
│   ├── vite.config.js</br>
│   ├── src/</br>
│   │   ├── main.jsx</br>
│   │   ├── App.jsx</br>
│   │   ├── components/</br>
│   │   └── pages/</br>
├── .env.example</br>

**Frontend (package.json)**</br>
- react, react-dom
- vite
- axios – API communication
- react-router-dom – routing
- @mui/material – Material UI components
- jwt-decode – JWT parsing

**Backend (requirements.txt)**</br>
- fastapi</br>
- uvicorn</br>
- pydantic</br>
- motor – MongoDB async driver</br>
- python-jose – JWT encoding/decoding</br>
- passlib – password hashing</br>
- dotenv</br>
- fastapi.middleware.cors – CORS setup</br>

**Database:**
- MongoDB
- 
## **Prerequisites**
- Git (for cloning the repo)
- Node.js (LTS 18+)
- Python 3.10+
- MongoDB (Atlas account)
- npm

**Required tooling**
- IDE: VS Code
- Database client:MongoDB Compass
- API testing: Postman
- Git for version control and branching

## **Setup Guide**
**1. Git Clone**
- git clone https://github.com/ds2268/TableTreats.git
cd TableTreats

**2. Backend Setup**
- cd backend</br>
- python -m venv venv</br>
- Windows: venv\Scripts\activate</br>
- pip install -r requirements.txt</br>
- cp .env.example .env  # then edit with your MongoDB Atlas URI and JWT secret</br>
- uvicorn main:app --reload -port8000
- For Customer: http://127.0.0.1:8000
- For Restaurant : http://127.0.0.1:8001

**3. Frontend Setup**
- cd ../frontend</br>
- npm install</br>
- npm run dev</br>
- For Customer: http://localhost:5173
- For Restaurant: http://localhost:5173

**4. Environment Variables**
  - MONGO_URI=<your_mongodb_atlas_connection></br>
  - JWT_SECRET=<your_jwt_secret></br>
  - JWT_ALGORITHM=HS256</br>

**5. Testing Application**

- Access the frontend in your browser via the links above.
- Use tools like Postman or MongoDB Compass to test the API and verify database entries.
  
