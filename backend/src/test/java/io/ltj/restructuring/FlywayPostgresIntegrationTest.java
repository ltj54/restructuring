package io.ltj.restructuring;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Locale;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Runs Flyway migrations against a real PostgreSQL instance.
 * Enabled only when -Dit.postgres=true is set.
 */
@EnabledIfSystemProperty(named = "it.postgres", matches = "true")
class FlywayPostgresIntegrationTest {

    private static volatile String dockerHost;

    static {
        configureDockerHostForWindows();
    }

    @Test
    void flywayMigrationsRunOnPostgres() {
        configureDockerHostForWindows();
        Assumptions.assumeTrue(isDockerAvailable(), "Docker is not available.");

        try (PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18-alpine")
                .withDatabaseName("restructuring_test")
                .withUsername("restructuring")
                .withPassword("restructuring")) {
            try {
                postgres.start();
            } catch (RuntimeException ex) {
                Assumptions.assumeTrue(false, "Docker not reachable: " + ex.getMessage());
            }

            Flyway flyway = Flyway.configure()
                    .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                    .locations("classpath:migration")
                    .validateOnMigrate(true)
                    .load();

            flyway.migrate();
        }
    }

    private static void configureDockerHostForWindows() {
        String osName = System.getProperty("os.name", "").toLowerCase(Locale.ROOT);
        if (!osName.contains("win")) {
            return;
        }

        if (hasValue(System.getenv("DOCKER_HOST")) || hasValue(System.getProperty("docker.host"))) {
            return;
        }

        String host = resolveDockerHost();
        if (host == null) {
            host = "npipe:////./pipe/dockerDesktopLinuxEngine";
        }
        dockerHost = host;
        System.setProperty("DOCKER_HOST", host);
        System.setProperty("docker.host", host);
        System.setProperty("docker.client.strategy",
                "org.testcontainers.dockerclient.EnvironmentAndSystemPropertyClientProviderStrategy");
    }

    private static String resolveDockerHost() {
        String cliHost = resolveDockerHostFromCli();
        if (hasValue(cliHost)) {
            return cliHost;
        }

        String labelHost = resolveDockerHostFromInfoLabel();
        if (hasValue(labelHost)) {
            return labelHost;
        }

        String context = System.getenv("DOCKER_CONTEXT");
        if (context != null) {
            if ("desktop-linux".equalsIgnoreCase(context)) {
                return "npipe:////./pipe/dockerDesktopLinuxEngine";
            }
            if ("default".equalsIgnoreCase(context)) {
                return "npipe:////./pipe/docker_engine";
            }
        }

        if (hasPipe("\\\\.\\pipe\\dockerDesktopLinuxEngine")) {
            return "npipe:////./pipe/dockerDesktopLinuxEngine";
        }
        if (hasPipe("\\\\.\\pipe\\docker_engine")) {
            return "npipe:////./pipe/docker_engine";
        }
        if (hasPipe("\\\\.\\pipe\\docker_cli")) {
            return "npipe:////./pipe/docker_cli";
        }
        return null;
    }

    private static String resolveDockerHostFromCli() {
        String context = runCommand("docker", "context", "show");
        if (!hasValue(context)) {
            return null;
        }

        String host = runCommand("docker", "context", "inspect", context.trim(),
                "--format", "{{.Endpoints.docker.Host}}");
        if (hasValue(host)) {
            return host.trim();
        }
        return null;
    }

    private static String resolveDockerHostFromInfoLabel() {
        String label = runCommand("docker", "info", "--format",
                "{{ index .Labels \"com.docker.desktop.address\" }}");
        if (!hasValue(label)) {
            return null;
        }
        return normalizeDockerHost(label.trim());
    }

    private static boolean isDockerAvailable() {
        String host = dockerHost;
        String version = host == null
                ? runCommand("docker", "version", "--format", "{{.Server.Version}}")
                : runCommand("docker", "--host", host, "version", "--format", "{{.Server.Version}}");
        return hasValue(version);
    }

    private static String normalizeDockerHost(String host) {
        if (host.startsWith("npipe:////./pipe/")) {
            return host;
        }
        String normalized = host;
        normalized = normalized.replace("npipe://\\\\.\\pipe\\", "npipe:////./pipe/");
        normalized = normalized.replace("npipe://\\./pipe/", "npipe:////./pipe/");
        normalized = normalized.replace("npipe://./pipe/", "npipe:////./pipe/");
        return normalized;
    }

    private static String runCommand(String... command) {
        try {
            Process process = new ProcessBuilder(command)
                    .redirectErrorStream(true)
                    .start();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line = reader.readLine();
                int exitCode = process.waitFor();
                return exitCode == 0 ? line : null;
            }
        } catch (Exception ignored) {
            return null;
        }
    }

    private static boolean hasPipe(String pipePath) {
        try {
            return Files.exists(Paths.get(pipePath));
        } catch (Exception ignored) {
            return false;
        }
    }

    private static boolean hasValue(String value) {
        return value != null && !value.isBlank();
    }
}
