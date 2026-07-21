# Frontend

React application providing the graphical interface for the PC Control Interface.

---

# Responsibilities

The frontend is responsible for:

- Displaying the current PC status
- Sending user actions
- Showing monitoring information
- Managing interface transitions
- Rendering pages

Business logic remains in the backend.

---

# Technologies

- React
- Vite
- CSS
- Fetch API

---

# Folder Structure

```
src/

├── components/
├── images/
├── pages/
├── App.jsx
└── main.jsx
```

---

# Pages

## Home

Main dashboard.

Displays:

- Current status
- CPU usage
- RAM usage
- Uptime
- Wake button
- Monitoring controls

---

## Console

Provides access to the remote console.

---

# Monitoring

Monitoring is started manually.

The frontend periodically requests:

```
GET /api/pc/status
```

every two seconds.

When monitoring stops:

- polling stops
- timers are cleared
- temporary states are reset

---

# User Interface States

Available states:

- MONITORING_OFF
- LOADING
- OFFLINE
- STARTING
- ONLINE
- READY
- SHUTTING_DOWN

The frontend does not compute these states.

It simply renders the values returned by the backend.

---

# Wake-on-LAN

Clicking the power button sends:

```
POST /api/wake
```

The interface immediately:

- disables the button
- displays STARTING

The backend is then responsible for the remaining state transitions.

---

# Development

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Build production version

```bash
npm run build
```

---

# Philosophy

The frontend intentionally contains very little business logic.

Its purpose is to provide a responsive interface while leaving all decision making to the backend.
