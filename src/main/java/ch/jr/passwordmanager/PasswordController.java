package ch.jr.passwordmanager;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/passwords")
public class PasswordController {

    private final PasswordRepository repository;

    public PasswordController(PasswordRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public PasswordEntry addPassword(@RequestBody PasswordEntry entry) {
        // Verschlüsselung des Passworts
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        entry.setPassword(encoder.encode(entry.getPassword()));

        // Speichern des verschlüsselten Passworts
        return repository.save(entry);
    }

    @GetMapping
    public List<PasswordEntry> getPasswords() {
        return repository.findAll();
    }
}
