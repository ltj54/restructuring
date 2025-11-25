package io.ltj.restructuring.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class TimeConfig {

    @Bean
    public Clock systemClock() {
        return Clock.systemUTC();  // eller Clock.systemDefaultZone()
    }
}
