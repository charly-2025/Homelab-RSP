import os
import requests

from models.pc_state import PcState

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
    try:
        response = requests.get(
            f"{PC_AGENT}/status",
            timeout=2
        )

        response.raise_for_status()

        data = response.json()

        uptime = data["system"]["uptime_seconds"]

        return {
            "state": PcState.READY if data["rustdesk"]["ready"] else PcState.ONLINE,
            "hostname": data["hostname"],
            "uptime": format_uptime(uptime),
            "system": data["system"],
            "rustdesk": data["rustdesk"],
        }

    except requests.RequestException:
        return {
            "state": PcState.OFFLINE
        }
