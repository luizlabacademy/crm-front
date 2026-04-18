# Mock Guidelines

This guide defines when and how to use mocks for API endpoints in the frontend.

## When to Use Mocks

Mocks should be used **only when a corresponding endpoint is not available** in the live API.

**Decision flow:**
1. Check the API documentation at https://api-crm.luizlab.com/v3/api-docs
2. If an endpoint exists and meets the feature requirements → **use the live API** (via TanStack Query hooks)
3. If no endpoint exists → **create a mock** following these guidelines

## Mock File Organization

All mocks must be stored in `/src/mocks/`.

Each route gets its own JSON file with the following naming convention:

```
<METHOD>-<ENTITY>-<REST-OF-ROUTE>.json
```

**Naming rules:**
- `<METHOD>`: HTTP method in uppercase (`GET`, `POST`, `PUT`, `DELETE`)
- `<ENTITY>`: the resource entity name (e.g., `workers`, `customers`, `leads`)
- `<REST-OF-ROUTE>`: remaining route path, replacing `/` with `--`

**Examples:**
- `GET /api/v1/workers` → `GET-workers.json`
- `GET /api/v1/workers/{id}` → `GET-workers--{id}.json`
- `POST /api/v1/workers` → `POST-workers.json`
- `PUT /api/v1/customers/{id}/profile` → `PUT-customers--{id}--profile.json`
- `DELETE /api/v1/leads/{id}` → `DELETE-leads--{id}.json`

## Mock File Format

Every mock file must follow this JSON structure:

### Single Resource Response (non-list)

```json
{
  "method": "GET",
  "route": "/api/v1/workers/{id}",
  "requestBody": "",
  "responseBody": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "active": true
  }
}
```

### List Response (paginated)

```json
{
  "method": "GET",
  "route": "/api/v1/workers",
  "requestBody": "",
  "responseBody": {
    "content": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "active": true
      },
      {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "active": true
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 2,
    "totalPages": 1
  }
}
```

### CREATE (POST) Request

```json
{
  "method": "POST",
  "route": "/api/v1/workers",
  "requestBody": {
    "name": "Jane Smith",
    "email": "jane@example.com"
  },
  "responseBody": {
    "id": 3,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "active": true
  }
}
```

### UPDATE (PUT) Request

```json
{
  "method": "PUT",
  "route": "/api/v1/workers/{id}",
  "requestBody": {
    "name": "Jane Smith Updated",
    "email": "jane.updated@example.com"
  },
  "responseBody": {
    "id": 1,
    "name": "Jane Smith Updated",
    "email": "jane.updated@example.com",
    "active": true
  }
}
```

## Key Conventions

- **Request Body**: Follow REST conventions. For list endpoints (GET), `requestBody` should be an empty string `""`.
- **Response Body**: Always match the actual API contract structure (field names, types, nesting).
- **Pagination**: List responses must include `page`, `size`, `totalElements`, and `totalPages`.
- **Monetary Values**: Use centavos (int64), matching backend API behavior.
- **Dates**: Use ISO 8601 format with timezone.
- **Null/Optional Fields**: Include in mock if the API contract allows them.

## Using Mocks in Components

Mocks are consumed via TanStack Query hooks in the feature's `api/` folder. The mock structure defined here enables:
- Hook implementations to return mock data when the live endpoint is unavailable
- Consistent serialization/deserialization across the frontend
- Easy migration from mock to live API without changing component code

Always import hooks from `@/features/<feature>/api`, never fetch mocks directly.

---

**Remember:** Mocks are a temporary measure. Once the backend provides the endpoint, replace the mock with the live API call.
