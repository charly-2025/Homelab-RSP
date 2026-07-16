import json
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
import uuid

TZ = ZoneInfo("Europe/Paris")
SESSION_FILE = Path("/data/boot_session.json")
HISTORY_FILE = Path("/data/boot_history.json")


def load_session():
    if not SESSION_FILE.exists():
        return {}

    with open(SESSION_FILE, "r") as f:
        return json.load(f)


def save_session(session):
    with open(SESSION_FILE, "w") as f:
        json.dump(session, f, indent=4)


def load_history():
    if not HISTORY_FILE.exists():
        return []

    with open(HISTORY_FILE, "r") as f:
        return json.load(f)


def save_history(history):
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=4)


def append_history(session):
    history = load_history()
    history.append(session)
    save_history(history)


def start_boot_session():
    session = {
        "id": str(uuid.uuid4()),
        "status": "STARTING",
        "wake_sent_at": datetime.now(TZ).isoformat(),
        "pc_online_at": None,
        "rustdesk_ready_at": None,
        "failed_at": None,
        "boot_duration": None,
        "ready_duration": None,
        "total_duration": None,
    }

    save_session(session)

    return session


def mark_online():
    session = load_session()

    if session.get("pc_online_at") is None:
        now = datetime.now(TZ)

        session["pc_online_at"] = now.isoformat()

        wake = datetime.fromisoformat(session["wake_sent_at"])

        session["boot_duration"] = int((now - wake).total_seconds())

    session["status"] = "ONLINE"

    save_session(session)


def mark_ready():
    session = load_session()

    if session.get("rustdesk_ready_at") is None:
        now = datetime.now(TZ)

        session["rustdesk_ready_at"] = now.isoformat()

        online = datetime.fromisoformat(session["pc_online_at"])
        wake = datetime.fromisoformat(session["wake_sent_at"])

        session["ready_duration"] = int((now - online).total_seconds())

        session["total_duration"] = int((now - wake).total_seconds())

    session["status"] = "READY"

    append_history(session)
    finished_session = session.copy()
    end_session()

    return finished_session


def mark_failed():
     session["failed_at"] = datetime.now(TZ).isoformat()
     session["status"] = "FAILED"
     
     append_history(session)
     
     finished_session = session.copy()
     
     end_session()
     
     return finished_session


def update_session(pc_status):
    session = load_session()

    if not session:
        return session

    status = session.get("status")

    if pc_status["state"] == "OFFLINE":
        return session

    if status == "STARTING":
        mark_online()
        session = load_session()

    if session.get("status") == "ONLINE" and pc_status["rustdesk"]["ready"]:
        mark_ready()
        session = load_session()
        
    if session.get("status") == "STARTING":
        wake = datetime.fromisoformat(session["wake_sent_at"])
        session["elapsed"] = int(
            (datetime.now(TZ) - wake).total_seconds()
        )
        save_session(session)

    return session

def end_session():
    save_session({})
