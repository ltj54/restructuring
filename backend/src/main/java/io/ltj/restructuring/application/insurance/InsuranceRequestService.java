package io.ltj.restructuring.application.insurance;

import io.ltj.restructuring.application.exception.ResourceNotFoundException;
import io.ltj.restructuring.domain.insurance.InsuranceRequest;
import io.ltj.restructuring.domain.insurance.InsuranceRequestRepository;
import io.ltj.restructuring.domain.insurance.InsuranceXmlGenerator;
import io.ltj.restructuring.domain.user.UserEntity;
import io.ltj.restructuring.domain.user.UserRepository;
import java.time.Clock;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class InsuranceRequestService {

    private static final Logger log = LoggerFactory.getLogger(InsuranceRequestService.class);

    private final UserRepository userRepository;
    private final InsuranceRequestRepository insuranceRequestRepository;
    private final InsuranceXmlGenerator insuranceXmlGenerator;
    private final Clock clock;

    public InsuranceRequestService(
            UserRepository userRepository,
            InsuranceRequestRepository insuranceRequestRepository,
            InsuranceXmlGenerator insuranceXmlGenerator,
            Clock clock
    ) {
        this.userRepository = userRepository;
        this.insuranceRequestRepository = insuranceRequestRepository;
        this.insuranceXmlGenerator = insuranceXmlGenerator;
        this.clock = clock;
    }

    /**
     * Oppretter en ny InsuranceRequest for gitt bruker:
     *  1) Slår opp bruker
     *  2) Genererer XML basert på bruker
     *  3) Bygger domenemodellen med factory-metoden InsuranceRequest.submitted(...)
     *  4) Lagrer og logger resultatet
     */
    public InsuranceRequest createInsuranceRequest(Long userId) {
        log.atDebug()
                .addKeyValue("userId", userId)
                .log("Creating insurance request");

        // 1) Finn bruker
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // 2) Generer XML basert på brukerinfo
        String xml = insuranceXmlGenerator.generate(user);

        // 3) Sett tidspunkt via Clock (lett å teste)
        LocalDateTime now = LocalDateTime.now(clock);

        // 4) Bygg domenemodell via factory-metoden
        InsuranceRequest request = InsuranceRequest.submitted(
                user.getId(),
                now,
                xml
        );

        // 5) Lagre og logge
        InsuranceRequest saved = insuranceRequestRepository.save(request);

        log.atDebug()
                .addKeyValue("requestId", saved.getId())
                .addKeyValue("userId", saved.getUserId())
                .log("Persisted insurance request");

        return saved;
    }
}
