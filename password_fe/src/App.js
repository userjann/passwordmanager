import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './Home';
import Register from './Register';
import Login from './Login';

function App() {
    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <nav>
                        <Link to="/">Home</Link> | <Link to="/register">Registrieren</Link> | <Link to="/login">Anmelden</Link>
                    </nav>
                </header>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
