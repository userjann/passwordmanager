import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deriveKey, encryptData, decryptData } from './cryptoUtils';

function Home() {
    const [passwordSafe, setPasswordSafe] = useState({});
    const [formData, setFormData] = useState({
        website: "",
        username: "",
        password: "",
        note: "",
    });
    const [editId, setEditId] = useState(null);
    const [aesKey, setAesKey] = useState(null);
    const [passwordVisibility, setPasswordVisibility] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        const password = localStorage.getItem("userPassword");

        if (!email || !password) {
            navigate("/login");
            return;
        }

        const loadSafe = async () => {
            try {
                console.log("Lade Passwort-Safe...");
                const response = await fetch(`http://localhost:8080/data?email=${email}`); // Korrekt formatiert
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Fehler bei der API-Antwort:", errorData);
                    throw new Error("Fehler beim Abrufen des Passwort-Safes.");
                }

                const { data, salt } = await response.json();
                console.log('Serverantwort:', { data, salt });

                // Der Schlüssel wird hier abgeleitet
                const aesKey = await deriveKey(password, atob(salt));
                console.log('AES Key erfolgreich abgeleitet:', aesKey);
                setAesKey(aesKey);

                if (data.ciphertext) {
                    // Prüfen, ob 'data.ciphertext' vorhanden und im richtigen Format ist
                    console.log('Ciphertext:', data.ciphertext);
                    console.log('IV:', data.iv);
                    // Entschlüsseln der Daten
                    const decryptedSafe = await decryptData(aesKey, data.ciphertext, data.iv);
                    console.log('Entschlüsselte Daten:', decryptedSafe);

                    if (!decryptedSafe) {
                        throw new Error("Fehler beim Entschlüsseln der Daten.");
                    }

                    setPasswordSafe(JSON.parse(decryptedSafe || "{}"));
                } else {
                    setPasswordSafe({});
                }
            } catch (error) {
                console.error("Fehler beim Laden des Passwort-Safes:", error);
                alert("Fehler beim Laden des Passwort-Safes: " + error.message);
            }
        };

        loadSafe();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveNewEntry = async () => {
        try {
            const id = Date.now();
            const updatedSafe = { ...passwordSafe, [id]: formData };
            await saveSafe(updatedSafe);
            setPasswordSafe(updatedSafe);
            setFormData({ website: "", username: "", password: "", note: "" });
        } catch (error) {
            console.error("Fehler beim Speichern eines neuen Eintrags:", error);
            alert("Speichern fehlgeschlagen. Bitte versuche es erneut.");
        }
    };

    const saveSafe = async (safe) => {
        try {
            const email = localStorage.getItem("userEmail");
            const { ciphertext, iv } = await encryptData(aesKey, JSON.stringify(safe || {}));

            const response = await fetch("http://localhost:8080/safe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, ciphertext, iv }),
            });

            if (!response.ok) {
                throw new Error("Fehler beim Speichern der Daten im Backend.");
            }

            const result = await response.json();
            if (result.message !== "Passwort-Safe erfolgreich aktualisiert.") {
                throw new Error("Unerwartete Antwort vom Server.");
            }

            console.log("Safe erfolgreich gespeichert:", result.message);
        } catch (error) {
            console.error("Fehler beim Speichern im Backend:", error);
            throw error;
        }
    };

    return (
        <div>
            <h1>Passwort-Safe</h1>
            <div>
                <h2>Neuer Eintrag</h2>
                <input
                    type="text"
                    name="website"
                    placeholder="Webseite"
                    value={formData.website}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="username"
                    placeholder="Username/Email"
                    value={formData.username}
                    onChange={handleInputChange}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Passwort"
                    value={formData.password}
                    onChange={handleInputChange}
                />
                <textarea
                    name="note"
                    placeholder="Notiz"
                    value={formData.note}
                    onChange={handleInputChange}
                />
                <button onClick={handleSaveNewEntry}>Speichern</button>
            </div>

            <div>
                <h2>Gespeicherte Einträge</h2>
                {Object.keys(passwordSafe).length > 0 ? (
                    Object.entries(passwordSafe).map(([id, entry]) => (
                        <div key={id}>
                            <p>
                                Webseite:{" "}
                                <strong>{entry.website}</strong>
                            </p>
                            <p>Benutzername: {entry.username}</p>
                            <p>
                                Passwort:{" "}
                                <span>
                                    {passwordVisibility[id] ? entry.password : "••••••••"}
                                </span>
                            </p>
                            <button onClick={() => setPasswordVisibility(prev => ({ ...prev, [id]: !prev[id] }))}>
                                {passwordVisibility[id] ? "Verbergen" : "Anzeigen"}
                            </button>
                            <p>Notiz: {entry.note}</p>
                        </div>
                    ))
                ) : (
                    <p>Keine Einträge vorhanden.</p>
                )}
            </div>
        </div>
    );
}

export default Home;
