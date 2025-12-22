package io.ltj.restructuring.domain.insurance;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "insurance_request")
public class InsuranceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InsuranceRequestStatus status;

    @Column(columnDefinition = "text")
    private String xmlContent;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime submittedAt;

    protected InsuranceRequest() {
        // JPA
    }

    public static InsuranceRequest submitted(
            Long userId,
            LocalDateTime submittedAt,
            String xmlContent
    ) {
        InsuranceRequest request = new InsuranceRequest();
        request.userId = userId;
        request.status = InsuranceRequestStatus.SENT; // eksisterende enum
        request.createdAt = LocalDateTime.now();
        request.submittedAt = submittedAt;
        request.xmlContent = xmlContent;
        return request;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public InsuranceRequestStatus getStatus() {
        return status;
    }

    public String getXmlContent() {
        return xmlContent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
}
