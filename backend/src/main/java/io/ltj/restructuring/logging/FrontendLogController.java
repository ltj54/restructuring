package io.ltj.restructuring.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.spi.LoggingEventBuilder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/log")
public class FrontendLogController {

    private static final Logger log = LoggerFactory.getLogger(FrontendLogController.class);

    @PostMapping
    public void receiveFrontendLog(@RequestBody FrontendLogEntry payload) {
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
            builder.addKeyValue("meta", payload.meta());
        }
        addErrorDetails(payload.error(), builder);

        builder.log(payload.message());
    }

    private void addIfPresent(LoggingEventBuilder builder, String key, String value) {
        if (value != null && !value.isBlank()) {
            builder.addKeyValue(key, value);
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
