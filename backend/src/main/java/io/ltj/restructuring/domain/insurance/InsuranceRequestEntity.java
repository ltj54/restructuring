package io.ltj.restructuring.domain.insurance;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "insurance_request")
public class InsuranceRequestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String firstName;
    private String lastName;
    private String ssn;
    private String phone;

    private String source;

    @Column(length = 255)
    private String products;

    @Column(columnDefinition = "text")
    private String generatedText;

    private LocalDateTime createdAt = LocalDateTime.now();
}
