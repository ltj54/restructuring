package io.ltj.restructuring.api.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class OfferController {

    @PreAuthorize("isAuthenticated()")
    @GetMapping({"/offer", "/private/offer"})
    public Map<String, Object> getOffer() {
        return Map.of(
                "price", 299,
                "coverage", "Inntektstap ved omstilling (opptil 12 måneder)"
        );
    }
}

