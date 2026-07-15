from flask import Blueprint, jsonify

from services.pc_monitor import get_pc_status

pc = Blueprint("pc", __name__)


@pc.route("/api/pc/status")
def status():

    try:
        return jsonify(get_pc_status())

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500
