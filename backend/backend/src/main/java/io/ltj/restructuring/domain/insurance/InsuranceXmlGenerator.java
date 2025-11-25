package io.ltj.restructuring.domain.insurance;

import io.ltj.restructuring.domain.user.UserEntity;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

@Component
public class InsuranceXmlGenerator {

    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final String XML_TEMPLATE = """
            <InsuranceRequest>
                <User>
                    <FirstName>%s</FirstName>
                    <LastName>%s</LastName>
                    <SSN>%s</SSN>
                </User>
                <Timestamp>%s</Timestamp>
            </InsuranceRequest>
            """;

    private final Clock clock;

    public InsuranceXmlGenerator(Clock clock) {
        this.clock = clock;
    }

    public String generate(UserEntity user) {
        Objects.requireNonNull(user, "user must not be null");

        String firstName = sanitize(user.getFirstName());
        String lastName = sanitize(user.getLastName());
        String ssn = sanitize(user.getSsn());
        String timestamp = LocalDateTime.now(clock).format(TIMESTAMP_FORMATTER);

        return XML_TEMPLATE.formatted(firstName, lastName, ssn, timestamp);
    }

    private static String sanitize(String value) {
        return value == null ? "" : value;
    }
}
