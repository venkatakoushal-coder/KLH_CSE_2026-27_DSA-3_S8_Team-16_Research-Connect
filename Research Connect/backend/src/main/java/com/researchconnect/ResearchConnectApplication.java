package com.researchconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Research Connect - Spring Boot Application Entry Point.
 * Algorithm-Based Research Paper Discovery and Analysis System.
 */
@SpringBootApplication
public class ResearchConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(ResearchConnectApplication.class, args);
        System.out.println("================================================================================");
        System.out.println("  RESEARCH CONNECT BACKEND RUNNING AT: http://localhost:8080");
        System.out.println("  REST APIs available at /api/papers, /api/search, /api/statistics, etc.");
        System.out.println("================================================================================");
    }
}
