package io.ltj.restructuring.application.exception;

import java.io.Serializable;

public class ResourceNotFoundException extends RuntimeException {

    private final String resourceName;
    private final Serializable identifier;

    public ResourceNotFoundException(String resourceName, Serializable identifier) {
        super(resourceName + " not found: " + identifier);
        this.resourceName = resourceName;
        this.identifier = identifier;
    }

    public String getResourceName() {
        return resourceName;
    }

    public Serializable getIdentifier() {
        return identifier;
    }
}
