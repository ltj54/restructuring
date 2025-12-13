package io.ltj.restructuring.domain.insurance;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_insurance_profile")
public class UserInsuranceProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Source source;

    @Column(name = "provider_name")
    private String providerName;

    @Column(name = "product_name")
    private String productName;

    @Column
    private String notes;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    protected UserInsuranceProfile() {
        // JPA only
    }

    public UserInsuranceProfile(
            Long userId,
            Source source,
            String providerName,
            String productName,
            String notes,
            LocalDate validFrom,
            LocalDate validTo
    ) {
        this.userId = userId;
        this.source = source;
        this.providerName = providerName;
        this.productName = productName;
        this.notes = notes;
        this.validFrom = validFrom;
        this.validTo = validTo;
        this.active = true;
    }

    // --------------------
    // Getters
    // --------------------

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Source getSource() {
        return source;
    }

    public String getProviderName() {
        return providerName;
    }

    public String getProductName() {
        return productName;
    }

    public String getNotes() {
        return notes;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDate getValidFrom() {
        return validFrom;
    }

    public LocalDate getValidTo() {
        return validTo;
    }

    // --------------------
    // Enum
    // --------------------

    public enum Source {
        EMPLOYER,
        PRIVATE,
        OTHER
    }
}
