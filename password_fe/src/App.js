// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import PasswordOverview from './components/PasswordOverview';
import './Style.css'



function App() {
  return (
    <BrowserRouter> {/* Verwende BrowserRouter statt Router */}
      <div>
        <Routes>
          <Route path="/register" element={<Register />} /> {/* Verwende element statt component */}
          <Route path="/login" element={<Login />} />
          <Route path="/passwords" element={<PasswordOverview />} />
          <Route path="/" element={<Login />} /> {/* Verwende element statt component */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
