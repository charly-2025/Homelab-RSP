import os
from datetime import datetime
from zoneinfo import ZoneInfo

import requests

from models.pc_state import PcState
from services.boot_session import (
    load_session,
    update_elapsed,
    mark_online,
    mark_ready,
    mark_failed
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
        "minutes": minutes
    }


def get_pc_status():

    session = load_session()

    try:

        response = requests.get(
            f"{PC_AGENT}/status",
            timeout=2
        )

        response.raise_for_status()

        data = response.json()

        rustdesk = data["rustdesk"]

        if session:

            if (
                session["status"] == "STARTING"
                and session["pc_online_at"] is None
            ):
                session = mark_online()

            if (
                rustdesk["ready"]
                and session["rustdesk_ready_at"] is None
            ):
                session = mark_ready()

        state = (
            PcState.READY
            if rustdesk["ready"]
            else PcState.ONLINE
        )

        return {
            "state": state,
            "hostname": data["hostname"],
            "uptime": format_uptime(
                data["system"]["uptime_seconds"]
            ),
            "system": data["system"],
            "rustdesk": rustdesk,
            "session": session
        }

    except requests.RequestException:

        session = load_session()

        if session:

            session = update_elapsed()

            if session["elapsed"] >= 240:

                mark_failed()

                return {
                    "state": PcState.OFFLINE,
                    "hostname": None,
                    "uptime": None,
                    "system": None,
                    "rustdesk": None,
                    "session": {}
                }

            return {
                "state": PcState.STARTING,
                "hostname": None,
                "uptime": None,
                "system": None,
                "rustdesk": None,
                "session": session
            }

        return {
            "state": PcState.OFFLINE,
            "hostname": None,
            "uptime": None,
            "system": None,
            "rustdesk": None,
            "session": {}
        }
