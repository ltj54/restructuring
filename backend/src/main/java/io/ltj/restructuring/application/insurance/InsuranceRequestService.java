package io.ltj.restructuring.application.insurance;

import io.ltj.restructuring.application.exception.ResourceNotFoundException;
import io.ltj.restructuring.domain.insurance.InsuranceRequest;
import io.ltj.restructuring.domain.insurance.InsuranceRequestRepository;
import io.ltj.restructuring.domain.insurance.InsuranceXmlGenerator;
import io.ltj.restructuring.domain.user.UserEntity;
import io.ltj.restructuring.domain.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDateTime;

@Service
public class InsuranceRequestService {

    private static final Logger log = LoggerFactory.getLogger(InsuranceRequestService.class);

    private final UserRepository userRepository;
    private final InsuranceRequestRepository insuranceRequestRepository;
    private final InsuranceXmlGenerator insuranceXmlGenerator;
    private final Clock clock;

    public InsuranceRequestService(UserRepository userRepository,
                                   InsuranceRequestRepository insuranceRequestRepository,
                                   InsuranceXmlGenerator insuranceXmlGenerator,
                                   Clock clock) {
        this.userRepository = userRepository;
        this.insuranceRequestRepository = insuranceRequestRepository;
        this.insuranceXmlGenerator = insuranceXmlGenerator;
        this.clock = clock;
    }

    public InsuranceRequest createInsuranceRequest(Long userId) {
        // 1) Finn bruker
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // 2) Generer XML basert på brukerinfo
        String xml = insuranceXmlGenerator.generate(user);

        // 3) Opprett domain-objekt
        LocalDateTime now = LocalDateTime.now(clock);
        InsuranceRequest request = InsuranceRequest.submitted(
                userId,
                now,
                xml
        );

        // 4) Lagre og logge
        InsuranceRequest saved = insuranceRequestRepository.save(request);

        log.atDebug()
                .addKeyValue("requestId", saved.getId())
                .addKeyValue("userId", saved.getUserId())
                .log("Persisted insurance request");

        return saved;
    }
}
