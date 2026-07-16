from flask import Blueprint, jsonify

from services.wol import wake_pc

wake = Blueprint("wake", __name__)


@wake.route("/api/wake", methods=["POST"])
def wake_route():

    result = wake_pc()

    if result["success"]:
        return jsonify(result), 200

    return jsonify(result), 409
