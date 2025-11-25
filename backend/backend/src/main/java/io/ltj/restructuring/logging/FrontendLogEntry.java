package io.ltj.restructuring.logging;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FrontendLogEntry(
        String context,
        String event,
        FrontendLogLevel level,
        String message,
        Map<String, Object> meta,
        FrontendLogError error,
        String timestamp
) {
    @Override
    public FrontendLogLevel level() {
        return level == null ? FrontendLogLevel.INFO : level;
    }

    @Override
    public Map<String, Object> meta() {
        return meta == null ? Map.of() : meta;
    }

    @Override
    public String message() {
        if (message != null && !message.isBlank()) {
            return message;
        }
        if (event != null && !event.isBlank()) {
            return event;
        }
        return "Frontend event";
    }
}
