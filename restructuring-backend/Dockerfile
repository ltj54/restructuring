##############################################################
# 🏗️ Stage 1: Build the JAR (Maven + Java 21)
##############################################################
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /build

# 🔧 Installer CA-sertifikater (for Render og generelt HTTPS)
RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

# ❌ Fjernet feil settings.xml som tvinger HTTP (årsaken til feilen)
# Maven fungerer helt fint uten noen lokal settings.xml

COPY pom.xml .
COPY src ./src

RUN mvn -B clean package -DskipTests

##############################################################
# 🚀 Stage 2: Run the application
##############################################################
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /build/target/restructuring-backend-0.0.1-SNAPSHOT.jar /app/app.jar

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

# 🩺 Healthcheck (fungerer i Render)
HEALTHCHECK --interval=30s --timeout=5s --retries=5 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
