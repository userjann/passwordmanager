package ch.jr.passwordManager;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    private final String SECRET_KEY = "asdgasghoasguishfgisdhgsdhfohfoidhasdfhsifghisdhfis";
    // Token erstellen
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)  // Hier direkt die E-Mail als subject setzen!
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 Stunden
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Token validieren
    public boolean validateToken(String token, String email) {
        final String extractedEmail = extractUsername(token);
        return extractedEmail.equals(email) && !isTokenExpired(token);
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // Username aus Token extrahieren
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Ablaufdatum prüfen
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Ablaufdatum auslesen
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Allgemeine Methode für Claims
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Claims aus Token extrahieren
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
