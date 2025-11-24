package io.ltj.restructuring.config;

import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    // Hentes automatisk fra application.properties / yml
    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Value("${app.version:1.0.0}")
    private String appVersion;

    @Bean
    public OpenAPI restructuringOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Restructuring API")
                        .description("Backend API for the restructuring project")
                        .version(appVersion + " (" + activeProfile + ")"));
    }
}
