export async function deriveKey(password, salt) {
    const passwordBuffer = new TextEncoder().encode(password);
    const saltBuffer = salt; // Salt ist bereits ein Uint8Array

    // Deriving the key using the Web Crypto API's pbkdf2 function
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        passwordBuffer,
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: saltBuffer,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );

    return key;
}

export async function encryptData(key, data) {
    try {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encodedData = new TextEncoder().encode(data);

        const ciphertext = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            encodedData
        );

        // Return ciphertext und IV als Base64-kodierte Strings
        return {
            ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
            iv: btoa(String.fromCharCode(...iv)),
        };
    } catch (error) {
        console.error("Fehler bei der Verschlüsselung:", error);
        throw new Error("Fehler bei der Verschlüsselung der Daten.");
    }
}

export async function decryptData(key, ciphertext, iv) {
    try {
        if (!ciphertext || !iv) {
            throw new Error("Ciphertext oder IV fehlen");
        }

        // Überprüfe, ob die Base64-codierten Strings gültig sind
        const decodedCiphertext = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
        const decodedIV = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: decodedIV },
            key,
            decodedCiphertext
        );

        return new TextDecoder().decode(decrypted);
    } catch (error) {
        console.error("Fehler bei der Entschlüsselung:", error);
        throw new Error("Fehler bei der Entschlüsselung der Daten.");
    }
}
