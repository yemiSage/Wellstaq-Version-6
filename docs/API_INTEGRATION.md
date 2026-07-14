# Wellstaq API Integration Contract

The web app has two explicit data modes:

- `NEXT_PUBLIC_DATA_SOURCE=mock`: local preview using seeded data.
- `NEXT_PUBLIC_DATA_SOURCE=api`: production mode using the backend through the same-origin BFF route.

Set `BACKEND_API_URL` only on the Next.js server. Browser code calls `/api/backend/*`; it never receives the backend base URL, access token, refresh token, or Gemini key.

## Response Envelope

Successful JSON responses may use either a direct payload or this preferred envelope:

```json
{
  "data": {},
  "meta": {}
}
```

Errors must return a non-2xx status and:

```json
{
  "message": "Human-readable message",
  "code": "STABLE_ERROR_CODE",
  "fieldErrors": {
    "email": ["Email is invalid"]
  }
}
```

## Authentication

`POST /v1/auth/otp`

```json
{ "email": "person@company.com" }
```

`POST /v1/auth/otp/verify`

```json
{ "email": "person@example.com", "code": "123456", "password": "server-hashed-password" }
```

The verification response should contain `accessToken`, optional `refreshToken`, `expiresIn`, `verified`, and `user`. The BFF removes tokens from the browser response and stores them as secure, HTTP-only cookies.

All valid email domains are accepted. The backend must hash the submitted password with a modern password hashing function and must never log or return it.

Also required:

- `GET /v1/auth/me`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `PUT /v1/onboarding`
- `POST /v1/onboarding/complete`

## Dashboard Bootstrap

`GET /v1/dashboard/bootstrap` returns:

```json
{
  "data": {
    "user": {},
    "branches": [],
    "activeBranch": "",
    "members": [],
    "departments": [],
    "events": [],
    "challenges": [],
    "leaderboard": [],
    "participantOptions": []
  }
}
```

This endpoint gives the existing dashboard a single consistent initial snapshot. Resource endpoints then handle updates.

## Resource Endpoints

The client currently expects versioned endpoints for:

- `/v1/branches`
- `/v1/members`
- `/v1/departments`
- `/v1/events`
- `/v1/challenges`
- `/v1/clubs`
- `/v1/community/posts`
- `/v1/community/messages`
- `/v1/integrations`
- `/v1/roles`
- `/v1/users`
- `/v1/support/tickets`
- `/v1/public/demo-requests`

`GET /v1/users/search?q={name-or-email}` returns matching users that the current administrator is authorized to invite. `POST /v1/branches` accepts a branch name and an `invitees` array:

```json
{
  "name": "Abuja Office",
  "invitees": [
    { "userId": 42, "name": "Existing User", "email": "existing@example.com" },
    { "email": "new.person@example.com" }
  ]
}
```

Invitees with a `userId` are existing platform users. Email-only entries should receive an invitation.

Mutations follow `POST /v1/{resource}/{id?}/{action}` until the final backend contract is supplied. Change endpoint mapping only in `services/api.ts`; UI components should not call `fetch` directly.

## Production Requirements

- Use HTTPS for `BACKEND_API_URL`.
- Restrict CORS to the deployed application origin.
- Apply authorization and tenant checks on every backend resource.
- Enforce rate limits on OTP, authentication, support, uploads, and AI routes.
- Back the AI route's per-instance guard with a distributed API gateway or rate-limit store in multi-instance deployments.
- Validate all request bodies server-side.
- Store refresh tokens hashed or encrypted and rotate them after use.
- Record audit events for role, permission, member, branch, and organization changes.
- Return aggregate wellness information to organization administrators unless explicit lawful access to individual data exists.
