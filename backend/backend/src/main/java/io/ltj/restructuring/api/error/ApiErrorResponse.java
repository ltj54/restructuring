package io.ltj.restructuring.api.error;

public record ApiErrorResponse(
        int status,
        String message
) {}
