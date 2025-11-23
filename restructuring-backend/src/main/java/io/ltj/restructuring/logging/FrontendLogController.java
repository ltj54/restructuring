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

        if (payload.context() != null && !payload.context().isBlank()) {
            builder.addKeyValue("context", payload.context());
        }
        if (payload.event() != null && !payload.event().isBlank()) {
            builder.addKeyValue("event", payload.event());
        }
        if (payload.timestamp() != null && !payload.timestamp().isBlank()) {
            builder.addKeyValue("timestamp", payload.timestamp());
        }
        if (!payload.meta().isEmpty()) {
            builder.addKeyValue("meta", payload.meta());
        }
        if (payload.error() != null) {
            FrontendLogError error = payload.error();
            if (error.message() != null && !error.message().isBlank()) {
                builder.addKeyValue("errorMessage", error.message());
            }
            if (error.name() != null && !error.name().isBlank()) {
                builder.addKeyValue("errorName", error.name());
            }
            if (error.stack() != null && !error.stack().isBlank()) {
                builder.addKeyValue("errorStack", error.stack());
            }
        }

        builder.log(payload.message());
    }
}
