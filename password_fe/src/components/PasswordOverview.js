// PasswordOverview.js
import { useEffect, useState } from "react";
import axios from "axios";
import '../Style.css';

const PasswordOverview = () => {
  const [passwords, setPasswords] = useState([]);
  const [error, setError] = useState(null);
  const [newEntry, setNewEntry] = useState({ website: "", email: "", password: "" });

  useEffect(() => {
    const fetchPasswords = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      try {
        const response = await axios.get("http://localhost:8080/passwords/overview", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPasswords(response.data);
      } catch (err) {
        setError("Error fetching data");
        console.error("Fehler beim Abrufen der Passwörter:", err);
      }
    };

    fetchPasswords();
  }, []);

  const addPassword = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found");
      return;
    }

    try {
      await axios.post("http://localhost:8080/passwords/add", newEntry, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setNewEntry({ website: "", email: "", password: "" });
    } catch (err) {
      setError("Error adding password");
      console.error("Fehler beim Hinzufügen des Passworts:", err);
    }
  };

  return (
    <div className="container">
      <h1>Password Overview</h1>
      {error && <p className="error">{error}</p>}
      <div className="password-list">
        {passwords.map((entry, index) => (
          <div key={index} className="password-item">
            {entry.website && <p><strong>Website:</strong> {entry.website}</p>}
            {entry.email && <p><strong>Email:</strong> {entry.email}</p>}
            {entry.password && <p><strong>Password:</strong> {entry.password}</p>}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <h2>Add New Password</h2>
        <div className="form-group">
          <label>Website</label>
          <input 
            type="text" 
            placeholder="Website" 
            value={newEntry.website} 
            onChange={(e) => setNewEntry({ ...newEntry, website: e.target.value })} 
          />
        </div>
        <div className="form-group">
          <label>Username</label>
          <input 
            type="text" 
            placeholder="Username" 
            value={newEntry.email} 
            onChange={(e) => setNewEntry({ ...newEntry, email: e.target.value })} 
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            placeholder="Password" 
            value={newEntry.password} 
            onChange={(e) => setNewEntry({ ...newEntry, password: e.target.value })} 
          />
        </div>
        <button onClick={addPassword}>Add Password</button>
      </div>
    </div>
  );
};

export default PasswordOverview;