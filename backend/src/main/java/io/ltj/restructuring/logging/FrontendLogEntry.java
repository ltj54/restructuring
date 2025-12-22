package io.ltj.restructuring.logging;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FrontendLogEntry(
        @Size(max = 200) String context,
        @Size(max = 200) String event,
        @NotNull FrontendLogLevel level,
        @Size(max = 2000) String message,
        @Size(max = 50) Map<String, Object> meta,
        FrontendLogError error,
        @Size(max = 64) String timestamp
) {
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
