// src/api.js
import axios from 'axios';

const API_URL = "http://localhost:8080";  // Die URL deines Backend-Servers

// Hole das Token aus dem LocalStorage (es wird nach dem Login dort gespeichert)
const getAuthToken = () => {
  return localStorage.getItem("token");  // Annahme: Das Token wird als 'token' im LocalStorage gespeichert
};

// Bearbeite die Anfrage mit Authorization-Header
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${getAuthToken()}`, // Füge das Token in den Header ein
  },
});

export const registerUser = async (user) => {
  try {
    const response = await axiosInstance.post(`/users/register`, user);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Registrieren: ", error);
    throw error;
  }
};

export const loginUser = async (user) => {
  try {
    const response = await axiosInstance.post(`/users/login`, user);
    // Speichere das Token im LocalStorage, nachdem der Login erfolgreich war
    localStorage.setItem("token", response.data.token);  // Das Token sollte im Response enthalten sein
    return response.data;
  } catch (error) {
    console.error("Fehler beim Login: ", error);
    throw error;
  }
};

