package io.ltj.restructuring.domain.insurance;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "insurance_request")
@Getter
@Setter
public class InsuranceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private InsuranceRequestStatus status;

    @Lob
    @Column(name = "xml_content", columnDefinition = "TEXT", nullable = false)
    private String xmlContent;

    public static InsuranceRequest submitted(Long userId, LocalDateTime createdAt, String xmlContent) {
        InsuranceRequest request = new InsuranceRequest();
        request.setUserId(userId);
        request.setCreatedAt(createdAt);
        request.setStatus(InsuranceRequestStatus.SENT);
        request.setXmlContent(xmlContent);
        return request;
    }

    @PrePersist
    void ensureAuditFields() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = InsuranceRequestStatus.SENT;
        }
    }
}
