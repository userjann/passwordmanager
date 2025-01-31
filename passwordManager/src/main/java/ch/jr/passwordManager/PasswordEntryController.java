// Backend: PasswordEntryController.java
package ch.jr.passwordManager;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/passwords")
public class PasswordEntryController {
    private final PasswordEntryRepository passwordEntryRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public PasswordEntryController(PasswordEntryRepository passwordEntryRepository, UserRepository userRepository, JwtService jwtService) {
        this.passwordEntryRepository = passwordEntryRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping("/overview")
    public ResponseEntity<List<PasswordEntry>> getPasswordOverview(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(null);
            }
            String token = authHeader.replace("Bearer ", "");
            String email = jwtService.extractUsername(token);
            if (email == null || email.isEmpty()) {

                return ResponseEntity.status(401).body(null);
            }
            if (jwtService.validateToken(token, email)) {
                Optional<User> existingUser = userRepository.findByEmail(email);
                if (existingUser.isPresent()) {
                    User user = existingUser.get();
                    List<PasswordEntry> passwordEntries = passwordEntryRepository.findByUser(user);
                    return ResponseEntity.ok(passwordEntries);
                } else {
                    return ResponseEntity.status(404).body(null);
                }
            } else {
                return ResponseEntity.status(401).body(null);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
    @PostMapping("/add")
    public ResponseEntity<String> addPassword(@RequestBody PasswordEntry passwordEntry, @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Ungültiger Authorization Header.");
        }

        String token = authHeader.replace("Bearer ", "");

        // E-Mail aus dem Token extrahieren
        String email = jwtService.extractUsername(token);
        if (email == null || email.isEmpty()) {
            return ResponseEntity.status(401).body("Ungültiges Token.");
        }

        // Token validieren
        if (jwtService.validateToken(token, email)) {
            // Benutzer mit der E-Mail aus der Datenbank laden
            Optional<User> user = userRepository.findByEmail(email);
            if (user.isPresent()) {
                // Setze den gefundenen User in das PasswordEntry
                passwordEntry.setUser(user.get());
                // Speichere das PasswordEntry

                passwordEntryRepository.save(passwordEntry);
                return ResponseEntity.ok("Passwort erfolgreich hinzugefügt.");
            } else {
                return ResponseEntity.status(404).body("Benutzer nicht gefunden.");
            }
        } else {
            return ResponseEntity.status(401).body("Ungültiges Token.");
        }
    }

}
