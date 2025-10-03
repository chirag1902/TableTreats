// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './pages/SignUp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Welcome to TableTreats</h1>
            <a href="/signup">Go to Sign Up</a>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;