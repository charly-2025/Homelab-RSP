# PC Control Interface

A modern web application that allows you to remotely control and monitor a Windows computer.

The interface is built with React and communicates with a Flask backend through a REST API.

---

# Features

- Remote Wake-on-LAN
- Live PC monitoring
- Automatic boot detection
- Shutdown detection
- Live CPU usage
- Live RAM usage
- System uptime
- Responsive interface
- Console page

---

# Technologies

## Frontend

- React
- CSS
- Fetch API

## Backend

- Flask
- Python

---

# Project Structure

```
src/
│
├── components/
├── images/
├── pages/
│   ├── Home.jsx
│   ├── Console.jsx
│   └── ...
│
├── App.jsx
└── main.jsx
```

---

# State Machine

The frontend only displays states returned by the backend.

Available states:

| State | Description |
|--------|-------------|
| OFFLINE | The computer is unreachable. |
| STARTING | A boot sequence is in progress. |
| ONLINE | The monitoring agent is reachable. |
| READY | The computer is fully operational. |
| SHUTTING_DOWN | A shutdown has been detected. |
| LOADING | Waiting for the first backend response. |
| MONITORING_OFF | Monitoring is disabled. |

---

# Frontend Philosophy

The frontend is intentionally **stateless** regarding the PC.

It does **not** try to determine whether the PC is booting or shutting down.

Its role is limited to:

- displaying backend information
- sending user actions
- managing animations and UI transitions

This keeps the frontend simple and prevents duplicated logic.

---

# Monitoring

Monitoring is disabled by default.

Once enabled, the frontend periodically requests:

```
GET /api/pc/status
```

The polling interval is currently **2 seconds**.

When monitoring is stopped:

- polling stops
- timers are cleared
- all temporary states are reset

---

# Wake-on-LAN

Clicking **Power On** sends:

```
POST /api/wake
```

Immediately after sending the request:

- the button is disabled
- the interface switches to **STARTING**

The backend then becomes responsible for the rest of the boot sequence.

---

# Shutdown Detection

When the backend transitions from:

```
READY
```

or

```
ONLINE
```

to

```
OFFLINE
```

the frontend temporarily displays:

```
SHUTTING DOWN
```

instead of switching directly to OFFLINE.

This prevents flickering during:

- reboot
- temporary network interruptions
- service restarts

If the PC comes back online before the timer expires, the shutdown state is automatically cancelled.

---

# UI Principles

The interface follows a few simple rules:

- one source of truth (the backend)
- minimal frontend logic
- immediate visual feedback
- no duplicated state machine
- responsive updates

---

# Future Improvements

Planned features:

- Boot history
- Boot statistics
- Ethernet link detection
- System temperatures
- GPU monitoring
- Disk monitoring
- Event timeline
- Modern dashboard
- Theme customization

---

# Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

# License

This project was developed as a personal learning project to explore remote system management, React development and backend-driven application design.
