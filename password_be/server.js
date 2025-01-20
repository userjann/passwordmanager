const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

let users = {}; // Format: { email: { passwordHash, salt, data } }

app.use(bodyParser.json());

function deriveKey(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

function encryptData(key, data) {
    const iv = crypto.randomBytes(12); // AES-GCM benötigt 12 Byte IV
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();
    return {
        ciphertext: encrypted,
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64')
    };
}

function decryptData(key, ciphertext, iv, authTag) {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (users[email]) {
        return res.status(400).json({ message: 'Benutzer existiert bereits.' });
    }

    try {
        const salt = crypto.randomBytes(16).toString('base64');
        const passwordHash = await bcrypt.hash(password, 10);

        users[email] = { passwordHash, salt, data: {} };

        res.json({ message: 'Benutzer erfolgreich registriert.', salt });
    } catch (error) {
        res.status(500).json({ message: 'Fehler bei der Registrierung' });
    }
});

app.get('/data', (req, res) => {
    const email = req.query.email;
    if (!email || !users[email]) {
        return res.status(404).json({ message: 'Benutzer nicht gefunden.' });
    }

    const { passwordHash, salt, data } = users[email];
    res.json({ passwordHash, salt, data });
});

app.post('/safe', (req, res) => {
    const { email, ciphertext, iv, authTag } = req.body;

    if (!users[email]) {
        return res.status(404).json({ message: 'Benutzer nicht gefunden.' });
    }

    const key = deriveKey(users[email].passwordHash, users[email].salt);
    const encryptedData = encryptData(key, ciphertext);

    users[email].data = {
        ciphertext: encryptedData.ciphertext,
        iv: encryptedData.iv,
        authTag: encryptedData.authTag
    };

    res.json({ message: 'Passwort-Safe erfolgreich aktualisiert.' });
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
