package io.ltj.restructuring.domain.insurance;

import jakarta.persistence.*;

@Entity
@Table(name = "res_insurance_category")
public class InsuranceCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    protected InsuranceCategory() {
        // JPA
    }

    public InsuranceCategory(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}
