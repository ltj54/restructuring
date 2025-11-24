package io.ltj.restructuring.application.auth;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Profile("test")
public class MockOtpService extends OtpService {

    @Override
    public String generateCodeForUser(String userId) {
        String code = "123456";
        log.info("🧪 [Test] Mock engangskode for bruker {}: {}", userId, code);
        return code;
    }
}

