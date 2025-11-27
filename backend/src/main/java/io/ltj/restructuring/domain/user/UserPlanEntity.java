package io.ltj.restructuring.domain.user;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

@Entity
@Table(name = "user_plans", indexes = {
        @Index(name = "ux_user_plans_user_id", columnList = "user_id", unique = true)
})
public class UserPlanEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "phase", length = 50, nullable = false)
    private String phase;

    @Column(name = "persona", length = 200)
    private String persona;

    /**
     * Komma-separert liste over behov slik frontend lagrer det.
     */
    @Column(name = "needs")
    private String needs;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR) // Force Hibernate to use TEXT instead of OID/LOB
    @Column(name = "diary", columnDefinition = "TEXT")
    private String diary;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected UserPlanEntity() {
        // JPA
    }

    public UserPlanEntity(Long userId, String phase, String persona, String needs, String diary) {
        this.userId = userId;
        this.phase = phase;
        this.persona = persona;
        this.needs = needs;
        this.diary = diary;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPhase() {
        return phase;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    public String getPersona() {
        return persona;
    }

    public void setPersona(String persona) {
        this.persona = persona;
    }

    public String getNeeds() {
        return needs;
    }

    public void setNeeds(String needs) {
        this.needs = needs;
    }

    public String getDiary() {
        return diary;
    }

    public void setDiary(String diary) {
        this.diary = diary;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}

