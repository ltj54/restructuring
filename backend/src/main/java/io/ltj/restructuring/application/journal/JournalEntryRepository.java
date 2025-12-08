package io.ltj.restructuring.application.journal;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    List<JournalEntry> findByUserIdOrderByCreatedAtDesc(Long userId);
}
