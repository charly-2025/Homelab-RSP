import os
import requests

from models.pc_state import PcState
from services.boot_session import start_boot_session
from services.pc_monitor import get_pc_status


def wake_pc():

    status = get_pc_status()

    if status["state"] != PcState.OFFLINE:
        return {
            "success": False,
            "message": "PC is already running or starting."
        }

    start_boot_session()

    try:
        response = requests.post(
            "http://host.docker.internal:4000/wake",
            headers={
                "X-API-Key": os.getenv("WOL_API_TOKEN")
            },
            timeout=5
        )

        response.raise_for_status()

    except requests.RequestException:
        return {
            "success": False,
            "message": "Error: Magic Packet not sent."
        }

    return {
        "success": True,
        "message": "Magic Packet sent."
    }
