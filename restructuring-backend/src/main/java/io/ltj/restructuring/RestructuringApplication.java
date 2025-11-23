package io.ltj.restructuring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "io.ltj.restructuring")
@EntityScan(basePackages = "io.ltj.restructuring")
public class RestructuringApplication {
    public static void main(String[] args) {
        SpringApplication.run(RestructuringApplication.class, args);
    }
}
