# Homelab RSP

My self-hosted homelab running on a **Raspberry Pi**: personal cloud, password
manager, container management and a custom control panel to wake up and
monitor my desktop PC remotely, all reachable privately through Tailscale.

`Docker Compose` · `nginx` · `Flask` · `React` · `Tailscale` · `Nextcloud` · `Vaultwarden` · `Portainer` · `Netdata`

## Services

| Service | Role |
| --- | --- |
| **Control panel** (`site/`) | React + Flask app: Wake-on-LAN, PC status, Raspberry Pi monitoring and fan control |
| **WOL service** (`wol-service/`) | Small API that sends Wake-on-LAN magic packets on the local network |
| **Nextcloud** + MariaDB | Personal cloud storage |
| **Vaultwarden** | Self-hosted Bitwarden-compatible password manager |
| **Portainer** | Docker containers management |
| **Netdata** (optional) | Real-time system metrics |
| **Pi-hole** (optional) | Network-wide ad blocking and DNS |
| **nginx** | HTTPS reverse proxy in front of every service |

## Control panel

- **Wake-on-LAN**: power on the desktop PC from anywhere
- **Boot and shutdown detection** with live PC status
- **Raspberry Pi monitoring**: CPU, RAM and disk usage, plus fan control
- **Remote console** page
- REST API: `/api/wake`, `/api/pc/status`, `/api/rsp/status`, `/api/rsp/fan`

## Architecture

```
Tailscale ──▶ nginx (HTTPS) ──┬──▶ control panel (React + Flask) ──▶ wol-service ──▶ PC
                              ├──▶ Nextcloud ──▶ MariaDB
                              ├──▶ Vaultwarden
                              ├──▶ Portainer
                              └──▶ Netdata
```

Nothing is exposed to the internet: every service is only reachable from my
Tailscale network, and nginx serves them under a single HTTPS hostname.

## Getting started

```bash
cp .env.example .env      # MAC address of the PC, API token, passwords...
docker compose up -d --build
```

Set `HOMELAB_HOST` in `.env` to your Tailscale hostname: nginx, Nextcloud and
Vaultwarden all read it from there. Then place the certificates in
`nginx/certs/` as `<HOMELAB_HOST>.crt` and `<HOMELAB_HOST>.key`
(`tailscale cert` generates them).

## Security

- **No secret in git**: hostnames, MAC address, tokens and passwords live in
  `.env` (ignored), certificates and service data are ignored too.
- **Private by design**: services are only reachable from my Tailscale network,
  behind HTTPS, and the Wake-on-LAN API requires a token.
- **Secret scanning**: [gitleaks](https://github.com/gitleaks/gitleaks) runs on
  every push and pull request (`.github/workflows/secret-scan.yml`), with extra
  rules for Tailscale hostnames and addresses and MAC addresses
  (`.gitleaks.toml`).
- **Local hook**: enable the same check before each commit with
  `pip install pre-commit && pre-commit install`.
