package io.ltj.restructuring.application.system;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
public class SystemInfoAdminController {

    private final JdbcTemplate jdbcTemplate;

    public SystemInfoAdminController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Health-check for backend.
     * Brukes av SystemInfoPage.tsx → `${API_BASE_URL}/health`
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(
                Map.of(
                        "status", "OK",
                        "timestamp", OffsetDateTime.now().toString()
                )
        );
    }

    /**
     * DB-info / ping mot databasen.
     * Brukes av SystemInfoPage.tsx → `${API_BASE_URL}/dbinfo`
     * <p>
     * Returnerer plain text.
     */
    @GetMapping("/dbinfo")
    public ResponseEntity<String> dbInfo() {
        try {
            String result = jdbcTemplate.queryForObject(
                    "select version()",
                    String.class
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Kunne ikke hente DB-info: " + e.getMessage());
        }
    }

    /**
     * Wrapper rundt Postgres-funksjonen:
     * get_user_profile(user_id) -> json
     * <p>
     * UENDRET.
     */
    @GetMapping("/user-profile/{userId}")
    public ResponseEntity<String> getUserProfile(@PathVariable long userId) {
        String sql = "SELECT get_user_profile(?)";
        String json = jdbcTemplate.queryForObject(sql, String.class, userId);
        return ResponseEntity.ok(json);
    }

    /**
     * Returnerer en enkel liste over brukere med utvalgte felter.
     * Brukes av SystemInfoPage.tsx -> `${API_BASE_URL}/system/users`
     */
    @GetMapping("/users")
    public ResponseEntity<?> listUsers(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "50") int limit
    ) {
        int safeOffset = Math.max(0, offset);
        int safeLimit = Math.max(1, Math.min(200, limit)); // begrens hvor mye som kan hentes

        try {
            long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Long.class);

            List<Map<String, Object>> users = jdbcTemplate.queryForList(
                    "SELECT id, email, first_name, last_name, ssn " +
                            "FROM users " +
                            "ORDER BY id " +
                            "LIMIT ? OFFSET ?",
                    safeLimit + 1, // hent ett ekstra for å se om det finnes flere
                    safeOffset
            );

            boolean hasMore = users.size() > safeLimit;
            if (hasMore) {
                users = users.subList(0, safeLimit);
            }

            return ResponseEntity.ok(
                    Map.of(
                            "offset", safeOffset,
                            "limit", safeLimit,
                            "total", total,
                            "hasMore", hasMore,
                            "users", users
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Kunne ikke hente brukere: " + e.getMessage()));
        }
    }
}
