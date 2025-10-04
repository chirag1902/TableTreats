// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login"; // <-- import Login

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} /> {/* <-- add Login route */}
        <Route
          path="/"
          element={
            <div style={{ padding: "20px", textAlign: "center" }}>
              <h1>Welcome to TableTreats</h1>
              <a href="/signup">Go to Sign Up</a>
              <br />
              <a href="/login">Go to Login</a> {/* link to login */}
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
