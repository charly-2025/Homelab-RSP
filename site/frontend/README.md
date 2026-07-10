# Frontend - Remote Wakeup

## Overview

This frontend is a React + Vite application.

Production workflow:

``` text
src/
   |
   | npm run build
   v
dist/
   |
   v
Docker image
   |
   v
Frontend container
   |
   v
Global Nginx reverse proxy
```

The production container only contains the compiled static files
(`dist`) and a lightweight web server.

------------------------------------------------------------------------

## Development

Install dependencies:

``` bash
npm install
```

Start the development server:

``` bash
npm run dev
```

------------------------------------------------------------------------

## Build for Production

Compile the frontend:

``` bash
npm run build
```

The generated files are written to:

``` text
dist/
```

------------------------------------------------------------------------

## Rebuild the Docker Image

From the `~/homelab` directory:

``` bash
docker compose build frontend
docker compose up -d frontend
```

------------------------------------------------------------------------

## Useful Commands

View running containers:

``` bash
docker ps
```

View logs:

``` bash
docker logs remote-wakeup-frontend
```

Restart the container:

``` bash
docker restart remote-wakeup-frontend
```

------------------------------------------------------------------------

## Best Practices

-   Only edit files inside `src/`.
-   Never edit the `dist/` directory manually.
-   Run `npm run build` after every frontend change.
-   Rebuild the Docker image after generating a new `dist/`.

------------------------------------------------------------------------

## Notes

The frontend container is intentionally lightweight.

Node.js is only required during development and build time. In
production, only the compiled static files are served, minimizing CPU,
RAM usage, and image size.
