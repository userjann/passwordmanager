

import org.owasp.validator.html.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.cors.CorsConfiguration;

import java.io.File;
import java.io.IOException;
import java.util.*;

@SpringBootApplication
public class PasswordManagerBeApplication {

	public static void main(String[] args) {
		SpringApplication.run(PasswordManagerBeApplication.class, args);
	}

	@RestController
	@RequestMapping("/api")
	public static class UserController {

		private static final String DATABASE_FILE = "password-manager-be/src/main/resources/database.json";
		private final ObjectMapper objectMapper = new ObjectMapper();

		// Login
		@PostMapping("/login")
		public Map<String, Object> login(@RequestBody Map<String, String> payload) {
			String email = payload.get("email");
			String masterPassword = payload.get("masterPassword");

			try {
				Map<String, Object> database = readDatabase();
				if (database.containsKey(email)) {
					Map<String, Object> userData = (Map<String, Object>) database.get(email);
					String storedPassword = (String) userData.get("password");

					if (storedPassword.equals(masterPassword)) {
						return Map.of("success", true);
					}
				}
				return Map.of("success", false, "message", "Invalid email or password");
			} catch (IOException e) {
				return Map.of("success", false, "message", "Error reading database");
			}
		}

		// Register
		@PostMapping("/register")
		public Map<String, Object> register(@RequestBody Map<String, Object> payload) {
			String email = (String) payload.get("email");
			String passwordHash = (String) payload.get("passwordHash");
			String salt = (String) payload.get("salt");
			Map<String, Object> data = (Map<String, Object>) payload.get("data");

			try {
				Map<String, Object> database = readDatabase();

				if (database.containsKey(email)) {
					return Map.of("success", false, "message", "Email already exists");
				}

				Map<String, Object> user = new HashMap<>();
				user.put("password", passwordHash);
				user.put("salt", salt);
				user.put("data", data);

				database.put(email, user);
				writeDatabase(database);

				return Map.of("success", true);
			} catch (IOException e) {
				return Map.of("success", false, "message", "Registration failed");
			}
		}

		// Add Password
		@PostMapping("/passwords/add")
		public Map<String, Object> addPassword(@RequestBody Map<String, Object> payload) {
			String email = (String) payload.get("email");
			Map<String, Object> newPassword = (Map<String, Object>) payload.get("newPassword");

			try {
				Map<String, Object> database = readDatabase();

				if (!database.containsKey(email)) {
					return Map.of("success", false, "message", "User not found");
				}

				Map<String, Object> userData = (Map<String, Object>) database.get(email);
				List<Map<String, Object>> passwords = (List<Map<String, Object>>) userData.get("data");

				passwords.add(newPassword);
				writeDatabase(database);

				return Map.of("success", true);
			} catch (IOException e) {
				return Map.of("success", false, "message", "Failed to add password");
			}
		}

		// Retrieve Passwords
		@GetMapping("/passwords/retrieve")
		public Map<String, Object> retrievePasswords(@RequestParam String email) {
			try {
				Map<String, Object> database = readDatabase();

				if (database.containsKey(email)) {
					Map<String, Object> userData = (Map<String, Object>) database.get(email);
					return Map.of("success", true, "data", userData.get("data"));
				}

				return Map.of("success", false, "message", "User not found");
			} catch (IOException e) {
				return Map.of("success", false, "message", "Failed to retrieve passwords");
			}
		}

		// Delete Password by Platform
		@DeleteMapping("/passwords/delete/platform/{platform}")
		public Map<String, Object> deletePasswordByPlatform(@PathVariable String platform, @RequestBody Map<String, String> payload) {
			String email = payload.get("email");

			try {
				Map<String, Object> database = readDatabase();

				if (database.containsKey(email)) {
					Map<String, Object> userData = (Map<String, Object>) database.get(email);
					List<Map<String, Object>> passwords = (List<Map<String, Object>>) userData.get("data");

					boolean removed = passwords.removeIf(password -> platform.equals(password.get("platform")));

					if (removed) {
						writeDatabase(database);
						return Map.of("success", true);
					} else {
						return Map.of("success", false, "message", "Platform not found");
					}
				}

				return Map.of("success", false, "message", "User not found");
			} catch (IOException e) {
				return Map.of("success", false, "message", "Failed to delete password");
			}
		}

		private Map<String, Object> readDatabase() throws IOException {
			File file = new File(DATABASE_FILE);
			if (!file.exists()) {
				return new HashMap<>();
			}
			return objectMapper.readValue(file, Map.class);
		}

		private void writeDatabase(Map<String, Object> database) throws IOException {
			objectMapper.writeValue(new File(DATABASE_FILE), database);
		}
	}

	@Configuration
	public static class SecurityConfig {

		@Bean
		public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
			http
					.csrf(csrf -> csrf.disable())
					.cors(cors -> cors.configurationSource(request -> {
						var config = new CorsConfiguration();
						config.setAllowedOrigins(List.of("http://localhost:3000"));
						config.setAllowedMethods(List.of("*"));
						config.setAllowedHeaders(List.of("*"));
						config.setAllowCredentials(true);
						return config;
					}))
					.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
			return http.build();
		}
	}
}
