package ch.jr.passwordmanager;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordRepository extends JpaRepository<PasswordEntry, Long> {
}
