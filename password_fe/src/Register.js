import React from 'react';
import { useNavigate } from 'react-router-dom';
import { deriveKey } from './cryptoUtils';

function Register() {
    const navigate = useNavigate();

    async function handleRegister(event) {
        event.preventDefault();

        const email = event.target.email.value;
        const password = event.target.password.value;

        try {
            // API-Aufruf, um die Benutzerdaten abzurufen
            const response = await fetch("http://localhost:8080/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            if (!response.ok) {
                throw new Error("Fehler beim Abrufen der Daten.");
            }

            const { message, salt } = await response.json();
            console.log('Salt vom Backend:', salt);

            // Salt als Base64 dekodieren
            const decodedSalt = Uint8Array.from(atob(salt), c => c.charCodeAt(0));  // Base64 zu Uint8Array dekodieren
            console.log('Dekodierter Salt:', decodedSalt);

            // AES-Schlüssel ableiten
            const aesKey = await deriveKey(password, decodedSalt);
            console.log('AES Key abgeleitet:', aesKey);

            // Benutzerinformationen in localStorage speichern (optional)
            localStorage.setItem("userEmail", email);
            localStorage.setItem("userPassword", password);

            // Nach erfolgreicher Registrierung zur Home-Seite weiterleiten
            navigate('/home');
        } catch (error) {
            console.error("Fehler bei der Registrierung:", error);
            alert("Registrierung fehlgeschlagen.");
        }
    }

    return (
        <form onSubmit={handleRegister}>
            <h1>Registrieren</h1>
            <label>Email:</label>
            <input type="email" name="email" required />
            <label>Passwort:</label>
            <input type="password" name="password" required />
            <button type="submit">Registrieren</button>
        </form>
    );
}

export default Register;
