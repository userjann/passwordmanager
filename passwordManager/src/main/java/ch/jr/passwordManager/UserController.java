package ch.jr.passwordManager;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public UserController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/register")
    public ResponseEntity<User> createUser(@RequestBody User user) throws URISyntaxException {
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); // Duplikat gefunden
        }
        User newUser = new User();
        newUser.setEmail(user.getEmail());
        newUser.setPassword(user.getPassword()); // Sicherstellen, dass das Passwort sicher gespeichert wird

        User savedUser = userRepository.save(newUser);
        return ResponseEntity.created(new URI("/users/" + savedUser.getId())).body(savedUser);
    }


    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestBody User user){
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        System.out.println("hallo");
        if(existingUser.isPresent()){
            User foundUser = existingUser.get();
            if(user.getPassword().equals(foundUser.getPassword())){
                String token = jwtService.generateToken(foundUser.getEmail());
                return ResponseEntity.ok(token);
            }else{
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("ungültiges Passwort");
            }
        }else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("user nicht gefunden");
        }
    }




}
