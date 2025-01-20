import React from 'react';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { deriveKey, decryptData } from './cryptoUtils';

function Login() {
    const navigate = useNavigate();

    async function handleLogin(event) {
        event.preventDefault();

        const email = event.target.email.value;
        const password = event.target.password.value;

        try {
            const response = await fetch(`http://localhost:8080/data?email=${email}`);
            if (!response.ok) {
                throw new Error("Fehler beim Abrufen der Daten.");
            }

            const { data, salt, passwordHash } = await response.json();

            const isPasswordValid = bcrypt.compareSync(password, passwordHash);
            if (!isPasswordValid) {
                throw new Error("Falsches Passwort.");
            }

            // AES-Schlüssel aus Salt und Passwort ableiten
            const aesKey = await deriveKey(password, Uint8Array.from(atob(salt), c => c.charCodeAt(0)));
            const decryptedData = await decryptData(aesKey, data.ciphertext, data.iv);

            localStorage.setItem("userEmail", email);
            localStorage.setItem("userPassword", password);
            navigate("/");

        } catch (error) {
            console.error("Fehler beim Login:", error);
            alert("Login fehlgeschlagen: " + error.message);
        }
    }

    return (
        <form onSubmit={handleLogin}>
            <h1>Anmelden</h1>
            <label>Email:</label>
            <input type="email" name="email" required />
            <label>Passwort:</label>
            <input type="password" name="password" required />
            <button type="submit">Anmelden</button>
        </form>
    );
}

export default Login;
