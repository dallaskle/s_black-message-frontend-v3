# Frontend Authentication System Documentation

## Core Components

### AuthContext (`AuthContext.tsx`)
- **Purpose**: Central authentication state manager.
- **Responsibilities**:
  - Provides authentication state and methods to all child components.
  - Manages:
    - User authentication state.
    - Access token lifecycle.
    - Automatic token refresh scheduling.
    - Login/logout operations.

### Auth API (`auth.ts`)
- **Purpose**: Handles direct API communications for authentication.
- **Operations**:
  - `login`: Authenticates user credentials.
  - `refreshToken`: Handles token renewal.
  - `logout`: Ends user session.
- **Features**:
  - Implements token refresh queueing to prevent multiple simultaneous refresh attempts.

### Axios Configuration (`axiosConfig.ts`)
- **Purpose**: Configures HTTP client with interceptors.
- **Responsibilities**:
  - Automatically handles 401 errors by attempting token refresh.
  - Maintains authentication headers.

## Authentication Flow

### 1. Initial Load
- Authentication state is checked on app load.
- If valid tokens exist, user is logged in automatically.

### Login Process
- User submits credentials via `login` API.
- Tokens are received and stored in memory.
- Authentication state is updated.

### Token Refresh Mechanism
- **Automatic refresh**:
  - Refresh triggered before token expiration.
  - Maintains uninterrupted user session.
- **Concurrent refresh handling**:
  - Prevents multiple simultaneous refresh attempts.
  - Queues requests until the refresh is complete.

### API Request Flow
- All requests pass through Axios interceptors.
- Interceptor adds authentication headers and handles 401 errors.
- On 401, attempts token refresh before retrying the request.

## Security Features

### Token Management
- Tokens are stored in memory (not `localStorage`/`sessionStorage`).
- Automatic cleanup on logout.
- Refresh tokens managed via HTTP-only cookies (`withCredentials: true`).

### Error Handling
- Comprehensive error handling for failed authentication attempts.
- Automatic cleanup of auth state on failures.
- Prevention of infinite refresh loops.

### State Cleanup
- Ensures authentication state is cleared on logout or token expiry.

## Auth Pages and Their Roles

### Registration Flow (`RegisterPage.tsx`)
- **Purpose**: Handles user registration.
- **Flow**:
  1. User fills out registration form.
  2. Validates form and submits data to backend.
  3. Redirects user to `EmailVerificationPage`.

### Email Verification Flow
- **EmailVerificationPage.tsx**:
  - Static page showing "Check your email" message.
  - Backend sends an email with a verification link.
- **EmailLoginPage.tsx**:
  - Handles magic link verification.
  - Extracts tokens from URL hash.
  - Logs user in automatically.

### Login Flow (`LoginPage.tsx`)
- **Purpose**: Facilitates direct login.
- **Integration**:
  - Uses `AuthContext`'s `login` method.
  - Stores tokens and sets up automatic token refresh.

## Authentication Flow Diagram
```
[RegisterPage] --> [EmailVerificationPage] --> [EmailLoginPage] --> [AuthContext]
                          ^
                          |
                   [LoginPage]
```

## Key Integration Points

### Registration to Verification
- `RegisterPage` handles initial signup and redirects to `EmailVerificationPage`.
- Backend sends email with a magic link.

### Email Verification to Login
- Magic link contains tokens in URL hash.
- `EmailLoginPage` extracts and stores tokens, then logs user in automatically.

### Direct Login
- `LoginPage` uses `AuthContext` for login and state management.
- Automatic token refresh is configured during login.

## Security Considerations

### Form Validation
- Ensures fields are valid before submission.

### Password Requirements
- Enforces strong password criteria.

### Error Handling
- Provides clear and actionable error messages.
- Securely handles errors to avoid leaking sensitive information.

## Summary
Your authentication system is robust and secure, with:
- Efficient token lifecycle management.
- Integration of email verification and strong password policies.
- Automatic token refresh for seamless user experience.
- Comprehensive error handling and state cleanup.

The combination of `AuthContext`, `auth.ts`, and well-designed pages ensures a smooth and secure authentication process.

