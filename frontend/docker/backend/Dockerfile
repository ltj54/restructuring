# Backend Dockerfile (multi-stage) - uses JDK 21
# Build stage
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /workspace

# Copy maven wrapper and pom to cache dependencies
COPY pom.xml mvnw* ./
COPY .mvn .mvn

# Install maven and build (will download dependencies)
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Copy the rest of the source and build
COPY src ./src
RUN mvn -B -U -DskipTests package

# Runtime stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /workspace/target/*.jar ./app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
