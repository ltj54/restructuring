package io.ltj.restructuring.logging;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.spi.LoggingEventBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/log")
public class FrontendLogController {

    private static final Logger log = LoggerFactory.getLogger(FrontendLogController.class);

    private static final int MAX_MESSAGE_LEN = 2000;
    private static final int MAX_VALUE_LEN = 500;
    private static final int MAX_META_ENTRIES = 25;

    @PostMapping
    public void receiveFrontendLog(@Valid @RequestBody FrontendLogEntry payload) {

        // Basic abuse guardrails (still consider rate limiting at the edge)
        if (payload.meta() != null && payload.meta().size() > MAX_META_ENTRIES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "meta has too many entries");
        }

        LoggingEventBuilder builder = switch (payload.level()) {
            case ERROR -> log.atError();
            case WARN -> log.atWarn();
            case INFO -> log.atInfo();
        };

        builder.addKeyValue("source", "frontend");
        addIfPresent(builder, "context", payload.context());
        addIfPresent(builder, "event", payload.event());
        addIfPresent(builder, "timestamp", payload.timestamp());

        if (!payload.meta().isEmpty()) {
            // Avoid logging unbounded objects; log only a safe representation
            builder.addKeyValue("meta", safeMeta(payload.meta()));
        }

        addErrorDetails(payload.error(), builder);

        builder.log(sanitize(payload.message(), MAX_MESSAGE_LEN));
    }

    private Map<String, String> safeMeta(Map<String, Object> meta) {
        // Convert values to safe, bounded strings
        return meta.entrySet().stream().collect(java.util.stream.Collectors.toMap(
                Map.Entry::getKey,
                e -> sanitize(String.valueOf(e.getValue()), MAX_VALUE_LEN),
                (a, b) -> a,
                java.util.LinkedHashMap::new
        ));
    }

    private String sanitize(String value, int maxLen) {
        if (value == null) return null;
        String v = value.replace('\r', ' ').replace('\n', ' ').trim();
        if (v.length() > maxLen) {
            return v.substring(0, maxLen) + "...";
        }
        return v;
    }

    private void addIfPresent(LoggingEventBuilder builder, String key, String value) {
        String safe = sanitize(value, MAX_VALUE_LEN);
        if (safe != null && !safe.isBlank()) {
            builder.addKeyValue(key, safe);
        }
    }

    private void addErrorDetails(FrontendLogError error, LoggingEventBuilder builder) {
        if (error == null) {
            return;
        }
        addIfPresent(builder, "errorMessage", error.message());
        addIfPresent(builder, "errorName", error.name());
        addIfPresent(builder, "errorStack", error.stack());
    }
}
