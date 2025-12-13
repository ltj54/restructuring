package io.ltj.restructuring.domain.insurance;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.Set;

@Entity
@Table(name = "insurance_snapshot")
public class InsuranceSnapshotEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InsuranceSource source;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "insurance_snapshot_types",
            joinColumns = @JoinColumn(name = "snapshot_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private Set<InsuranceType> types;

    @Column(nullable = false)
    private boolean uncertain;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    protected InsuranceSnapshotEntity() {
    }

    public InsuranceSnapshotEntity(
            Long userId,
            InsuranceSource source,
            Set<InsuranceType> types,
            boolean uncertain
    ) {
        this.userId = userId;
        this.source = source;
        this.types = types;
        this.uncertain = uncertain;
    }

    // getters

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public InsuranceSource getSource() {
        return source;
    }

    public Set<InsuranceType> getTypes() {
        return types;
    }

    public boolean isUncertain() {
        return uncertain;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
