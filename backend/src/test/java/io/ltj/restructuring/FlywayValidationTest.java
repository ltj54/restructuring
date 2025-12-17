package io.ltj.restructuring;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

/**
 * Verifiserer at Flyway-migrasjonene er konsistente og kan valideres
 * UTEN å starte Spring Boot / JPA / Web.
 * <p>
 * Dette er bevisst gjort uten @SpringBootTest.
 */
class FlywayValidationTest {

    @Test
    void flywayMigrationsAreValid() {
        var dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.h2.Driver");
        dataSource.setUrl(
                "jdbc:h2:mem:flyway_validate;" +
                        "MODE=PostgreSQL;" +
                        "DATABASE_TO_LOWER=TRUE;" +
                        "DEFAULT_NULL_ORDERING=HIGH"
        );
        dataSource.setUsername("sa");
        dataSource.setPassword("");

        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:migration")
                .ignoreMigrationPatterns("*:pending")
                .validateOnMigrate(true)
                .load();

        // Validate migrations without executing them (H2 cannot run all PostgreSQL-specific SQL).
        flyway.validate();
    }
}
