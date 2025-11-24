package io.ltj.restructuring.logging;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FrontendLogError(
        String message,
        String name,
        String stack
) {
}
