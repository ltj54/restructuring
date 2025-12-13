package io.ltj.restructuring.domain.insurance;

import jakarta.persistence.*;

@Entity
@Table(name = "insurance_provider")
public class InsuranceProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column
    private String website;

    protected InsuranceProvider() {
        // JPA
    }

    public InsuranceProvider(String name, String website) {
        this.name = name;
        this.website = website;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getWebsite() {
        return website;
    }
}
