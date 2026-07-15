from flask import Blueprint, jsonify

from services.wol import wake_pc

wake = Blueprint("wake", __name__)


@wake.route("/api/wake", methods=["POST"])
def wake_route():

    wake_pc()

    return jsonify({
        "message": "Magic packet sent",
        "status_code": 200
    })
