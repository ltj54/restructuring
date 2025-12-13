package io.ltj.restructuring.application.auth;

/**
 * Thrown when login credentials are invalid.
 * Deliberately vague for security reasons.
 */
public class InvalidLoginException extends RuntimeException {

    public InvalidLoginException() {
        super("Invalid email or password");
    }
}
