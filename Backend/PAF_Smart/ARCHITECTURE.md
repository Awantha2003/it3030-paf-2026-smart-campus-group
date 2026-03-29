# Backend Folder Architecture

Base package: `com.tech.spcours.paf_smart`

Use a simple MVC structure for the Spring Boot backend.

```text
src/main/java/com/tech/spcours/paf_smart
|-- config/         # Spring configuration
|-- controller/     # REST controllers
|-- dto/            # Request and response payloads
|-- service/        # Business logic
|-- repository/     # MongoDB repositories
|-- model/          # Domain and persistence models
|-- security/       # JWT, filters, auth utilities, security config
`-- exception/      # Custom exceptions and global handlers
```

## MVC Mapping

- `controller` = handles HTTP requests and responses
- `dto` = request and response data transfer objects
- `service` = contains business logic
- `repository` = talks to MongoDB
- `model` = entities / request-response models if kept simple
- `security` = authentication and authorization concerns
- `exception` = centralized error handling

## Request Flow

`Controller -> Service -> Repository -> MongoDB`

## Notes

- Keep controllers thin.
- Put validation close to request handling.
- Keep request and response classes in `dto`.
- Do not place database logic in controllers.
- Use `security` for JWT, filters, and auth logic.
- Use `config` for application-wide configuration such as CORS and bean setup.
- If the project grows a lot later, you can split MVC packages by feature.
