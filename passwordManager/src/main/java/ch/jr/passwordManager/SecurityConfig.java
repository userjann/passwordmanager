package ch.jr.passwordManager;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())  // CSRF deaktivieren, falls nicht benötigt
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/**").permitAll()  // Erlaubt den Zugriff auf alle URLs
                )
                .build();
    }


}
