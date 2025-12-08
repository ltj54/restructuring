package io.ltj.restructuring.application.journal;

import io.ltj.restructuring.application.auth.AuthUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/journal")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService service;

    @PostMapping
    public ResponseEntity<?> addJournalEntry(
            @RequestBody JournalEntryRequest req,
            @AuthUser Long userId
    ) {
        service.addEntry(req, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<JournalEntry>> getAll(@AuthUser Long userId) {
        return ResponseEntity.ok(service.getAll(userId));
    }
}
