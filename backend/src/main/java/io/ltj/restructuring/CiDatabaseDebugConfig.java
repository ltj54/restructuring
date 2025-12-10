package io.ltj.restructuring;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("ci") // <-- slik logger KUN i GitHub Actions, ikke i prod/dev lokalt
public class CiDatabaseDebugConfig {

    @Value("${spring.datasource.url:NOT_SET}")
    private String url;

    @Value("${spring.datasource.username:NOT_SET}")
    private String user;

    @PostConstruct
    public void logCiDbConfig() {
        System.out.println("===== CI DATABASE CONFIG =====");
        System.out.println("spring.datasource.url     = " + url);
        System.out.println("spring.datasource.username= " + user);
        System.out.println("================================");
    }
}
