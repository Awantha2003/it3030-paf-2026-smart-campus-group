# 🏛️ Smart Campus Operations Hub
### IT3030 – Programming Applications and Frameworks | Assignment 2026
**SLIIT Faculty of Computing | Semester 1 | Group Project**

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Team Modules Overview](#4-team-modules-overview)
5. [Module A – Facilities & Assets Catalogue](#5-module-a--facilities--assets-catalogue)
6. [Module B – Booking Management](#6-module-b--booking-management)
7. [Module C – Maintenance & Incident Ticketing](#7-module-c--maintenance--incident-ticketing)
8. [Module D – Notifications Management *(My Part)*](#8-module-d--notifications-management-my-part)
9. [Module E – Authentication & Authorization *(My Part)*](#9-module-e--authentication--authorization-my-part)
10. [Role Management *(My Part)*](#10-role-management-my-part)
11. [Innovation – TOTP 2-Step Verification *(My Part)*](#11-innovation--totp-2-step-verification-my-part)
12. [Database Design (MongoDB)](#12-database-design-mongodb)
13. [API Endpoint Reference](#13-api-endpoint-reference)
14. [Frontend Architecture](#14-frontend-architecture)
15. [Security Architecture](#15-security-architecture)
16. [Version Control & CI/CD](#16-version-control--cicd)
17. [Submission Checklist](#17-submission-checklist)

---

## 1. Project Overview

A university is modernizing its day-to-day campus operations. The **Smart Campus Operations Hub** is a full-stack, production-inspired web platform that consolidates two critical workflows:

| Domain | Description |
|--------|-------------|
| **Facility & Asset Bookings** | Manage reservations for rooms, labs, lecture halls, and equipment |
| **Maintenance & Incident Handling** | Handle fault reports, technician assignments, and resolutions |

The platform enforces **role-based access control**, a **clear workflow state machine** for every resource, and **strong auditability** through commit history and structured logging.

### Business Goals

- Replace manual paper/email booking processes with a unified digital platform
- Give administrators full visibility and control over campus resource utilization
- Allow technicians to receive, act on, and close maintenance tickets efficiently
- Provide users a seamless, secure experience with modern authentication (Google OAuth2 + TOTP 2FA)

### Key Constraints

- **Each member** must implement at least **4 REST endpoints** using different HTTP methods
- **GitHub Actions CI** pipeline must build and test on every push
- **Individual contributions** must be clearly traceable in the commit history
- **AI-generated code usage must be disclosed** in the final report

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Spring Boot 3.2 (Java 17) | REST API, business logic, security |
| **Frontend** | React 18 + Vite | Client SPA |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **UI Components** | shadcn/ui | Accessible, composable component library |
| **Database** | MongoDB Atlas | Document store (cloud-hosted) |
| **Auth** | Spring Security + JJWT | JWT generation and validation |
| **OAuth2** | Google OAuth2 (Spring OAuth2 Client) | Social login |
| **2FA** | TOTP via `com.warrenstrange:googleauth` | Google Authenticator compatible |
| **Email** | Mailjet API | Notification emails |
| **File Storage** | Cloudinary | Incident ticket image attachments |
| **CI/CD** | GitHub Actions | Build + Test automation |
| **Version Control** | Git + GitHub | Source control |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React SPA                            │
│         (Vite + Tailwind CSS + shadcn/ui)                   │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Auth    │ │ Booking  │ │ Tickets  │ │Notifications │  │
│  │  Pages   │ │  Pages   │ │  Pages   │ │   Panel      │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│                     Axios + JWT Interceptor                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST (JSON)
                           │ Authorization: Bearer <JWT>
┌──────────────────────────▼──────────────────────────────────┐
│                  Spring Boot REST API                       │
│                   (Port 8080)                               │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │   auth/  │ │facility/ │ │booking/  │ │maintenance/  │  │
│  │controller│ │controller│ │controller│ │ controller   │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘  │
│       │            │            │               │           │
│  ┌────▼─────┐ ┌────▼─────┐ ┌───▼──────┐ ┌─────▼──────┐   │
│  │  auth/   │ │facility/ │ │booking/  │ │maintenance/│   │
│  │ service  │ │ service  │ │ service  │ │  service   │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬─────┘   │
│       │            │            │               │           │
│  ┌────▼────────────▼────────────▼───────────────▼──────┐  │
│  │              MongoDB Repositories                    │  │
│  └────────────────────────┬─────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  MongoDB Atlas (Cloud)                      │
│   Collections: users, facilities, bookings, tickets,        │
│                notifications, qr_sessions                   │
└─────────────────────────────────────────────────────────────┘
        │                    │                    │
   ┌────▼────┐          ┌────▼────┐          ┌───▼─────┐
   │Cloudinary│         │ Mailjet │          │ Google  │
   │(Images) │         │ (Email) │          │  OAuth2 │
   └─────────┘         └─────────┘          └─────────┘
```

---

## 4. Team Modules Overview

| Module | Description | Member |
|--------|-------------|--------|
| **A** | Facilities & Assets Catalogue | Member 1 |
| **B** | Booking Management | Member 2 |
| **C** | Maintenance & Incident Ticketing | Member 3 |
| **D** | Notifications Management | **Me** |
| **E** | Authentication & Authorization | **Me** |
| ➕ | Role Management | **Me** |
| 🔒 | TOTP 2FA Innovation | **Me** |

---

## 5. Module A – Facilities & Assets Catalogue

> **Owner: Member 1**

### Features
- Maintain a catalogue of bookable resources: lecture halls, labs, meeting rooms, projectors, cameras
- Each resource stores: `type`, `capacity`, `location`, `availabilityWindows`, `status`
- Status values: `ACTIVE` | `OUT_OF_SERVICE`
- Search and filter by type, capacity, and location

### Key Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/facilities` | List all with filters |
| GET | `/api/facilities/{id}` | Get single resource |
| POST | `/api/facilities` | Create resource (ADMIN) |
| PUT | `/api/facilities/{id}` | Update resource (ADMIN) |
| DELETE | `/api/facilities/{id}` | Delete resource (ADMIN) |

---

## 6. Module B – Booking Management

> **Owner: Member 2**

### Features
- Users request a booking by providing: `resourceId`, `date`, `timeRange`, `purpose`, `expectedAttendees`
- Workflow state machine: `PENDING` → `APPROVED` / `REJECTED` → *(if approved)* `CANCELLED`
- Conflict detection: system prevents overlapping bookings for the same resource
- Admins can approve or reject with a reason; users can view their own bookings

### Booking Workflow
```
[User submits]
      │
      ▼
  PENDING ──── Admin rejects ──► REJECTED
      │
      │ Admin approves
      ▼
  APPROVED ─── User/Admin cancels ──► CANCELLED
```

### Key Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking request (USER) |
| GET | `/api/bookings/my` | View own bookings (USER) |
| GET | `/api/bookings` | View all bookings (ADMIN) |
| PATCH | `/api/bookings/{id}/approve` | Approve booking (ADMIN) |
| PATCH | `/api/bookings/{id}/reject` | Reject with reason (ADMIN) |
| PATCH | `/api/bookings/{id}/cancel` | Cancel booking |

---

## 7. Module C – Maintenance & Incident Ticketing

> **Owner: Member 3**

### Features
- Users create incident tickets with: `resourceId`, `category`, `description`, `priority`, `contactDetails`
- Up to **3 image attachments** per ticket (stored in Cloudinary)
- Technicians are assigned to tickets and can update status + add resolution notes
- Users and staff can add comments with ownership rules (edit/delete own)

### Ticket Workflow
```
[User creates]
      │
      ▼
   OPEN ──── Admin rejects ──► REJECTED
      │
      │ Technician assigned
      ▼
 IN_PROGRESS
      │
      │ Technician resolves
      ▼
  RESOLVED
      │
      │ Admin/System closes
      ▼
   CLOSED
```

### Key Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tickets` | Create ticket (USER) |
| GET | `/api/tickets/my` | View own tickets |
| GET | `/api/tickets` | View all tickets (ADMIN/TECH) |
| PATCH | `/api/tickets/{id}/assign` | Assign technician (ADMIN) |
| PATCH | `/api/tickets/{id}/status` | Update status (TECHNICIAN) |
| POST | `/api/tickets/{id}/comments` | Add comment |

---

## 8. Module D – Notifications Management *(My Part)*

### Overview

All significant state changes in the system must trigger an **in-app notification** delivered to the relevant user. Notifications are stored in MongoDB and retrieved via the notification panel in the React UI.

### Notification Triggers

| Event | Who Gets Notified |
|-------|-------------------|
| Booking approved | Booking owner |
| Booking rejected (with reason) | Booking owner |
| Booking cancelled | Booking owner |
| Ticket status changed | Ticket creator |
| Technician assigned to ticket | Technician |
| New comment on ticket | Ticket creator + all previous commenters |
| 2FA enabled/disabled | The user themselves |
| Role changed by admin | The affected user |

### Notification Document (MongoDB)

```json
{
  "_id": "ObjectId",
  "userId": "string",
  "title": "string",
  "message": "string",
  "type": "BOOKING | TICKET | SYSTEM | COMMENT",
  "referenceId": "string (bookingId or ticketId)",
  "isRead": false,
  "createdAt": "ISODate"
}
```

### Backend Implementation

**Folder structure (my part):**
```
notification/
├── controller/
│   └── NotificationController.java
├── dto/
│   ├── NotificationResponse.java
│   └── MarkReadRequest.java
├── model/
│   └── Notification.java
├── repository/
│   └── NotificationRepository.java
└── service/
    └── NotificationService.java
```

**NotificationService** is used as an internal service — other modules call it to fire notifications:

```java
// Called from BookingService when admin approves:
notificationService.send(
    booking.getUserId(),
    "Booking Approved",
    "Your booking for " + facility.getName() + " has been approved.",
    NotificationType.BOOKING,
    booking.getId()
);
```

### Key Endpoints (My Contribution)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | USER | Get all notifications for current user |
| GET | `/api/notifications/unread-count` | USER | Get unread badge count |
| PATCH | `/api/notifications/{id}/read` | USER | Mark single notification as read |
| PATCH | `/api/notifications/read-all` | USER | Mark all as read |
| DELETE | `/api/notifications/{id}` | USER | Delete a notification |

### Frontend – Notification Panel

- Bell icon in the navbar with an **unread count badge**
- Clicking opens a **shadcn Popover/Sheet** listing recent notifications
- Each item is clickable — navigates to the relevant booking or ticket
- Notifications poll every **30 seconds** using `setInterval` (or WebSocket upgrade optional)
- Unread notifications are visually distinct (bold, blue dot indicator)

```jsx
// Notification bell badge component
<Button variant="ghost" className="relative">
  <Bell className="h-5 w-5" />
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white 
                     text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {unreadCount}
    </span>
  )}
</Button>
```

---

## 9. Module E – Authentication & Authorization *(My Part)*

### Overview

Three parallel authentication paths — all ultimately produce a **JWT token** stored in `localStorage`:

```
Path 1 – Normal Login:
  React → POST /api/auth/login → validate credentials → JWT → localStorage

Path 2 – Registration:
  React → POST /api/auth/register → create user → JWT → localStorage

Path 3 – Google OAuth2:
  React → /oauth2/authorization/google → Google → Spring callback
       → OAuth2SuccessHandler → JWT → redirect to /oauth2/callback?token=JWT
       → React reads token → localStorage
```

### Backend Folder Structure (My Part)

```
auth/
├── controller/
│   └── AuthController.java          ← /api/auth/**
├── dto/
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   ├── AuthResponse.java
│   ├── QrValidateRequest.java
│   ├── MfaSetupResponse.java        ← TOTP setup
│   └── MfaVerifyRequest.java        ← TOTP code submission
└── service/
    ├── AuthService.java             ← login / register logic
    └── QrAuthService.java           ← QR one-time login

security/
├── JwtTokenProvider.java            ← generate + validate JWT
├── JwtAuthenticationFilter.java     ← OncePerRequestFilter
├── CustomUserDetailsService.java    ← loads user by email
└── oauth2/
    ├── CustomOAuth2UserService.java  ← auto-register Google users
    └── OAuth2SuccessHandler.java    ← post-Google redirect with JWT

config/
└── SecurityConfig.java              ← filter chain, CORS, permitAll rules
```

### User Document (MongoDB)

```json
{
  "_id": "string",
  "name": "string",
  "email": "string (unique, indexed)",
  "password": "string (BCrypt, null for Google users)",
  "role": "USER | ADMIN | TECHNICIAN",
  "provider": "local | google",
  "providerId": "string (Google sub, nullable)",
  "qrToken": "string (nullable, one-time use)",
  "mfaSecret": "string (TOTP secret, nullable)",
  "isMfaEnabled": false,
  "enabled": true,
  "createdAt": "ISODate"
}
```

### JWT Payload

```json
{
  "sub": "user@example.com",
  "roles": "[ROLE_USER]",
  "iat": 1713000000,
  "exp": 1713086400
}
```

### Key Endpoints (My Contribution)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user, returns JWT |
| POST | `/api/auth/login` | Public | Login, returns JWT or MFA challenge |
| GET | `/api/auth/me` | JWT | Get current user profile |
| GET | `/oauth2/authorization/google` | Public | Start Google OAuth2 flow |
| GET | `/api/auth/qr/generate` | JWT | Generate QR code image (base64 PNG) |
| POST | `/api/auth/qr/validate` | Public | Validate scanned QR → return JWT |
| POST | `/api/auth/mfa/generate` | JWT | Generate TOTP secret + QR URI |
| POST | `/api/auth/mfa/verify` | JWT | Verify first TOTP code → enable 2FA |
| POST | `/api/auth/login/verify-mfa` | Partial | Step 2 login: validate TOTP code → JWT |
| POST | `/api/auth/mfa/disable` | JWT | Disable 2FA (requires current TOTP code) |

### React Auth Flow

```
App loads
    │
    ▼
Read localStorage token
    │
    ├── No token ──► Redirect to /login
    │
    └── Has token ──► GET /api/auth/me
                          │
                          ├── 200 OK ──► Set user in AuthContext ──► Render app
                          │
                          └── 401 ──► Clear token ──► Redirect to /login
```

### Route Protection

```jsx
// Usage in App.jsx
<Route path="/dashboard" element={
  <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'TECHNICIAN']}>
    <Dashboard />
  </ProtectedRoute>
} />

<Route path="/admin" element={
  <ProtectedRoute allowedRoles={['ADMIN']}>
    <AdminPanel />
  </ProtectedRoute>
} />
```

---

## 10. Role Management *(My Part)*

### Roles in the System

| Role | Permissions |
|------|-------------|
| `USER` | Book resources, create tickets, view own data, receive notifications |
| `TECHNICIAN` | All USER permissions + update ticket status, add resolution notes |
| `ADMIN` | All permissions + approve/reject bookings, manage users, change roles, view all data |

### Role Assignment Rules

- **Self-registration** always creates a `USER`
- **Google OAuth2** first login always creates a `USER`
- **Admin** can upgrade/downgrade any user's role via the admin panel
- **Technician** role can only be granted by an Admin
- Registration codes are used for elevated roles during sign-up (from `application.yml`):
  - `ADMIN_REGISTRATION_CODE` → grants ADMIN on register
  - `SUB_ADMIN_REGISTRATION_CODE` → grants TECHNICIAN on register

### Key Endpoints (My Contribution)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/users` | ADMIN | List all users with roles |
| PATCH | `/api/admin/users/{id}/role` | ADMIN | Change a user's role |
| DELETE | `/api/admin/users/{id}` | ADMIN | Deactivate / delete user |
| GET | `/api/admin/users/{id}` | ADMIN | Get single user details |

### Admin User Management UI

- **Table view** of all users: name, email, role, provider, joined date
- **Role dropdown** per row — changes saved with PATCH call
- **Disable/Enable** toggle for user accounts
- **Filter** by role or search by name/email

---

## 11. Innovation – TOTP 2-Step Verification *(My Part)*

### What Is TOTP?

**Time-Based One-Time Password (TOTP)** is the same standard used by Google Authenticator. A secret key is shared once (via QR scan), and then both the app and the server independently generate a 6-digit code that changes every 30 seconds. No internet needed after setup.

### Why This Is Innovation for This Assignment

- The assignment requires only OAuth2 login (Module E baseline)
- TOTP adds a **second factor on top of any login method** — both local and Google OAuth
- It is enforced by **role** — Admins and Technicians must complete 2FA; regular Users see it as optional
- This directly satisfies the **Creativity/Innovation (10 marks)** rubric criterion

### Role-Based 2FA Enforcement

| Role | 2FA Requirement |
|------|----------------|
| `USER` | Optional (can enable voluntarily) |
| `TECHNICIAN` | **Mandatory** — first login after role assignment triggers setup |
| `ADMIN` | **Mandatory** — first login after role assignment triggers setup |

### Backend Library

```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.warrenstrange</groupId>
    <artifactId>googleauth</artifactId>
    <version>1.5.0</version>
</dependency>
```

### TOTP Setup Flow (Phase 1 — First Time)

```
[TECHNICIAN/ADMIN logs in with correct password]
           │
           ▼
  isMfaEnabled == false?
           │
           YES
           ▼
  Return HTTP 200 with body:
  { "status": "MFA_SETUP_REQUIRED", "userId": "..." }
           │
           ▼
  React shows MFA Setup Screen
           │
           ▼
  Frontend calls GET /api/auth/mfa/generate
           │
           ▼
  Backend generates secret, saves to user.mfaSecret (not yet enabled),
  returns otpauth URI
           │
           ▼
  React renders QR code using qrcode.react library
  (user scans with Google Authenticator app)
           │
           ▼
  User types first 6-digit code → POST /api/auth/mfa/verify
           │
           ▼
  Backend validates code against mfaSecret,
  sets user.isMfaEnabled = true,
  returns final JWT token
           │
           ▼
  User is now logged in + 2FA is enrolled ✅
```

### TOTP Login Flow (Phase 2 — Every Login After Setup)

```
[User submits email + password]
           │
           ▼
  Credentials valid?
           │
           YES
           ▼
  isMfaEnabled == true?
           │
           YES
           ▼
  Return HTTP 200:
  { "status": "MFA_CODE_REQUIRED", "userId": "..." }
           │
           ▼
  React hides password form, shows 6-digit code input
           │
           ▼
  User types code → POST /api/auth/login/verify-mfa
  { "userId": "...", "code": "123456" }
           │
           ▼
  Backend validates TOTP code
           │
     ┌─────┴─────┐
   Valid        Invalid
     │              │
     ▼              ▼
  Return JWT    Return 401
     │
     ▼
  User logged in ✅
```

### Key New Fields on User Document

```json
{
  "mfaSecret": "BASE32SECRETSTRING",
  "isMfaEnabled": true
}
```

### Backend Service Logic

```java
// MfaService.java (inside auth/service/)

// Generate secret + QR URI
public MfaSetupResponse generateMfaSetup(String userEmail) {
    GoogleAuthenticatorKey key = gAuth.createCredentials();
    String secret = key.getKey();

    // Save secret to user (not yet enabled)
    user.setMfaSecret(secret);
    userRepository.save(user);

    // Build the otpauth:// URI that becomes the QR code
    String otpUri = GoogleAuthenticatorQRGenerator.getOtpAuthTotpURL(
        "SmartCampus", userEmail, key
    );
    return new MfaSetupResponse(otpUri, secret);
}

// Verify setup (first time) or login (every time after)
public boolean verifyCode(String secret, int code) {
    return gAuth.authorize(secret, code);
}
```

### Frontend – MFA Setup Component

```jsx
// MfaSetupPage.jsx
import QRCode from 'qrcode.react';

export default function MfaSetupPage({ otpUri, onVerified }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    try {
      const res = await axiosInstance.post('/api/auth/mfa/verify', {
        userId, code: parseInt(code)
      });
      localStorage.setItem('token', res.data.token);
      onVerified(res.data);
    } catch {
      setError('Invalid code. Please try again.');
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set Up 2-Step Verification</CardTitle>
        <p className="text-sm text-slate-500">
          Scan this QR code with Google Authenticator
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center p-4 bg-white border rounded-lg">
          <QRCode value={otpUri} size={200} />
        </div>
        <Input
          placeholder="Enter 6-digit code"
          value={code}
          onChange={e => setCode(e.target.value)}
          maxLength={6}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button onClick={handleVerify} className="w-full">
          Verify & Enable 2FA
        </Button>
      </CardContent>
    </Card>
  );
}
```

### npm Package Required

```bash
npm install qrcode.react
```

---

## 12. Database Design (MongoDB)

### Collections

#### `users`
```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "password": "string (BCrypt | null)",
  "role": "USER | ADMIN | TECHNICIAN",
  "provider": "local | google",
  "providerId": "string | null",
  "qrToken": "string | null",
  "mfaSecret": "string | null",
  "isMfaEnabled": "boolean",
  "enabled": "boolean",
  "createdAt": "ISODate"
}
```

#### `notifications`
```json
{
  "_id": "string",
  "userId": "string",
  "title": "string",
  "message": "string",
  "type": "BOOKING | TICKET | COMMENT | SYSTEM",
  "referenceId": "string | null",
  "isRead": "boolean",
  "createdAt": "ISODate"
}
```

#### `facilities`
```json
{
  "_id": "string",
  "name": "string",
  "type": "LECTURE_HALL | LAB | MEETING_ROOM | EQUIPMENT",
  "capacity": "int",
  "location": "string",
  "availabilityWindows": [{ "dayOfWeek": "MON", "startTime": "08:00", "endTime": "18:00" }],
  "status": "ACTIVE | OUT_OF_SERVICE",
  "createdAt": "ISODate"
}
```

#### `bookings`
```json
{
  "_id": "string",
  "facilityId": "string",
  "userId": "string",
  "date": "ISODate",
  "startTime": "string",
  "endTime": "string",
  "purpose": "string",
  "expectedAttendees": "int",
  "status": "PENDING | APPROVED | REJECTED | CANCELLED",
  "reviewNote": "string | null",
  "reviewedBy": "string | null",
  "createdAt": "ISODate"
}
```

#### `tickets`
```json
{
  "_id": "string",
  "facilityId": "string",
  "createdBy": "string",
  "assignedTo": "string | null",
  "category": "string",
  "description": "string",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL",
  "status": "OPEN | IN_PROGRESS | RESOLVED | CLOSED | REJECTED",
  "imageUrls": ["string"],
  "comments": [{ "userId": "string", "text": "string", "createdAt": "ISODate" }],
  "resolutionNote": "string | null",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

---

## 13. API Endpoint Reference

### My Endpoints (Module D + E + Role Management)

| # | Method | Endpoint | Auth | Module |
|---|--------|----------|------|--------|
| 1 | POST | `/api/auth/register` | Public | E |
| 2 | POST | `/api/auth/login` | Public | E |
| 3 | GET | `/api/auth/me` | JWT | E |
| 4 | GET | `/oauth2/authorization/google` | Public | E |
| 5 | GET | `/api/auth/qr/generate` | JWT | E |
| 6 | POST | `/api/auth/qr/validate` | Public | E |
| 7 | POST | `/api/auth/mfa/generate` | JWT | Innovation |
| 8 | POST | `/api/auth/mfa/verify` | JWT | Innovation |
| 9 | POST | `/api/auth/login/verify-mfa` | Partial | Innovation |
| 10 | POST | `/api/auth/mfa/disable` | JWT | Innovation |
| 11 | GET | `/api/notifications` | JWT | D |
| 12 | GET | `/api/notifications/unread-count` | JWT | D |
| 13 | PATCH | `/api/notifications/{id}/read` | JWT | D |
| 14 | PATCH | `/api/notifications/read-all` | JWT | D |
| 15 | DELETE | `/api/notifications/{id}` | JWT | D |
| 16 | GET | `/api/admin/users` | ADMIN | Role Mgmt |
| 17 | GET | `/api/admin/users/{id}` | ADMIN | Role Mgmt |
| 18 | PATCH | `/api/admin/users/{id}/role` | ADMIN | Role Mgmt |
| 19 | DELETE | `/api/admin/users/{id}` | ADMIN | Role Mgmt |

> ✅ This exceeds the minimum requirement of **4 endpoints with different HTTP methods** (GET, POST, PATCH, DELETE all covered).

---

## 14. Frontend Architecture

### Folder Structure

```
src/
├── api/
│   └── axiosInstance.js          ← Base URL + JWT interceptor + 401 handler
├── context/
│   └── AuthContext.jsx           ← Global user state + login/logout
├── pages/
│   ├── LoginPage.jsx             ← Normal login + Google button
│   ├── RegisterPage.jsx          ← Registration form
│   ├── OAuth2CallbackPage.jsx    ← Reads ?token= and logs in
│   ├── MfaSetupPage.jsx          ← QR code + first TOTP verify
│   ├── MfaVerifyPage.jsx         ← 6-digit code input (step 2 login)
│   ├── DashboardPage.jsx         ← Main user dashboard
│   └── admin/
│       └── UserManagementPage.jsx ← Role management table
├── components/
│   ├── ProtectedRoute.jsx        ← Role-based route guard
│   ├── layout/
│   │   ├── Navbar.jsx            ← With notification bell
│   │   └── Sidebar.jsx
│   └── notifications/
│       └── NotificationPanel.jsx ← Bell + popover + list
└── App.jsx                       ← Router + route definitions
```

### Login Page States (State Machine)

```
IDLE ──► [User submits credentials]
          │
          ▼
       LOADING
          │
    ┌─────┴──────────────────────┐
    │                            │
    ▼                            ▼
  JWT received           { status: "MFA_SETUP_REQUIRED" }
    │                            │
    ▼                            ▼
  Log in directly          Show MFA Setup
  ─────────────            ─────────────
                    OR
                    │
                    ▼
          { status: "MFA_CODE_REQUIRED" }
                    │
                    ▼
            Show 6-digit input
```

---

## 15. Security Architecture

### JWT Security

- Algorithm: **HS256** with a 256-bit secret
- Expiry: **3600 seconds** (1 hour) — configured in `application.yml`
- Token stored in **`localStorage`** — sent as `Authorization: Bearer <token>` header
- Filter: `JwtAuthenticationFilter` runs on every request before Spring Security processes it

### OAuth2 Security

- Google OAuth2 via Spring's built-in OAuth2 Client
- Callback URI: `/login/oauth2/code/google`
- On success, `OAuth2SuccessHandler` redirects to frontend with JWT as query parameter
- Frontend immediately moves token from URL to localStorage and cleans the URL

### TOTP Security

- Secret generated with `GoogleAuthenticatorKey` — **never sent to client after initial setup**
- Codes are valid for ±1 window (30-second window tolerance)
- One-time QR setup URL — cannot be regenerated without admin re-enrollment
- `isMfaEnabled = false` until user proves they scanned it correctly by submitting valid first code

### CORS

```java
config.setAllowedOrigins(List.of("http://localhost:5173"));
config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
config.setAllowCredentials(true);
```

### Endpoint Security Rules

```
/api/auth/**              → Public (no token required)
/oauth2/**                → Public
/login/oauth2/**          → Public
/api/admin/**             → ADMIN role only
/api/technician/**        → ADMIN or TECHNICIAN
/api/**                   → Any authenticated user
```

---

## 16. Version Control & CI/CD

### Repository

- **Name:** `it3030-paf-2026-smart-campus-groupXX`
- **Structure:** Monorepo with `/backend` and `/frontend` folders
- Each member commits to their own feature branch: `feature/auth-module`, `feature/notifications`, etc.
- PRs merged to `main` after review

### Branching Strategy

```
main
 ├── feature/module-a-facilities    (Member 1)
 ├── feature/module-b-bookings      (Member 2)
 ├── feature/module-c-tickets       (Member 3)
 ├── feature/module-d-notifications (Me)
 └── feature/module-e-auth          (Me)
```

### GitHub Actions CI Workflow

```yaml
# .github/workflows/ci.yml
name: Smart Campus CI

on:
  push:
    branches: [ main, feature/** ]
  pull_request:
    branches: [ main ]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Build and Test Backend
        run: |
          cd backend
          ./mvnw clean verify

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Build Frontend
        run: |
          cd frontend
          npm ci
          npm run build
```

---

## 17. Submission Checklist

### Code
- [ ] All 5 modules implemented and integrated
- [ ] Minimum 4 endpoints per member using all HTTP methods
- [ ] MongoDB used for all persistence (no in-memory collections)
- [ ] Role-based access control enforced on all endpoints
- [ ] OAuth2 Google login working end-to-end
- [ ] TOTP 2FA working for ADMIN and TECHNICIAN roles
- [ ] Notification panel functional with real-time badge count
- [ ] Input validation with meaningful error messages
- [ ] Consistent HTTP status codes (200, 201, 400, 401, 403, 404, 409)

### Repository
- [ ] Public GitHub repository with clean commit history
- [ ] No `node_modules`, `target`, `.env` committed
- [ ] README with setup instructions
- [ ] GitHub Actions workflow passing on `main`
- [ ] Commits attributed to individual members (no single-day bulk commits)

### Documentation (Final PDF Report)
- [ ] Functional requirements for REST API and client app
- [ ] Non-functional requirements (security, performance, scalability)
- [ ] Overall system architecture diagram
- [ ] REST API architecture diagram
- [ ] Frontend architecture diagram
- [ ] Endpoint list with methods and descriptions
- [ ] Testing evidence (unit tests and/or Postman collection)
- [ ] Team contribution summary (who did what)
- [ ] AI tool usage disclosure

### Evidence
- [ ] Screenshots of all key workflows
- [ ] Screenshot of Google OAuth2 login
- [ ] Screenshot of TOTP setup and verification
- [ ] Screenshot of notification panel
- [ ] Screenshot of admin user/role management

### Submission Artifacts
- [ ] ZIP file: `IT3030_PAF_Assignment_2026_GroupXX.zip`
- [ ] Report: `IT3030_PAF_Assignment_2026_GroupXX.pdf`
- [ ] Submitted via Courseweb before **27th April 2026, 11:45 PM (GMT+5:30)**

---

*This document is the technical blueprint for the Smart Campus Operations Hub project. It covers the full system and provides detailed implementation guidance for the Authentication, Notifications, Role Management, and TOTP 2FA modules contributed individually.*

*Last updated: April 2026*
