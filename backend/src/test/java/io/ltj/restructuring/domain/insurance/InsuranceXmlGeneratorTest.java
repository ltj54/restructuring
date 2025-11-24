package io.ltj.restructuring.domain.insurance;

import io.ltj.restructuring.domain.user.UserEntity;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

class InsuranceXmlGeneratorTest {

    private static final Instant FIXED_INSTANT = Instant.parse("2024-01-15T10:15:30Z");
    private static final Clock FIXED_CLOCK = Clock.fixed(FIXED_INSTANT, ZoneOffset.UTC);

    private final InsuranceXmlGenerator generator = new InsuranceXmlGenerator(FIXED_CLOCK);

    @Test
    void generatesXmlWithAllUserFields() {
        UserEntity user = new UserEntity("john.doe@example.com", "password");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setSsn("12345678901");

        String xml = generator.generate(user);

        assertThat(xml).isEqualTo("""
                <InsuranceRequest>
                    <User>
                        <FirstName>John</FirstName>
                        <LastName>Doe</LastName>
                        <SSN>12345678901</SSN>
                    </User>
                    <Timestamp>2024-01-15T10:15:30</Timestamp>
                </InsuranceRequest>
                """);
    }

    @Test
    void replacesNullUserFieldsWithEmptyStrings() {
        UserEntity user = new UserEntity("jane.doe@example.com", "password");
        user.setFirstName(null);
        user.setLastName(null);
        user.setSsn(null);

        String xml = generator.generate(user);

        assertThat(xml).isEqualTo("""
                <InsuranceRequest>
                    <User>
                        <FirstName></FirstName>
                        <LastName></LastName>
                        <SSN></SSN>
                    </User>
                    <Timestamp>2024-01-15T10:15:30</Timestamp>
                </InsuranceRequest>
                """);
    }
}
