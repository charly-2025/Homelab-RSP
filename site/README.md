# PC Control Interface

A full-stack web application for remotely controlling and monitoring a Windows computer.

The project is composed of two independent applications:

- **Frontend**: React application responsible for the user interface.
- **Backend**: Flask API responsible for Wake-on-LAN, monitoring and state management.

The two services are containerized using Docker and communicate through REST APIs.

---

# Features

- Remote Wake-on-LAN
- Live system monitoring
- Boot detection
- Shutdown detection
- Remote console
- REST API
- Docker deployment

---

# Architecture

```
                Browser
                   │
                   ▼
            React Frontend
                   │
           HTTP REST Requests
                   │
                   ▼
             Flask Backend
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
     Wake-on-LAN      Monitoring
          │                 │
          └────────┬────────┘
                   ▼
             Windows Computer
```

The frontend never communicates directly with the monitored computer.

All operations go through the backend.

---

# Project Structure

```
.
├── backend/
│   ├── app.py
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── utils/
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── vite.config.js
│
└── README.md
```

---

# Components

## Frontend

Responsible for:

- User interface
- Displaying monitoring information
- Sending API requests
- Handling UI transitions

See `frontend/README.md`.

---

## Backend

Responsible for:

- Wake-on-LAN
- Monitoring
- Boot state management
- Shutdown detection
- REST API

See `backend/README.md`.

---

# Design Philosophy

The backend is the single source of truth.

The frontend only displays backend states and never attempts to determine the computer status itself.

This architecture keeps the application predictable and easy to maintain.

---

# Technologies

Frontend

- React
- Vite

Backend

- Flask
- Python

Infrastructure

- Docker
- Nginx
- Wake-on-LAN
- Tailscale
