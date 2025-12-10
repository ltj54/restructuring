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

# 🛠 Installer verktøy som brukes i HEALTHCHECK (curl mangler i base-image)
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /build/target/restructuring-backend-0.0.1-SNAPSHOT.jar /app/app.jar

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

# 🩺 Healthcheck (bruk liveness-endepunktet som ikke feiler selv om databasen er treg)
# - start-period gir applikasjonen tid til å starte før første sjekk
# - flere retries gjør at treg oppstart ikke markerer containeren som "unhealthy"
HEALTHCHECK \
  --interval=30s \
  --timeout=5s \
  --retries=10 \
  --start-period=120s \
  CMD ["/bin/sh", "-c", "PORT=${PORT:-8080}; curl --silent --show-error --fail --max-time 5 http://localhost:${PORT}/actuator/health/liveness || exit 1"]

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
