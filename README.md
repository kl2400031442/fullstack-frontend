# PeerCollab Frontend

A Vite + React frontend for a peer-collaboration classroom platform.

## Backend connection

This app now supports backend API integration for:

- Student/teacher login
- Teacher MFA verification
- User signup
- Fetching projects
- Creating new assignments

### 1) Configure environment

Create a `.env` file in the project root:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2) Expected API routes

- `POST /auth/login/student`
- `POST /auth/login/teacher`
- `POST /auth/verify-mfa`
- `POST /auth/signup`
- `GET /projects`
- `POST /projects`

If `/projects` is unavailable, the UI falls back to demo data and shows a warning banner.

## Run locally

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run build
```
