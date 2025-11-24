package io.ltj.restructuring.application.auth;

import org.springframework.stereotype.Service;

@Service
public class OtpService {

    public String generateCodeForUser(String userId) {
        // Genererer en tilfeldig 6-sifret kode
        return String.format("%06d", (int) (Math.random() * 1_000_000));
    }
}

