package io.ltj.restructuring.application.journal;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class JournalService {

    private final JournalEntryRepository repository;

    public JournalEntry addEntry(JournalEntryRequest req, Long userId) {
        JournalEntry entry = JournalEntry.builder()
                .content(req.getContent())
                .phase(req.getPhase())
                .userId(userId)
                .createdAt(LocalDateTime.now())
                .build();

        return repository.save(entry);
    }

    public java.util.List<JournalEntry> getAll(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
