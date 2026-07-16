import requests

from services.pc_monitor import get_pc_status
from services.boot_session import start_boot_session
from models.pc_state import PcState


def wake_pc():

    status = get_pc_status()

    if status["state"] != PcState.OFFLINE:
        return {
            "success": False,
            "message": "PC is not offline."
        }

    start_boot_session()

    requests.post(
        "http://host.docker.internal:4000/wake",
        timeout=5
    )

    return {
        "success": True,
        "message": "Magic Packet sent."
    }
