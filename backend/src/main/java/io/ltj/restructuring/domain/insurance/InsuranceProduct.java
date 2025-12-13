package io.ltj.restructuring.domain.insurance;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "insurance_product")
public class InsuranceProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(name = "can_buy_privately")
    private Boolean canBuyPrivately;

    @ManyToOne(optional = false)
    @JoinColumn(name = "provider_id")
    private InsuranceProvider provider;

    @ManyToMany
    @JoinTable(
            name = "insurance_product_category",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<InsuranceCategory> categories = new HashSet<>();

    protected InsuranceProduct() {
        // JPA
    }

    public InsuranceProduct(
            String name,
            String description,
            Boolean canBuyPrivately,
            InsuranceProvider provider
    ) {
        this.name = name;
        this.description = description;
        this.canBuyPrivately = canBuyPrivately;
        this.provider = provider;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Boolean getCanBuyPrivately() {
        return canBuyPrivately;
    }

    public InsuranceProvider getProvider() {
        return provider;
    }

    public Set<InsuranceCategory> getCategories() {
        return categories;
    }
}
