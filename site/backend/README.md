# Backend

Flask REST API responsible for controlling and monitoring the remote computer.

---

# Responsibilities

The backend manages every operation requiring communication with the monitored computer.

It is responsible for:

- Wake-on-LAN
- Monitoring
- Boot tracking
- Shutdown detection
- System information
- REST API

---

# Folder Structure

```
backend/

├── app.py
├── routes/
├── services/
├── models/
├── utils/
├── requirements.txt
└── Dockerfile
```

---

# Architecture

```
HTTP Request
      │
      ▼
Routes
      │
      ▼
Services
      │
      ▼
Models / Utilities
```

Each layer has a single responsibility.

---

# Routes

The API exposes endpoints such as:

```
GET /api/pc/status
POST /api/wake
```

Routes remain lightweight and delegate processing to the service layer.

---

# Services

Services contain the application's business logic.

Examples include:

- Wake-on-LAN
- Monitoring
- Status updates
- Boot tracking

---

# Models

Models represent application data structures.

They define how monitoring sessions and other objects are represented internally.

---

# Utils

Utility functions shared across multiple services.

Examples:

- file helpers
- time helpers
- network helpers

---

# State Management

The backend owns the application's state machine.

Possible states:

- OFFLINE
- STARTING
- ONLINE
- READY

The frontend simply displays these states.

---

# Monitoring

The backend periodically checks:

- PC reachability
- Monitoring agent
- RustDesk availability

Based on these checks it returns the current system state.

---

# Development

Install dependencies

```bash
pip install -r requirements.txt
```

Run

```bash
python app.py
```

---

# Design Philosophy

The backend is intentionally responsible for all business logic.

This prevents duplicated logic between frontend and backend while keeping the React application lightweight and easy to maintain.
