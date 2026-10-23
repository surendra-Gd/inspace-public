# Stage 1: Runtime Stage
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the pre-built JAR file from the builder stage
COPY  /target/backend-demo-0.0.1-SNAPSHOT.jar /app/inspace-app.jar

# Clean up unnecessary build files in the final image
RUN rm -rf /app/target /app/.m2

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "/app/inspace-app.jar"]

# Expose the application port (Spring Boot default is 8080)
EXPOSE 8080
