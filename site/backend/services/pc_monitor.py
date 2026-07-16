import os
from datetime import datetime
from zoneinfo import ZoneInfo

import requests

from models.pc_state import PcState
from services.boot_session import (
    load_session,
    mark_online,
    mark_ready,
    mark_failed,
)

TZ = ZoneInfo("Europe/Paris")
PC_AGENT = os.getenv("PC_AGENT_URL")


def format_uptime(seconds):
    days = seconds // 86400
    hours = (seconds % 86400) // 3600
    minutes = (seconds % 3600) // 60

    return {
        "seconds": seconds,
        "days": days,
        "hours": hours,
        "minutes": minutes,
    }


def get_pc_status():
    session = load_session()

    if not session:
        session = {}

    try:
        response = requests.get(
            f"{PC_AGENT}/status",
            timeout=2
        )

        response.raise_for_status()

        data = response.json()
        rustdesk = data["rustdesk"]

        # STARTING -> ONLINE
        if (
            session
            and session.get("status") == "STARTING"
            and session.get("pc_online_at") is None
        ):
            mark_online()
            session = load_session()

        # ONLINE -> READY
        if (
            session
            and rustdesk["ready"]
            and session.get("rustdesk_ready_at") is None
        ):
            session = mark_ready()

        if rustdesk["ready"]:
            state = PcState.READY
        else:
            state = PcState.ONLINE

        return {
            "state": state,
            "hostname": data["hostname"],
            "uptime": format_uptime(
                data["system"]["uptime_seconds"]
            ),
            "system": data["system"],
            "rustdesk": rustdesk,
            "session": session,
        }

    except requests.RequestException:

        session = load_session()

        if session and session.get("status") == "STARTING":

            wake = datetime.fromisoformat(
                session["wake_sent_at"]
            )

            elapsed = int(
                (datetime.now(TZ) - wake).total_seconds()
            )

            session["elapsed"] = elapsed

            if elapsed >= 600:
                session = mark_failed()
                state = PcState.FAILED
            else:
                state = PcState.STARTING

        else:
            state = PcState.OFFLINE

        return {
            "state": state,
            "hostname": None,
            "uptime": None,
            "system": None,
            "rustdesk": None,
            "session": session,
        }
