// src/components/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api';
import '../Style.css';


const Register = () => {
    const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = { email, password };
    
    try {
      const registeredUser = await registerUser(user);
      alert("Erfolgreich registriert!");
      navigate.push('/login');  // Nach erfolgreicher Registrierung auf die Login-Seite weiterleiten
    } catch (error) {
      alert("Fehler bei der Registrierung!");
    }
  };

  return (
    <div>
      <h2>Registrieren</h2>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Passwort:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Registrieren</button>
      </form>
    </div>
  );
};

export default Register;
