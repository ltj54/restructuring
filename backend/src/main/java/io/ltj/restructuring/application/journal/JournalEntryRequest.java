package io.ltj.restructuring.application.journal;

import lombok.Data;

@Data
public class JournalEntryRequest {
    private Integer phase;
    private String content;
}
