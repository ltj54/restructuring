@echo off
REM Start Spring Boot backend via mvnw
cd /d "%~dp0..\backend"
call mvnw spring-boot:run
